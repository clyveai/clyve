import { fetchSec, SecRequestError } from "./sec-request";

const SEC_SUBMISSIONS_URL = "https://data.sec.gov/submissions";

export type SecSubmissionFiling = {
  accessionNumber: string;
  form: string;
  filingDate: string;
  reportDate: string | null;
  acceptanceDateTime: string | null;
  primaryDocument: string | null;
  primaryDocDescription: string | null;
  items: string | null;
};

export class SecSubmissionsUnavailableError extends Error {
  constructor() {
    super("SEC submissions are currently unavailable.");
    this.name = "SecSubmissionsUnavailableError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCik(value: string) {
  const cik = value.trim();
  if (!/^\d{10}$/.test(cik)) {
    throw new SecSubmissionsUnavailableError();
  }

  return cik;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => (typeof item === "string" ? item.trim() : "")) : [];
}

function optionalValue(values: string[], index: number) {
  return values[index] || null;
}

export async function getRecentSecSubmissions(cik: string): Promise<SecSubmissionFiling[]> {
  let response: Response;

  try {
    response = await fetchSec(`${SEC_SUBMISSIONS_URL}/CIK${normalizeCik(cik)}.json`, {
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof SecRequestError) {
      throw new SecSubmissionsUnavailableError();
    }

    throw error;
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new SecSubmissionsUnavailableError();
  }

  if (!isRecord(payload) || !isRecord(payload.filings) || !isRecord(payload.filings.recent)) {
    throw new SecSubmissionsUnavailableError();
  }

  const recent = payload.filings.recent;
  const accessionNumbers = stringArray(recent.accessionNumber);
  const forms = stringArray(recent.form);
  const filingDates = stringArray(recent.filingDate);
  const reportDates = stringArray(recent.reportDate);
  const acceptanceDateTimes = stringArray(recent.acceptanceDateTime);
  const primaryDocuments = stringArray(recent.primaryDocument);
  const primaryDocDescriptions = stringArray(recent.primaryDocDescription);
  const items = stringArray(recent.items);

  return accessionNumbers.flatMap((accessionNumber, index) => {
    const form = forms[index];
    const filingDate = filingDates[index];

    if (!/^\d{10}-\d{2}-\d{6}$/.test(accessionNumber) || !form || !/^\d{4}-\d{2}-\d{2}$/.test(filingDate)) {
      return [];
    }

    return [
      {
        accessionNumber,
        form,
        filingDate,
        reportDate: optionalValue(reportDates, index),
        acceptanceDateTime: optionalValue(acceptanceDateTimes, index),
        primaryDocument: optionalValue(primaryDocuments, index),
        primaryDocDescription: optionalValue(primaryDocDescriptions, index),
        items: optionalValue(items, index),
      },
    ];
  });
}
