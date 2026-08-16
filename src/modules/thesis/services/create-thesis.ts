import { thesisRepository } from "../repositories/thesis-repository";
import type { CreateThesisInput } from "../types";

/** Applies thesis-domain rules before persisting the first thesis version. */
export async function createThesis(userId: string, input: CreateThesisInput) {
  if (input.assumptions.length === 0) {
    throw new Error("A thesis requires at least one monitoring assumption.");
  }

  return thesisRepository.createWithAssumptions({ ...input, userId });
}
