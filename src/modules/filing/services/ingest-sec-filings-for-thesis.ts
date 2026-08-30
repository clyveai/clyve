import {
  getSecFilingDocument,
  getSecFilingDocumentUrl,
  getSecFilingIndexUrl,
} from "@/infrastructure/sec/filing-document-client";
import { parseSecFilingDocument } from "@/infrastructure/sec/filing-document-parser";
import {
  getRecentSecSubmissions,
  SecSubmissionsUnavailableError,
  type SecSubmissionFiling,
} from "@/infrastructure/sec/submissions-client";
import { getActiveThesisFilingTargetForUser } from "@/modules/thesis/services/get-active-thesis-filing-target";
import { filingRepository } from "../repositories/filing-repository";
import { extractSecFilingEvidence } from "./extract-sec-filing-evidence";
import { secFilingExtractorVersion, type SecFilingSyncResult } from "../types";

const supportedForms = new Set(["10-K", "10-K/A", "10-Q", "10-Q/A", "8-K", "8-K/A"]);
const MAX_FILINGS_PER_SYNC = 6;

export class SecFilingIngestionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecFilingIngestionError";
  }
}

function sourceKey(accessionNumber: string) {
  return `sec-edgar:${accessionNumber}`;
}

function filingDate(value: string) {
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sortFilings(left: SecSubmissionFiling, right: SecSubmissionFiling) {
  const rightTimestamp = right.acceptanceDateTime ?? right.filingDate;
  const leftTimestamp = left.acceptanceDateTime ?? left.filingDate;
  return rightTimestamp.localeCompare(leftTimestamp);
}

function selectFilings(filings: SecSubmissionFiling[]) {
  const sorted = [...filings].sort(sortFilings);
  const selected: SecSubmissionFiling[] = [];

  for (const form of ["10-K", "10-Q"]) {
    const filing = sorted.find((candidate) => candidate.form === form || candidate.form === `${form}/A`);
    if (filing) {
      selected.push(filing);
    }
  }

  for (const filing of sorted) {
    if (selected.some((selectedFiling) => selectedFiling.accessionNumber === filing.accessionNumber)) {
      continue;
    }

    selected.push(filing);

    if (selected.length === MAX_FILINGS_PER_SYNC) {
      break;
    }
  }

  return selected;
}

function sourceTitle(filing: SecSubmissionFiling) {
  return `SEC ${filing.form} filed ${filing.filingDate}`;
}

function eventTitle(ticker: string, filing: SecSubmissionFiling) {
  return `${ticker} ${filing.form} filed ${filing.filingDate}`;
}

function eventSummary(filing: SecSubmissionFiling) {
  return filing.reportDate
    ? `${filing.form} filed with the SEC for the period reported ${filing.reportDate}.`
    : `${filing.form} filed with the SEC.`;
}

export async function ingestSecFilingsForThesis(userId: string, thesisId: string): Promise<SecFilingSyncResult> {
  const target = await getActiveThesisFilingTargetForUser(thesisId, userId);
  if (!target) {
    throw new SecFilingIngestionError("This thesis is not active or does not have a verified SEC identity.");
  }

  let submissions: SecSubmissionFiling[];

  try {
    submissions = await getRecentSecSubmissions(target.companyCik);
  } catch (error) {
    if (error instanceof SecSubmissionsUnavailableError) {
      throw new SecFilingIngestionError("SEC filing data is currently unavailable. Please try again.");
    }

    throw error;
  }

  const candidates = submissions.filter((filing) => supportedForms.has(filing.form));
  const sourceKeys = candidates.map((filing) => sourceKey(filing.accessionNumber));
  const processedSourceKeys = await filingRepository.findProcessedSourceKeysForTicker(target.ticker, sourceKeys);
  const unprocessed = candidates.filter((filing) => !processedSourceKeys.has(sourceKey(filing.accessionNumber)));
  const selected = selectFilings(unprocessed);
  const storedSources = await filingRepository.findSourcesByKeys(selected.map((filing) => sourceKey(filing.accessionNumber)));

  const result: SecFilingSyncResult = {
    sourceCount: 0,
    eventCount: 0,
    evidenceCount: 0,
    skippedFilingCount: 0,
    failedFilingCount: 0,
    remainingFilingCount: Math.max(0, unprocessed.length - selected.length),
  };

  for (const filing of selected) {
    if (!filing.primaryDocument) {
      result.skippedFilingCount += 1;
      continue;
    }

    const key = sourceKey(filing.accessionNumber);
    const storedSource = storedSources.get(key);

    try {
      const document = storedSource?.content && storedSource.contentHash
        ? {
            url: getSecFilingDocumentUrl(target.companyCik, filing.accessionNumber, filing.primaryDocument),
            content: storedSource.content,
            contentHash: storedSource.contentHash,
            contentType: "text/plain",
          }
        : await getSecFilingDocument(target.companyCik, filing.accessionNumber, filing.primaryDocument);
      const parsedDocument = parseSecFilingDocument(document.content, document.contentType);
      const occurredAt = filingDate(filing.filingDate);
      const evidence = extractSecFilingEvidence({
        ticker: target.ticker,
        sourceKey: key,
        form: filing.form,
        accessionNumber: filing.accessionNumber,
        filingDate: filing.filingDate,
        reportDate: filing.reportDate,
        acceptanceDateTime: filing.acceptanceDateTime,
        occurredAt,
        sections: parsedDocument.sections,
      });
      const persisted = await filingRepository.persistSecFiling({
        ticker: target.ticker,
        source: {
          sourceKey: key,
          title: sourceTitle(filing),
          url: document.url,
          publishedAt: occurredAt,
          content: parsedDocument.text,
          contentHash: document.contentHash,
          metadata: {
            cik: target.companyCik,
            accessionNumber: filing.accessionNumber,
            form: filing.form,
            filingDate: filing.filingDate,
            reportDate: filing.reportDate,
            acceptanceDateTime: filing.acceptanceDateTime,
            primaryDocument: filing.primaryDocument,
            primaryDocDescription: filing.primaryDocDescription,
            items: filing.items,
            indexUrl: getSecFilingIndexUrl(target.companyCik, filing.accessionNumber),
            extractorVersion: secFilingExtractorVersion,
          },
        },
        event: {
          title: eventTitle(target.ticker, filing),
          summary: eventSummary(filing),
          occurredAt,
        },
        evidence,
      });

      if (persisted.sourceHashMismatch) {
        result.failedFilingCount += 1;
        continue;
      }

      if (persisted.sourceCreated) {
        result.sourceCount += 1;
      }

      if (persisted.eventCreated) {
        result.eventCount += 1;
      }

      result.evidenceCount += persisted.evidenceInserted;
    } catch (error) {
      console.error("Failed to ingest SEC filing", { accessionNumber: filing.accessionNumber, error });
      result.failedFilingCount += 1;
    }
  }

  return result;
}
