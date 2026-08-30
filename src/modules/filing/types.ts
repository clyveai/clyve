export const secFilingExtractorVersion = "sec-filing-v1";

export type SecFilingEvidenceType = "fact" | "guidance" | "risk" | "event" | "other";

export type SecFilingEvidence = {
  type: SecFilingEvidenceType;
  claim: string;
  excerpt: string | null;
  sourceLocator: string | null;
  occurredAt: Date | null;
  fingerprint: string;
  structuredData: Record<string, unknown>;
};

export type SecFilingSyncResult = {
  sourceCount: number;
  eventCount: number;
  evidenceCount: number;
  skippedFilingCount: number;
  failedFilingCount: number;
  remainingFilingCount: number;
};
