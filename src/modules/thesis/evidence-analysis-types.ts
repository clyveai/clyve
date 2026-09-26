import type { EvidenceAssumptionMapping, EvidenceMappingInput, EvidenceMappingResult } from "./evidence-mapping-types";

export type SavedEvidenceAnalysis = EvidenceAssumptionMapping & {
  id: string;
  assumptionStatement: string;
  assumptionRetired: boolean;
  claim: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceLocator: string | null;
  provider: string | null;
  model: string | null;
  promptVersion: string | null;
  thesisVersion: number | null;
  createdAt: string;
};

export type EvidenceAnalysisOverview = {
  eligibleEvidenceCount: number;
  pendingPairCount: number;
  nextAnalysisAt: string | null;
  mappings: SavedEvidenceAnalysis[];
};

export type EvidenceAnalysisCandidates = {
  evidence: EvidenceMappingInput["evidence"][number];
  assumptions: EvidenceMappingInput["assumptions"];
};

export type EvidenceAnalysisCompletion = {
  savedCount: number;
  pendingPairCount: number;
};

export type PersistEvidenceAnalysisInput = {
  userId: string;
  thesisId: string;
  expectedVersion: number;
  attemptedAt: Date;
  snapshot: EvidenceMappingInput;
  result: EvidenceMappingResult;
};
