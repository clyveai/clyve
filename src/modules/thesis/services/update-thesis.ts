import { thesisRepository } from "../repositories/thesis-repository";
import type { UpdateThesisInput } from "../types";

export async function updateThesis(userId: string, thesisId: string, input: UpdateThesisInput) {
  if (input.assumptions.length === 0) {
    throw new Error("A thesis requires at least one monitoring assumption.");
  }

  return thesisRepository.updateForUserWithAssumptions({ ...input, thesisId, userId });
}
