import { isGeminiConfigured, maxStructuredAiInputCharacters } from "@/infrastructure/ai/gemini";
import type { EvidenceAnalysisCompletion } from "../evidence-analysis-types";
import type { EvidenceMappingInput } from "../evidence-mapping-types";
import {
  createEvidenceMappingUserPrompt,
  evidenceMappingSystemPrompt,
} from "../prompts/map-evidence-to-assumptions";
import { evidenceAnalysisRepository } from "../repositories/evidence-analysis-repository";
import { thesisRepository } from "../repositories/thesis-repository";
import { createEvidenceMappingJsonSchema, validateEvidenceMappingInput } from "../schemas/evidence-mapping";
import { mapEvidenceToAssumptions } from "./map-evidence-to-assumptions";

export class ThesisEvidenceAnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThesisEvidenceAnalysisError";
  }
}

function requestSize(input: EvidenceMappingInput): number {
  return evidenceMappingSystemPrompt.length
    + createEvidenceMappingUserPrompt(input).length
    + JSON.stringify(createEvidenceMappingJsonSchema(input)).length;
}

export async function analyzeThesisEvidence(
  userId: string,
  thesisId: string,
  expectedVersion: number,
): Promise<EvidenceAnalysisCompletion> {
  const thesis = await thesisRepository.findByIdForUser(thesisId, userId);
  if (!thesis) throw new ThesisEvidenceAnalysisError("This thesis could not be found.");
  if (thesis.status !== "active") throw new ThesisEvidenceAnalysisError("Only active theses can be analyzed. Saved history remains available.");
  if (thesis.version !== expectedVersion) throw new ThesisEvidenceAnalysisError("This thesis has changed. Reload before analyzing evidence.");
  if (!thesis.companyCik) throw new ThesisEvidenceAnalysisError("A verified SEC identity is required before evidence analysis.");
  if (thesis.assumptions.length === 0) throw new ThesisEvidenceAnalysisError("Add an active assumption before analyzing evidence.");
  if (!isGeminiConfigured()) throw new ThesisEvidenceAnalysisError("Configure GEMINI_API_KEY on the server before analyzing evidence.");

  const candidates = await evidenceAnalysisRepository.findNextCandidatesForUser(userId, thesisId);
  if (!candidates) {
    const overview = await evidenceAnalysisRepository.getOverviewForUser(userId, thesisId);
    throw new ThesisEvidenceAnalysisError(overview.eligibleEvidenceCount === 0
      ? "No saved SEC excerpts are available. Sync SEC filings first."
      : "All eligible evidence-assumption pairs already have saved mappings.");
  }

  const snapshot: EvidenceMappingInput = {
    thesis: {
      id: thesis.id,
      ticker: thesis.ticker,
      narrative: thesis.thesis,
      timeHorizon: thesis.timeHorizon,
      version: thesis.version,
    },
    assumptions: candidates.assumptions,
    evidence: [candidates.evidence],
  };

  validateEvidenceMappingInput(snapshot);
  while (requestSize(snapshot) > maxStructuredAiInputCharacters && snapshot.assumptions.length > 1) {
    snapshot.assumptions = snapshot.assumptions.slice(0, -1);
  }
  if (requestSize(snapshot) > maxStructuredAiInputCharacters) {
    throw new ThesisEvidenceAnalysisError("This thesis and assumption are too long for one AI request. Shorten the narrative or assumption fields; source excerpts are never silently truncated.");
  }

  const attemptedAt = new Date();
  const nextAnalysisAt = new Date(attemptedAt.getTime() + 90_000);
  const claimed = await evidenceAnalysisRepository.claimAnalysis(userId, thesisId, expectedVersion, attemptedAt, nextAnalysisAt);
  if (!claimed) throw new ThesisEvidenceAnalysisError("Analysis is already running or cooling down, or the thesis has changed. Reload and wait before trying again.");

  const result = await mapEvidenceToAssumptions(snapshot, { maxCompletionTokens: 8192 });
  const savedCount = await evidenceAnalysisRepository.persistForUser({
    userId,
    thesisId,
    expectedVersion,
    attemptedAt,
    snapshot,
    result,
  });
  const overview = await evidenceAnalysisRepository.getOverviewForUser(userId, thesisId);
  return { savedCount, pendingPairCount: overview.pendingPairCount };
}
