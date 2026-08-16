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

export type CreateThesisInput = {
  ticker: string;
  companyName?: string;
  position: ThesisPosition;
  title: string;
  thesis: string;
  timeHorizon?: string;
  assumptions: ThesisAssumptionInput[];
};

export type ThesisDetail = {
  id: string;
  ticker: string;
  companyName: string | null;
  position: ThesisPosition;
  title: string;
  thesis: string;
  timeHorizon: string | null;
  status: "active" | "paused" | "archived";
  health: "unknown" | "aligned" | "watch" | "diverged";
  createdAt: Date;
  updatedAt: Date;
  assumptions: Array<{
    id: string;
    statement: string;
    expectedOutcome: string | null;
    metric: string | null;
    importance: AssumptionImportance;
  }>;
};
