import {
  assumptionImportanceLevels,
  thesisPositions,
  type CreateThesisInput,
  type ThesisAssumptionInput,
} from "../types";
import { isTickerSyntaxValid, normalizeTicker } from "@/modules/company/types";

export type CreateThesisValidationResult =
  | { success: true; data: CreateThesisInput }
  | { success: false; error: string; fieldErrors: Record<string, string> };

function firstValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalValue(formData: FormData, key: string) {
  const value = firstValue(formData, key);
  return value || undefined;
}

function hasValue<T extends readonly string[]>(values: T, value: string): value is T[number] {
  return (values as readonly string[]).includes(value);
}

/** Parses and validates the Thesis Capture form at the module boundary. */
export function parseCreateThesisFormData(formData: FormData): CreateThesisValidationResult {
  const fieldErrors: Record<string, string> = {};
  const ticker = normalizeTicker(firstValue(formData, "ticker"));
  const title = firstValue(formData, "title");
  const thesis = firstValue(formData, "thesis");
  const position = firstValue(formData, "position");

  if (!isTickerSyntaxValid(ticker)) {
    fieldErrors.ticker = "Enter a valid ticker symbol, for example NVDA or BRK-B.";
  }

  if (title.length < 3 || title.length > 160) {
    fieldErrors.title = "Use a title between 3 and 160 characters.";
  }

  if (thesis.length < 20 || thesis.length > 10000) {
    fieldErrors.thesis = "Describe the thesis in 20 to 10,000 characters.";
  }

  if (!hasValue(thesisPositions, position)) {
    fieldErrors.position = "Choose long, short, or watching.";
  }

  const statements = formData.getAll("assumptionStatement").map((value) => String(value).trim());
  const expectedOutcomes = formData.getAll("assumptionExpectedOutcome").map((value) => String(value).trim());
  const metrics = formData.getAll("assumptionMetric").map((value) => String(value).trim());
  const importances = formData.getAll("assumptionImportance").map((value) => String(value));

  const assumptions: ThesisAssumptionInput[] = statements.flatMap((statement, index) => {
    if (!statement) {
      return [];
    }

    const importance = importances[index] ?? "medium";
    if (statement.length > 2000 || !hasValue(assumptionImportanceLevels, importance)) {
      return [];
    }

    return [
      {
        statement,
        expectedOutcome: expectedOutcomes[index] || undefined,
        metric: metrics[index] || undefined,
        importance,
      },
    ];
  });

  if (statements.some((statement) => !statement) || statements.some((statement) => statement.length > 2000)) {
    fieldErrors.assumptions = "Each assumption is required and must be 2,000 characters or fewer.";
  } else if (assumptions.length === 0) {
    fieldErrors.assumptions = "Add at least one assumption that Clyve can monitor.";
  } else if (assumptions.length > 10) {
    fieldErrors.assumptions = "Start with up to 10 assumptions per thesis.";
  }

  if (Object.keys(fieldErrors).length > 0 || !hasValue(thesisPositions, position)) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      ticker,
      position,
      title,
      thesis,
      timeHorizon: optionalValue(formData, "timeHorizon"),
      assumptions,
    },
  };
}
