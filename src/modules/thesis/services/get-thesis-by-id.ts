import { thesisRepository } from "../repositories/thesis-repository";

export function getThesisByIdForUser(thesisId: string, userId: string) {
  return thesisRepository.findByIdForUser(thesisId, userId);
}
