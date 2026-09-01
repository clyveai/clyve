import { filingRepository } from "../repositories/filing-repository";

export function getSecFilingHistoryForThesis(userId: string, thesisId: string) {
  return filingRepository.findSecFilingsForThesis(userId, thesisId);
}
