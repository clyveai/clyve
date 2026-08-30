import { thesisRepository } from "../repositories/thesis-repository";

export function getActiveThesisFilingTargetForUser(thesisId: string, userId: string) {
  return thesisRepository.findActiveFilingTargetForUser(thesisId, userId);
}
