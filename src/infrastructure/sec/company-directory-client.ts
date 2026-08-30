import { unstable_cache } from "next/cache";
import { fetchSec, SecRequestError } from "./sec-request";

const SEC_COMPANY_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json";
const DIRECTORY_REVALIDATE_SECONDS = 60 * 60 * 24;

export type SecCompanyDirectoryEntry = {
  ticker: string;
  companyName: string;
  cik: string;
};

export class SecCompanyDirectoryUnavailableError extends Error {
  constructor(message = "SEC company directory is unavailable.") {
    super(message);
    this.name = "SecCompanyDirectoryUnavailableError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toCik(value: unknown) {
  const cik = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  if (!/^\d{1,10}$/.test(cik)) {
    return null;
  }

  return cik.padStart(10, "0");
}

async function fetchSecCompanyDirectory(): Promise<SecCompanyDirectoryEntry[]> {
  let response: Response;

  try {
    response = await fetchSec(SEC_COMPANY_TICKERS_URL, {
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof SecRequestError) {
      throw new SecCompanyDirectoryUnavailableError(error.message);
    }

    throw new SecCompanyDirectoryUnavailableError();
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new SecCompanyDirectoryUnavailableError();
  }

  if (!isRecord(payload)) {
    throw new SecCompanyDirectoryUnavailableError();
  }

  const directory = Object.values(payload).flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }

    const ticker = typeof entry.ticker === "string" ? entry.ticker.trim().toUpperCase() : "";
    const companyName = typeof entry.title === "string" ? entry.title.trim() : "";
    const cik = toCik(entry.cik_str);

    return ticker && companyName && cik ? [{ ticker, companyName, cik }] : [];
  });

  if (directory.length === 0) {
    throw new SecCompanyDirectoryUnavailableError();
  }

  return directory;
}

const getCachedSecCompanyDirectory = unstable_cache(fetchSecCompanyDirectory, ["sec-company-directory"], {
  revalidate: DIRECTORY_REVALIDATE_SECONDS,
});

export function getSecCompanyDirectory() {
  return getCachedSecCompanyDirectory();
}
