export const evidenceRelationships = ["supporting", "contradicting", "contextual", "unclear"] as const;
export const evidenceMaterialityLevels = ["low", "medium", "high"] as const;

export type EvidenceMappingInput = {
  thesis: {
    id: string;
    ticker: string;
    narrative: string;
    timeHorizon: string | null;
    version: number;
  };
  assumptions: {
    id: string;
    statement: string;
    expectedOutcome: string | null;
    metric: string | null;
    retiredAt: Date | null;
  }[];
  evidence: {
    id: string;
    ticker: string;
    sourceId: string;
    sourceUrl: string;
    sourceLocator: string | null;
    claim: string;
    excerpt: string;
    kind: "filing_metadata" | "excerpt";
  }[];
};

export type EvidenceAssumptionMapping = {
  evidenceId: string;
  assumptionId: string;
  relationship: (typeof evidenceRelationships)[number];
  materiality: (typeof evidenceMaterialityLevels)[number];
  rationale: string;
  confidence: number;
  sourceQuote: string | null;
};

export type EvidenceMappingResult = {
  thesisId: string;
  thesisVersion: number;
  provider: "groq";
  model: string;
  promptVersion: string;
  mappings: (EvidenceAssumptionMapping & {
    sourceId: string;
    sourceUrl: string;
    sourceLocator: string | null;
  })[];
};
