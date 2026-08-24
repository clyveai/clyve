"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  updateThesisAction,
  type UpdateThesisActionState,
} from "../actions/update-thesis";
import type { AssumptionImportance, ThesisDetail } from "../types";

type AssumptionDraft = {
  draftId: string;
  assumptionId?: string;
  statement: string;
  expectedOutcome: string;
  metric: string;
  importance: AssumptionImportance;
};

type ThesisEditDraft = {
  thesis: string;
  timeHorizon: string;
  assumptions: AssumptionDraft[];
};

const initialState: UpdateThesisActionState = {};
const fieldClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-white/45 focus:ring-2 focus:ring-white/10";

function createDraft(thesis: ThesisDetail): ThesisEditDraft {
  return {
    thesis: thesis.thesis,
    timeHorizon: thesis.timeHorizon ?? "",
    assumptions: thesis.assumptions.map((assumption) => ({
      draftId: assumption.id,
      assumptionId: assumption.id,
      statement: assumption.statement,
      expectedOutcome: assumption.expectedOutcome ?? "",
      metric: assumption.metric ?? "",
      importance: assumption.importance,
    })),
  };
}

export function ThesisEditForm({ thesis }: { thesis: ThesisDetail }) {
  const [state, formAction, isPending] = useActionState(updateThesisAction.bind(null, thesis.id), initialState);
  const [draft, setDraft] = useState<ThesisEditDraft>(() => createDraft(thesis));

  const updateDraft = <Field extends Exclude<keyof ThesisEditDraft, "assumptions">>(
    field: Field,
    value: ThesisEditDraft[Field],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateAssumption = <Field extends Exclude<keyof AssumptionDraft, "draftId" | "assumptionId">>(
    draftId: string,
    field: Field,
    value: AssumptionDraft[Field],
  ) => {
    setDraft((current) => ({
      ...current,
      assumptions: current.assumptions.map((assumption) =>
        assumption.draftId === draftId ? { ...assumption, [field]: value } : assumption,
      ),
    }));
  };

  const addAssumption = () => {
    setDraft((current) => ({
      ...current,
      assumptions: [
        ...current.assumptions,
        {
          draftId: crypto.randomUUID(),
          statement: "",
          expectedOutcome: "",
          metric: "",
          importance: "high",
        },
      ],
    }));
  };

  const removeAssumption = (draftId: string) => {
    setDraft((current) => ({
      ...current,
      assumptions:
        current.assumptions.length === 1
          ? current.assumptions
          : current.assumptions.filter((assumption) => assumption.draftId !== draftId),
    }));
  };

  return (
    <form action={formAction} className="mx-auto w-full max-w-4xl space-y-8">
      <input type="hidden" name="version" value={thesis.version} />

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-7">
        <Link href={`/thesis/${thesis.id}`} className="text-sm text-zinc-400 transition hover:text-white">
          Back to thesis
        </Link>
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.24em] text-amber-200/80">Thesis management</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Edit {thesis.ticker} thesis</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Update the narrative, time horizon, and monitoring assumptions. Ticker, position, and title remain part of the original record.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-7">
        <div className="grid gap-5 sm:grid-cols-[0.55fr_1fr]">
          <label className="block text-sm font-medium text-zinc-200">
            Time horizon <span className="font-normal text-zinc-500">(optional)</span>
            <input
              name="timeHorizon"
              value={draft.timeHorizon}
              onChange={(event) => updateDraft("timeHorizon", event.target.value)}
              placeholder="12-24 months"
              className={fieldClassName}
            />
            {state.fieldErrors?.timeHorizon ? <p className="mt-2 text-xs text-red-300">{state.fieldErrors.timeHorizon}</p> : null}
          </label>

          <label className="block text-sm font-medium text-zinc-200">
            Thesis narrative
            <textarea
              name="thesis"
              required
              rows={6}
              value={draft.thesis}
              onChange={(event) => updateDraft("thesis", event.target.value)}
              className={fieldClassName}
            />
            {state.fieldErrors?.thesis ? <p className="mt-2 text-xs text-red-300">{state.fieldErrors.thesis}</p> : null}
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-200/80">Monitoring inputs</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Key assumptions</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              If a changed assumption already has evidence, Clyve retires that version and keeps its evidence attached to it.
            </p>
          </div>
          <button
            type="button"
            onClick={addAssumption}
            disabled={draft.assumptions.length >= 10}
            className="h-10 rounded-xl border border-white/15 px-4 text-sm font-medium text-zinc-100 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add assumption
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {draft.assumptions.map((assumption, index) => (
            <div key={assumption.draftId} className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <input type="hidden" name="assumptionId" value={assumption.assumptionId ?? ""} />
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-zinc-200">Assumption {index + 1}</p>
                {draft.assumptions.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeAssumption(assumption.draftId)}
                    className="text-xs font-medium text-zinc-400 transition hover:text-red-300"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <label className="mt-4 block text-sm text-zinc-300">
                Assumption statement
                <textarea
                  name="assumptionStatement"
                  required
                  rows={3}
                  value={assumption.statement}
                  onChange={(event) => updateAssumption(assumption.draftId, "statement", event.target.value)}
                  className={fieldClassName}
                />
              </label>

              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_0.7fr_0.45fr]">
                <label className="block text-sm text-zinc-300">
                  Expected outcome <span className="text-zinc-500">(optional)</span>
                  <input
                    name="assumptionExpectedOutcome"
                    value={assumption.expectedOutcome}
                    onChange={(event) => updateAssumption(assumption.draftId, "expectedOutcome", event.target.value)}
                    className={fieldClassName}
                  />
                </label>
                <label className="block text-sm text-zinc-300">
                  Metric <span className="text-zinc-500">(optional)</span>
                  <input
                    name="assumptionMetric"
                    value={assumption.metric}
                    onChange={(event) => updateAssumption(assumption.draftId, "metric", event.target.value)}
                    className={fieldClassName}
                  />
                </label>
                <label className="block text-sm text-zinc-300">
                  Importance
                  <select
                    name="assumptionImportance"
                    value={assumption.importance}
                    onChange={(event) =>
                      updateAssumption(assumption.draftId, "importance", event.target.value as AssumptionImportance)
                    }
                    className={fieldClassName}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>

        {state.fieldErrors?.assumptions ? <p className="mt-4 text-sm text-red-300">{state.fieldErrors.assumptions}</p> : null}
      </section>

      {state.error ? <p role="alert" className="rounded-xl border border-red-400/20 bg-red-950/30 px-4 py-3 text-sm text-red-200">{state.error}</p> : null}

      <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
        <Link href={`/thesis/${thesis.id}`} className="text-sm font-medium text-zinc-400 transition hover:text-white">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving changes..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
