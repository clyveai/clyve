import {
  assumptionImportanceLevels,
  type ThesisAssumptionUpdateInput,
  type UpdateThesisInput,
} from "../types";

export type UpdateThesisValidationResult =
  | { success: true; data: UpdateThesisInput }
  | { success: false; error: string; fieldErrors: Record<string, string> };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export function parseUpdateThesisFormData(formData: FormData): UpdateThesisValidationResult {
  const fieldErrors: Record<string, string> = {};
  const thesis = firstValue(formData, "thesis");
  const timeHorizon = optionalValue(formData, "timeHorizon");
  const versionValue = firstValue(formData, "version");
  const version = Number(versionValue);

  if (thesis.length < 20 || thesis.length > 10_000) {
    fieldErrors.thesis = "Describe the thesis in 20 to 10,000 characters.";
  }

  if (timeHorizon && timeHorizon.length > 160) {
    fieldErrors.timeHorizon = "Use a time horizon of up to 160 characters.";
  }

  if (!Number.isSafeInteger(version) || version < 1) {
    fieldErrors.version = "This thesis is out of date. Reload the page and try again.";
  }

  const assumptionIds = formData.getAll("assumptionId").map((value) => String(value).trim());
  const statements = formData.getAll("assumptionStatement").map((value) => String(value).trim());
  const expectedOutcomes = formData.getAll("assumptionExpectedOutcome").map((value) => String(value).trim());
  const metrics = formData.getAll("assumptionMetric").map((value) => String(value).trim());
  const importances = formData.getAll("assumptionImportance").map((value) => String(value));

  if (assumptionIds.length !== statements.length) {
    fieldErrors.assumptions = "The assumption list is incomplete. Reload the page and try again.";
  }

  const submittedIds = assumptionIds.filter(Boolean);
  if (submittedIds.some((id) => !uuidPattern.test(id)) || new Set(submittedIds).size !== submittedIds.length) {
    fieldErrors.assumptions = "The assumption list is invalid. Reload the page and try again.";
  }

  const assumptions: ThesisAssumptionUpdateInput[] = statements.flatMap((statement, index) => {
    const importance = importances[index] ?? "medium";
    const id = assumptionIds[index] || undefined;

    if (!statement || statement.length > 2_000 || !hasValue(assumptionImportanceLevels, importance)) {
      return [];
    }

    return [
      {
        id,
        statement,
        expectedOutcome: expectedOutcomes[index] || undefined,
        metric: metrics[index] || undefined,
        importance,
      },
    ];
  });

  if (statements.some((statement) => !statement) || statements.some((statement) => statement.length > 2_000)) {
    fieldErrors.assumptions = "Each assumption is required and must be 2,000 characters or fewer.";
  } else if (assumptions.length === 0) {
    fieldErrors.assumptions = "Add at least one assumption that Clyve can monitor.";
  } else if (assumptions.length > 10) {
    fieldErrors.assumptions = "Keep up to 10 active assumptions per thesis.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  return {
    success: true,
    data: {
      version,
      thesis,
      timeHorizon,
      assumptions,
    },
  };
}
