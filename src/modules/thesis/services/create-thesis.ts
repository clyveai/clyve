import { resolveSecCompanyIdentity } from "@/modules/company/services/resolve-sec-company-identity";
import { thesisRepository } from "../repositories/thesis-repository";
import type { CreateThesisInput } from "../types";

/** Applies thesis-domain rules before persisting the first thesis version. */
export async function createThesis(userId: string, input: CreateThesisInput) {
  if (input.assumptions.length === 0) {
    throw new Error("A thesis requires at least one monitoring assumption.");
  }

  const company = await resolveSecCompanyIdentity(input.ticker);

  return thesisRepository.createWithAssumptions({
    ...input,
    userId,
    ticker: company.ticker,
    companyName: company.companyName,
    companyCik: company.cik,
  });
}
