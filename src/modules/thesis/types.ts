export const thesisPositions = ["long", "short", "watching"] as const;
export type ThesisPosition = (typeof thesisPositions)[number];

export const assumptionImportanceLevels = ["critical", "high", "medium", "low"] as const;
export type AssumptionImportance = (typeof assumptionImportanceLevels)[number];

export type ThesisAssumptionInput = {
  statement: string;
  expectedOutcome?: string;
  metric?: string;
  importance: AssumptionImportance;
};

export type ThesisAssumptionUpdateInput = ThesisAssumptionInput & {
  id?: string;
};

export type CreateThesisInput = {
  ticker: string;
  position: ThesisPosition;
  title: string;
  thesis: string;
  timeHorizon?: string;
  assumptions: ThesisAssumptionInput[];
};

export type UpdateThesisInput = {
  version: number;
  thesis: string;
  timeHorizon?: string;
  assumptions: ThesisAssumptionUpdateInput[];
};

export type ThesisAssumptionDetail = {
  id: string;
  statement: string;
  expectedOutcome: string | null;
  metric: string | null;
  importance: AssumptionImportance;
  retiredAt: Date | null;
};

export type ThesisDetail = {
  id: string;
  ticker: string;
  companyName: string | null;
  companyCik: string | null;
  position: ThesisPosition;
  title: string;
  thesis: string;
  timeHorizon: string | null;
  status: "active" | "paused" | "archived";
  health: "unknown" | "aligned" | "watch" | "diverged";
  version: number;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assumptions: ThesisAssumptionDetail[];
  retiredAssumptions: ThesisAssumptionDetail[];
};

export type ThesisListItem = {
  id: string;
  ticker: string;
  companyName: string | null;
  companyCik: string | null;
  position: ThesisPosition;
  title: string;
  status: "active" | "paused" | "archived";
  health: "unknown" | "aligned" | "watch" | "diverged";
  updatedAt: Date;
};

export type ThesisFilingTarget = {
  id: string;
  ticker: string;
  companyCik: string;
};
