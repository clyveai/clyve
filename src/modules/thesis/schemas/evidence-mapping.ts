import {
  evidenceMaterialityLevels,
  evidenceRelationships,
  type EvidenceAssumptionMapping,
  type EvidenceMappingInput,
} from "../evidence-mapping-types";

export class EvidenceMappingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvidenceMappingValidationError";
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function isOptionalText(value: unknown, maxLength: number) {
  return value === null || isText(value, maxLength);
}

function isSourceUrl(value: unknown) {
  if (!isText(value, 2000)) return false;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function validateEvidenceMappingInput(input: EvidenceMappingInput): void {
  if (!isObject(input) || !isObject(input.thesis)
    || !isText(input.thesis.id, 100) || !isText(input.thesis.ticker, 20)
    || !isText(input.thesis.narrative, 10000) || !isOptionalText(input.thesis.timeHorizon, 2000)
    || !Number.isInteger(input.thesis.version) || input.thesis.version < 1) {
    throw new EvidenceMappingValidationError("A valid saved thesis snapshot is required.");
  }

  if (!Array.isArray(input.assumptions) || !Array.isArray(input.evidence)
    || input.assumptions.length < 1 || input.assumptions.length > 4
    || input.evidence.length < 1 || input.evidence.length > 4
    || input.assumptions.length * input.evidence.length > 12) {
    throw new EvidenceMappingValidationError("Use 1 to 4 assumptions and evidence excerpts, with at most 12 pairs per batch.");
  }

  const assumptionIds = new Set<string>();
  for (const assumption of input.assumptions) {
    if (!isObject(assumption) || !isText(assumption.id, 100)
      || assumptionIds.has(assumption.id) || !isText(assumption.statement, 2000)
      || !isOptionalText(assumption.expectedOutcome, 2000) || !isOptionalText(assumption.metric, 2000)
      || assumption.retiredAt !== null) {
      throw new EvidenceMappingValidationError("Use unique, active saved assumptions with valid statements.");
    }
    assumptionIds.add(assumption.id);
  }

  const evidenceIds = new Set<string>();
  for (const item of input.evidence) {
    if (!isObject(item) || !isText(item.id, 100) || evidenceIds.has(item.id)
      || item.ticker !== input.thesis.ticker || !isText(item.sourceId, 100)
      || !isSourceUrl(item.sourceUrl) || !isOptionalText(item.sourceLocator, 2000)
      || !isText(item.claim, 2000) || !isText(item.excerpt, 2000)
      || !["filing_metadata", "excerpt"].includes(item.kind)) {
      throw new EvidenceMappingValidationError("Use unique saved evidence for the thesis ticker, with a source and a short excerpt.");
    }
    evidenceIds.add(item.id);
  }
}

export function createEvidenceMappingJsonSchema(input: EvidenceMappingInput): Record<string, unknown> {
  return {
    type: "object",
    additionalProperties: false,
    required: ["mappings"],
    properties: {
      mappings: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["evidenceId", "assumptionId", "relationship", "materiality", "rationale", "confidence", "sourceQuote"],
          properties: {
            evidenceId: { type: "string", enum: input.evidence.map((item) => item.id) },
            assumptionId: { type: "string", enum: input.assumptions.map((item) => item.id) },
            relationship: { type: "string", enum: [...evidenceRelationships] },
            materiality: { type: "string", enum: [...evidenceMaterialityLevels] },
            rationale: { type: "string" },
            confidence: { type: "integer" },
            sourceQuote: { type: ["string", "null"] },
          },
        },
      },
    },
  };
}

export function parseEvidenceMappingOutput(value: unknown, input: EvidenceMappingInput): EvidenceAssumptionMapping[] {
  const fail = () => {
    throw new EvidenceMappingValidationError("AI mapping failed evidence validation. No results were saved.");
  };

  if (!isObject(value) || Object.keys(value).length !== 1 || !Array.isArray(value.mappings)
    || value.mappings.length !== input.evidence.length * input.assumptions.length) return fail();

  const evidenceById = new Map(input.evidence.map((item) => [item.id, item]));
  const assumptionIds = new Set(input.assumptions.map((item) => item.id));
  const seen = new Set<string>();
  const mappings: EvidenceAssumptionMapping[] = [];
  const keys = ["evidenceId", "assumptionId", "relationship", "materiality", "rationale", "confidence", "sourceQuote"];

  for (const row of value.mappings) {
    if (!isObject(row) || Object.keys(row).length !== keys.length || keys.some((key) => !(key in row))
      || typeof row.evidenceId !== "string" || typeof row.assumptionId !== "string"
      || !assumptionIds.has(row.assumptionId) || !isText(row.rationale, 1600)
      || typeof row.relationship !== "string" || !(evidenceRelationships as readonly string[]).includes(row.relationship)
      || typeof row.materiality !== "string" || !(evidenceMaterialityLevels as readonly string[]).includes(row.materiality)
      || typeof row.confidence !== "number" || !Number.isInteger(row.confidence) || row.confidence < 0 || row.confidence > 100
      || !isOptionalText(row.sourceQuote, 1000)) return fail();

    const item = evidenceById.get(row.evidenceId);
    const pair = JSON.stringify([row.evidenceId, row.assumptionId]);
    if (!item || seen.has(pair)) return fail();
    if (typeof row.sourceQuote === "string" && !item.excerpt.includes(row.sourceQuote)) return fail();
    if (["supporting", "contradicting"].includes(row.relationship)
      && (row.sourceQuote === null || item.kind === "filing_metadata")) return fail();
    if (row.relationship === "unclear" && row.materiality !== "low") return fail();

    seen.add(pair);
    mappings.push(row as EvidenceAssumptionMapping);
  }

  return mappings;
}
