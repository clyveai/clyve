"use server";

import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import {
  CompanyIdentityNotFoundError,
  CompanyIdentityUnavailableError,
  resolveSecCompanyIdentity,
} from "../services/resolve-sec-company-identity";
import { isTickerSyntaxValid, type CompanyIdentity } from "../types";

export type CompanyIdentityResolution =
  | { status: "valid"; identity: CompanyIdentity }
  | { status: "invalid"; message: string }
  | { status: "unavailable"; message: string };

export async function resolveCompanyIdentityAction(ticker: string): Promise<CompanyIdentityResolution> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "unavailable", message: "Your session has expired. Please sign in again." };
  }

  if (!isTickerSyntaxValid(ticker)) {
    return { status: "invalid", message: "Enter a valid ticker symbol, for example NVDA or BRK-B." };
  }

  try {
    const identity = await resolveSecCompanyIdentity(ticker);
    return { status: "valid", identity };
  } catch (error) {
    if (error instanceof CompanyIdentityNotFoundError) {
      return { status: "invalid", message: "This ticker is not listed in the SEC company directory." };
    }

    if (error instanceof CompanyIdentityUnavailableError) {
      return { status: "unavailable", message: "SEC ticker verification is unavailable. Please try again." };
    }

    console.error("Failed to resolve company identity", error);
    return { status: "unavailable", message: "SEC ticker verification is unavailable. Please try again." };
  }
}
