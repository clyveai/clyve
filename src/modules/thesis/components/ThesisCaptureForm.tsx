"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import {
  resolveCompanyIdentityAction,
  type CompanyIdentityResolution,
} from "@/modules/company/actions/resolve-company-identity";
import { isTickerSyntaxValid, normalizeTicker } from "@/modules/company/types";
import {
  createThesisAction,
  type CreateThesisActionState,
} from "../actions/create-thesis";
import type { AssumptionImportance, ThesisPosition } from "../types";

type AssumptionDraft = {
  id: string;
  statement: string;
  expectedOutcome: string;
  metric: string;
  importance: AssumptionImportance;
};

type ThesisDraft = {
  ticker: string;
  position: ThesisPosition;
  timeHorizon: string;
  title: string;
  thesis: string;
  assumptions: AssumptionDraft[];
};

const initialState: CreateThesisActionState = {};
const initialDraft: ThesisDraft = {
  ticker: "",
  position: "long",
  timeHorizon: "",
  title: "",
  thesis: "",
  assumptions: [
    {
      id: "first",
      statement: "",
      expectedOutcome: "",
      metric: "",
      importance: "high",
    },
  ],
};

type TickerResolution = CompanyIdentityResolution | { status: "idle" } | { status: "checking" };

const fieldClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-white/45 focus:ring-2 focus:ring-white/10";

