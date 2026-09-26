import { isGeminiConfigured } from "@/infrastructure/ai/gemini";
import { evidenceAnalysisRepository } from "../repositories/evidence-analysis-repository";

export async function getEvidenceAnalysisForThesis(userId: string, thesisId: string) {
  return {
    isAiConfigured: isGeminiConfigured(),
    overview: await evidenceAnalysisRepository.getOverviewForUser(userId, thesisId),
  };
}
