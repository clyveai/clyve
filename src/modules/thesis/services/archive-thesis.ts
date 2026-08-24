import { thesisRepository } from "../repositories/thesis-repository";

export async function archiveThesis(userId: string, thesisId: string, version: number) {
  const archivedThesis = await thesisRepository.archiveForUser(thesisId, userId, version);

  if (!archivedThesis) {
    throw new Error("This thesis was changed or archived in another session. Reload and try again.");
  }

  return archivedThesis;
}