export function ThesisCaptureForm() {
  const [state, formAction, isPending] = useActionState(createThesisAction, initialState);
  const [draft, setDraft] = useState<ThesisDraft>(initialDraft);
  const [tickerResolution, setTickerResolution] = useState<TickerResolution>({ status: "idle" });
  const tickerRequestId = useRef(0);
  const verifiedTicker = useRef<string | null>(null);

  const updateDraft = <Field extends Exclude<keyof ThesisDraft, "assumptions">>(field: Field, value: ThesisDraft[Field]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const resolveTicker = useCallback(async (value: string) => {
    const ticker = normalizeTicker(value);
    const requestId = ++tickerRequestId.current;

    if (!ticker) {
      verifiedTicker.current = null;
      setTickerResolution({ status: "idle" });
      return;
    }

    if (!isTickerSyntaxValid(ticker)) {
      verifiedTicker.current = null;
      setTickerResolution({ status: "invalid", message: "Enter a valid ticker symbol, for example NVDA or BRK-B." });
      return;
    }

    setTickerResolution({ status: "checking" });

    try {
      const result = await resolveCompanyIdentityAction(ticker);
      if (requestId !== tickerRequestId.current) {
        return;
      }

      if (result.status === "valid") {
        verifiedTicker.current = result.identity.ticker;
        setDraft((current) => ({ ...current, ticker: result.identity.ticker }));
      } else {
        verifiedTicker.current = null;
      }

      setTickerResolution(result);
    } catch {
      if (requestId !== tickerRequestId.current) {
        return;
      }

      verifiedTicker.current = null;
      setTickerResolution({ status: "unavailable", message: "SEC ticker verification is unavailable. Please try again." });
    }
  }, []);

  const handleTickerChange = (value: string) => {
    tickerRequestId.current += 1;
    verifiedTicker.current = null;
    setTickerResolution({ status: "idle" });
    updateDraft("ticker", value);
  };

  useEffect(() => {
    const ticker = normalizeTicker(draft.ticker);

    if (!ticker) {
      setTickerResolution({ status: "idle" });
      return;
    }

    if (verifiedTicker.current === ticker) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void resolveTicker(ticker);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [draft.ticker, resolveTicker]);

  const isTickerVerified =
    tickerResolution.status === "valid" && tickerResolution.identity.ticker === draft.ticker;

  const updateAssumption = <Field extends Exclude<keyof AssumptionDraft, "id">>(
    id: string,
    field: Field,
    value: AssumptionDraft[Field],
  ) => {
    setDraft((current) => ({
      ...current,
      assumptions: current.assumptions.map((assumption) =>
        assumption.id === id ? { ...assumption, [field]: value } : assumption,
      ),
    }));
  };

  const addAssumption = () => {
    setDraft((current) => ({
      ...current,
      assumptions: [
        ...current.assumptions,
        {
          id: crypto.randomUUID(),
          statement: "",
          expectedOutcome: "",
          metric: "",
          importance: "high",
        },
      ],
    }));
  };

  const removeAssumption = (id: string) => {
    setDraft((current) => ({
      ...current,
      assumptions:
        current.assumptions.length === 1
          ? current.assumptions
          : current.assumptions.filter((assumption) => assumption.id !== id),
    }));
  };

  return (
    <form action={formAction} className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-200/80">Step 1 of 1</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Record your investment thesis</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Capture what you believe today. Clyve will later compare new evidence against these assumptions; it will not
          tell you to buy or sell.
        </p>
      </section>

      <section className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:grid-cols-2 sm:p-7">
        <label className="block text-sm font-medium text-zinc-200">
          Ticker symbol
          <input
            name="ticker"
            required
            autoCapitalize="characters"
            placeholder="NVDA"
            value={draft.ticker}
            onChange={(event) => handleTickerChange(event.target.value)}
            onBlur={() => void resolveTicker(draft.ticker)}
            className={fieldClassName}
          />
          {state.fieldErrors?.ticker ? <p className="mt-2 text-xs text-red-300">{state.fieldErrors.ticker}</p> : null}
        </label>

        <div className="block text-sm font-medium text-zinc-200">
          <p>SEC identity</p>
          <div aria-live="polite" className="mt-2 min-h-6 text-sm font-normal leading-6">
            {tickerResolution.status === "idle" ? <span className="text-zinc-500">Enter a ticker to verify its SEC identity.</span> : null}
            {tickerResolution.status === "checking" ? <span className="text-zinc-400">Checking SEC identity...</span> : null}
            {tickerResolution.status === "valid" ? (
              <span className="text-zinc-200">
                {tickerResolution.identity.companyName} <span className="text-zinc-500">CIK {tickerResolution.identity.cik}</span>
              </span>
            ) : null}
            {tickerResolution.status === "invalid" ? <span className="text-red-300">{tickerResolution.message}</span> : null}
            {tickerResolution.status === "unavailable" ? <span className="text-amber-200">{tickerResolution.message}</span> : null}
          </div>
        </div>

        <label className="block text-sm font-medium text-zinc-200">
          Position
          <select
            name="position"
            value={draft.position}
            onChange={(event) => updateDraft("position", event.target.value as ThesisPosition)}
            className={fieldClassName}
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
            <option value="watching">Watching</option>
          </select>
          {state.fieldErrors?.position ? <p className="mt-2 text-xs text-red-300">{state.fieldErrors.position}</p> : null}
        </label>

        <label className="block text-sm font-medium text-zinc-200">
          Time horizon <span className="font-normal text-zinc-500">(optional)</span>
          <input
            name="timeHorizon"
            placeholder="12–24 months"
            value={draft.timeHorizon}
            onChange={(event) => updateDraft("timeHorizon", event.target.value)}
            className={fieldClassName}
          />
        </label>

        <label className="block text-sm font-medium text-zinc-200 sm:col-span-2">
          Thesis title
          <input
            name="title"
            required
            placeholder="AI infrastructure demand will sustain data center growth"
            value={draft.title}
            onChange={(event) => updateDraft("title", event.target.value)}
            className={fieldClassName}
          />
          {state.fieldErrors?.title ? <p className="mt-2 text-xs text-red-300">{state.fieldErrors.title}</p> : null}
        </label>

        <label className="block text-sm font-medium text-zinc-200 sm:col-span-2">
          Why do you hold or watch this company?
          <textarea
            name="thesis"
            required
            rows={6}
            placeholder="Describe the business outcome you expect, why you expect it, and what would make you reconsider."
            value={draft.thesis}
            onChange={(event) => updateDraft("thesis", event.target.value)}
            className={fieldClassName}
          />
          {state.fieldErrors?.thesis ? <p className="mt-2 text-xs text-red-300">{state.fieldErrors.thesis}</p> : null}
        </label>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-200/80">Monitoring inputs</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Key assumptions</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              State the conditions that must remain true. Future evidence will be mapped against these statements.
            </p>
          </div>
          <button
            type="button"
            onClick={addAssumption}
            className="h-10 rounded-xl border border-white/15 px-4 text-sm font-medium text-zinc-100 transition hover:bg-white/[0.07]"
          >
            Add assumption
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {draft.assumptions.map((assumption, index) => (
            <div key={assumption.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-zinc-200">Assumption {index + 1}</p>
                {draft.assumptions.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeAssumption(assumption.id)}
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
                  placeholder="Data center revenue continues to grow at a material rate."
                  value={assumption.statement}
                  onChange={(event) => updateAssumption(assumption.id, "statement", event.target.value)}
                  className={fieldClassName}
                />
              </label>

              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_0.7fr_0.45fr]">
                <label className="block text-sm text-zinc-300">
                  Expected outcome <span className="text-zinc-500">(optional)</span>
                  <input
                    name="assumptionExpectedOutcome"
                    placeholder="Growth remains above 20%"
                    value={assumption.expectedOutcome}
                    onChange={(event) => updateAssumption(assumption.id, "expectedOutcome", event.target.value)}
                    className={fieldClassName}
                  />
                </label>
                <label className="block text-sm text-zinc-300">
                  Metric <span className="text-zinc-500">(optional)</span>
                  <input
                    name="assumptionMetric"
                    placeholder="Data center revenue"
                    value={assumption.metric}
                    onChange={(event) => updateAssumption(assumption.id, "metric", event.target.value)}
                    className={fieldClassName}
                  />
                </label>
                <label className="block text-sm text-zinc-300">
                  Importance
                  <select
                    name="assumptionImportance"
                    value={assumption.importance}
                    onChange={(event) =>
                      updateAssumption(assumption.id, "importance", event.target.value as AssumptionImportance)
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

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!isTickerVerified ? <p className="text-sm text-zinc-500">Verify an SEC ticker before saving this thesis.</p> : <span />}
        <button
          type="submit"
          disabled={isPending || !isTickerVerified}
          className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving thesis…" : "Save thesis"}
        </button>
      </div>
    </form>
  );
}
