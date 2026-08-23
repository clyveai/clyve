import { thesisRepository } from "../repositories/thesis-repository";

/** Returns the current investor's most recently updated thesis documents. */
export function getUserTheses(userId: string) {
  return thesisRepository.findManyForUser(userId);
}
