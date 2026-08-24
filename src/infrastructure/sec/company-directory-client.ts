import { unstable_cache } from "next/cache";

const SEC_COMPANY_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json";
const DIRECTORY_REVALIDATE_SECONDS = 60 * 60 * 24;
const SEC_REQUEST_TIMEOUT_MS = 8_000;

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

function getSecUserAgent() {
  const userAgent = process.env.SEC_USER_AGENT?.trim();
  if (!userAgent) {
    throw new SecCompanyDirectoryUnavailableError("SEC_USER_AGENT is not configured.");
  }

  return userAgent;
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEC_REQUEST_TIMEOUT_MS);

  try {
    response = await fetch(SEC_COMPANY_TICKERS_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": getSecUserAgent(),
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof SecCompanyDirectoryUnavailableError) {
      throw error;
    }

    throw new SecCompanyDirectoryUnavailableError();
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
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
