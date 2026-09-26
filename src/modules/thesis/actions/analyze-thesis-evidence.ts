"use server";

import { revalidatePath } from "next/cache";
import { GeminiClientError } from "@/infrastructure/ai/gemini";
import { getCurrentUser } from "@/modules/auth/services/get-current-user";
import type { EvidenceAnalysisCompletion } from "../evidence-analysis-types";
import { EvidenceAnalysisStorageError } from "../repositories/evidence-analysis-repository";
import { EvidenceMappingValidationError } from "../schemas/evidence-mapping";
import { analyzeThesisEvidence, ThesisEvidenceAnalysisError } from "../services/analyze-thesis-evidence";

export type AnalyzeThesisEvidenceActionState = {
  error?: string;
  result?: EvidenceAnalysisCompletion;
};

export async function analyzeThesisEvidenceAction(
  thesisId: string,
  thesisVersion: number,
  _previousState: AnalyzeThesisEvidenceActionState,
  _formData: FormData,
): Promise<AnalyzeThesisEvidenceActionState> {
  if (typeof thesisId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(thesisId)
    || !Number.isSafeInteger(thesisVersion) || thesisVersion < 1 || thesisVersion > 2_147_483_647) {
    return { error: "Invalid thesis. Reload the page and try again." };
  }

  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Your session has expired. Please sign in again." };

    const result = await analyzeThesisEvidence(user.id, thesisId, thesisVersion);
    revalidatePath(`/thesis/${thesisId}`);
    return { result };
  } catch (error) {
    revalidatePath(`/thesis/${thesisId}`);
    return {
      error: error instanceof ThesisEvidenceAnalysisError
        || error instanceof EvidenceMappingValidationError
        || error instanceof EvidenceAnalysisStorageError
        || error instanceof GeminiClientError
        ? error.message
        : "Evidence analysis could not be completed. Reload the page to check saved results before retrying.",
    };
  }
}
