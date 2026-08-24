import {
  getSecCompanyDirectory,
  SecCompanyDirectoryUnavailableError,
} from "@/infrastructure/sec/company-directory-client";
import {
  isTickerSyntaxValid,
  normalizeTicker,
  type CompanyIdentity,
} from "../types";

export class CompanyIdentityNotFoundError extends Error {
  constructor() {
    super("Ticker was not found in the SEC company directory.");
    this.name = "CompanyIdentityNotFoundError";
  }
}

export class CompanyIdentityUnavailableError extends Error {
  constructor() {
    super("SEC ticker verification is currently unavailable.");
    this.name = "CompanyIdentityUnavailableError";
  }
}

function tickerCandidates(ticker: string) {
  const candidates = [ticker];
  const periodAlias = ticker.replace(/\./g, "-");

  if (periodAlias !== ticker) {
    candidates.push(periodAlias);
  }

  return candidates;
}

export async function resolveSecCompanyIdentity(value: string): Promise<CompanyIdentity> {
  const ticker = normalizeTicker(value);
  if (!isTickerSyntaxValid(ticker)) {
    throw new CompanyIdentityNotFoundError();
  }

  let directory;

  try {
    directory = await getSecCompanyDirectory();
  } catch (error) {
    if (error instanceof SecCompanyDirectoryUnavailableError) {
      throw new CompanyIdentityUnavailableError();
    }

    throw error;
  }

  for (const candidate of tickerCandidates(ticker)) {
    const matches = directory.filter((company) => company.ticker === candidate);

    if (matches.length === 1) {
      return matches[0];
    }

    if (matches.length > 1) {
      throw new CompanyIdentityUnavailableError();
    }
  }

  throw new CompanyIdentityNotFoundError();
}
