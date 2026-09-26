import { generateStructuredJson } from "@/infrastructure/ai/groq";
import type { EvidenceMappingInput, EvidenceMappingResult } from "../evidence-mapping-types";
import {
  createEvidenceMappingUserPrompt,
  evidenceMappingPromptVersion,
  evidenceMappingSystemPrompt,
} from "../prompts/map-evidence-to-assumptions";
import {
  createEvidenceMappingJsonSchema,
  parseEvidenceMappingOutput,
  validateEvidenceMappingInput,
} from "../schemas/evidence-mapping";

export async function mapEvidenceToAssumptions(input: EvidenceMappingInput): Promise<EvidenceMappingResult> {
  validateEvidenceMappingInput(input);

  const snapshot: EvidenceMappingInput = {
    thesis: {
      id: input.thesis.id,
      ticker: input.thesis.ticker,
      narrative: input.thesis.narrative,
      timeHorizon: input.thesis.timeHorizon,
      version: input.thesis.version,
    },
    assumptions: input.assumptions.map(({ id, statement, expectedOutcome, metric, retiredAt }) => ({
      id, statement, expectedOutcome, metric, retiredAt,
    })),
    evidence: input.evidence.map(({ id, ticker, sourceId, sourceUrl, sourceLocator, claim, excerpt, kind }) => ({
      id, ticker, sourceId, sourceUrl, sourceLocator, claim, excerpt, kind,
    })),
  };

  const response = await generateStructuredJson({
    systemPrompt: evidenceMappingSystemPrompt,
    userPrompt: createEvidenceMappingUserPrompt(snapshot),
    schemaName: "evidence_mapping",
    jsonSchema: createEvidenceMappingJsonSchema(snapshot),
    maxCompletionTokens: 4096,
  });

  const mappings = parseEvidenceMappingOutput(response.data, snapshot);
  const evidenceById = new Map(snapshot.evidence.map((item) => [item.id, item]));

  return {
    thesisId: snapshot.thesis.id,
    thesisVersion: snapshot.thesis.version,
    provider: response.provider,
    model: response.model,
    promptVersion: evidenceMappingPromptVersion,
    mappings: mappings.map((mapping) => {
      const item = evidenceById.get(mapping.evidenceId)!;
      return {
        ...mapping,
        sourceId: item.sourceId,
        sourceUrl: item.sourceUrl,
        sourceLocator: item.sourceLocator,
      };
    }),
  };
}
