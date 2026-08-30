import { createHash } from "node:crypto";
import type { SecFilingDocumentSection } from "@/infrastructure/sec/filing-document-parser";
import { secFilingExtractorVersion, type SecFilingEvidence, type SecFilingEvidenceType } from "../types";

type ExtractSecFilingEvidenceInput = {
  ticker: string;
  sourceKey: string;
  form: string;
  accessionNumber: string;
  filingDate: string;
  reportDate: string | null;
  acceptanceDateTime: string | null;
  occurredAt: Date | null;
  sections: SecFilingDocumentSection[];
};

function normalizeEvidenceText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function fingerprint(parts: string[]) {
  return createHash("sha256").update(parts.join("\n")).digest("hex");
}

function firstSentence(value: string) {
  const text = normalizeEvidenceText(value);
  const match = text.match(/^(.{1,700}?[.!?])(?:\s|$)/);
  return (match?.[1] ?? text.slice(0, 700)).trim();
}

function excerpt(value: string) {
  const text = normalizeEvidenceText(value);
  return text.length > 1_500 ? `${text.slice(0, 1_500).trim()}…` : text;
}

function evidenceType(locator: string): SecFilingEvidenceType {
  const normalizedLocator = locator.toLowerCase();
  if (normalizedLocator.includes("risk factor") || /item\s+1a/.test(normalizedLocator)) {
    return "risk";
  }

  if (/item\s+(2\.02|7\.01)/.test(normalizedLocator) || normalizedLocator.includes("guidance")) {
    return "guidance";
  }

  return "fact";
}

function sectionPriority(form: string, locator: string) {
  const normalizedLocator = locator.toLowerCase();

  if (form.startsWith("8-K")) {
    if (/item\s+2\.02/.test(normalizedLocator)) {
      return 0;
    }

    if (/item\s+7\.01/.test(normalizedLocator)) {
      return 1;
    }

    if (/item\s+8\.01/.test(normalizedLocator)) {
      return 2;
    }
  }

  if (form.startsWith("10-K") || form.startsWith("10-Q")) {
    if (/item\s+1a/.test(normalizedLocator) || normalizedLocator.includes("risk factor")) {
      return 0;
    }

    if (normalizedLocator.includes("management") || normalizedLocator.includes("discussion")) {
      return 1;
    }
  }

  return 10;
}

function createEvidence(
  input: ExtractSecFilingEvidenceInput,
  type: SecFilingEvidenceType,
  claim: string,
  body: string | null,
  locator: string,
  structuredData: Record<string, unknown>,
): SecFilingEvidence {
  return {
    type,
    claim,
    excerpt: body,
    sourceLocator: locator,
    occurredAt: input.occurredAt,
    fingerprint: fingerprint([
      input.sourceKey,
      input.ticker,
      type,
      locator,
      claim,
      body ?? "",
    ]),
    structuredData,
  };
}

export function extractSecFilingEvidence(input: ExtractSecFilingEvidenceInput) {
  const filingMetadata = {
    accessionNumber: input.accessionNumber,
    form: input.form,
    filingDate: input.filingDate,
    reportDate: input.reportDate,
    acceptanceDateTime: input.acceptanceDateTime,
    extractorVersion: secFilingExtractorVersion,
  };
  const metadataExcerpt = `Form ${input.form}; filed ${input.filingDate}${input.reportDate ? `; report date ${input.reportDate}` : ""}; accession ${input.accessionNumber}.`;
  const evidence = [
    createEvidence(
      input,
      "event",
      `${input.ticker} filed a ${input.form} with the SEC on ${input.filingDate}.`,
      metadataExcerpt,
      "SEC submission metadata",
      { ...filingMetadata, evidenceKind: "filing_metadata" },
    ),
  ];
  const sections = input.sections
    .filter((section) => section.text.length >= 120)
    .sort((left, right) => {
      const priorityDifference = sectionPriority(input.form, left.locator) - sectionPriority(input.form, right.locator);
      return priorityDifference !== 0 ? priorityDifference : right.text.length - left.text.length;
    })
    .slice(0, 3);

  for (const section of sections) {
    const claim = firstSentence(section.text);
    if (!claim) {
      continue;
    }

    evidence.push(
      createEvidence(
        input,
        evidenceType(section.locator),
        claim,
        excerpt(section.text),
        section.locator,
        { ...filingMetadata, evidenceKind: "literal_excerpt", section: section.locator },
      ),
    );
  }

  return evidence;
}
