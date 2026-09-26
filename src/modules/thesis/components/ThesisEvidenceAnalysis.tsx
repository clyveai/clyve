"use client";

import { useActionState, useEffect, useState } from "react";
import { Spinner } from "@/shared/ui/spinner";
import {
  analyzeThesisEvidenceAction,
  type AnalyzeThesisEvidenceActionState,
} from "../actions/analyze-thesis-evidence";
import type { EvidenceAnalysisOverview, SavedEvidenceAnalysis } from "../evidence-analysis-types";

type ThesisEvidenceAnalysisProps = {
  thesisId: string;
  thesisVersion: number;
  canAnalyze: boolean;
  isAiConfigured: boolean;
  overview: EvidenceAnalysisOverview;
};

const initialState: AnalyzeThesisEvidenceActionState = {};

const relationshipStyles: Record<SavedEvidenceAnalysis["relationship"], { label: string; className: string }> = {
  supporting: {
    label: "Supporting",
    className: "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200",
  },
  contradicting: {
    label: "Contradicting",
    className: "border-red-300/20 bg-red-300/[0.06] text-red-200",
  },
  contextual: {
    label: "Contextual",
    className: "border-amber-300/20 bg-amber-300/[0.06] text-amber-100",
  },
  unclear: {
    label: "Unclear",
    className: "border-white/15 bg-white/[0.04] text-zinc-300",
  },
};

function safeSourceUrl(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
}

export function ThesisEvidenceAnalysis({
  thesisId,
  thesisVersion,
  canAnalyze,
  isAiConfigured,
  overview,
}: ThesisEvidenceAnalysisProps) {
  const [state, formAction, isPending] = useActionState(
    analyzeThesisEvidenceAction.bind(null, thesisId, thesisVersion),
    initialState,
  );
  const [now, setNow] = useState<number | null>(null);
  const nextAnalysisTime = overview.nextAnalysisAt ? Date.parse(overview.nextAnalysisAt) : null;
  const hasValidCooldown = nextAnalysisTime !== null && Number.isFinite(nextAnalysisTime);
  const cooldownSeconds = hasValidCooldown && now !== null
    ? Math.max(0, Math.ceil((nextAnalysisTime - now) / 1000))
    : 0;
  const isCoolingDown = hasValidCooldown && (now === null || cooldownSeconds > 0);
  const hasPendingPairs = overview.pendingPairCount > 0;
  const isDisabled = isPending || !canAnalyze || !isAiConfigured || !hasPendingPairs || isCoolingDown;

  useEffect(() => {
    const currentTime = Date.now();
    setNow(currentTime);
    if (nextAnalysisTime === null || !Number.isFinite(nextAnalysisTime) || nextAnalysisTime <= currentTime) {
      return;
    }

    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= nextAnalysisTime) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextAnalysisTime]);

  return (
    <section
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-8"
      aria-busy={isPending}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-200/80">Thesis monitoring</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Evidence analysis</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Saved SEC excerpts mapped to your assumptions. No buy or sell recommendations.
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500">
            Analysis uses Google Gemini. On the free tier, do not submit confidential or personal information.
            {" "}<a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-zinc-300">Google data terms</a>
          </p>
        </div>
        <form action={formAction} className="shrink-0">
          <button
            type="submit"
            disabled={isDisabled}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-amber-300/25 px-3 text-sm font-medium text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? <Spinner className="size-3.5" /> : null}
            {isPending ? "Analyzing..." : overview.mappings.length > 0 ? "Analyze next batch" : "Analyze evidence"}
          </button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-5 text-zinc-500">
        <span>{overview.eligibleEvidenceCount} saved excerpt{overview.eligibleEvidenceCount === 1 ? "" : "s"} available</span>
        <span>{overview.pendingPairCount} evidence-assumption pair{overview.pendingPairCount === 1 ? "" : "s"} remaining</span>
      </div>

      {canAnalyze && isAiConfigured && hasPendingPairs ? (
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Each batch analyzes one excerpt against up to three assumptions. A short cooldown protects the free API quota.
        </p>
      ) : null}

      {isPending ? (
        <div aria-live="polite" role="status" className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-200/[0.04] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <Spinner className="size-4 shrink-0 text-amber-100" />
            <p className="text-sm font-medium text-amber-100">Mapping the next evidence batch...</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Comparing the saved excerpt with your assumptions and validating its source quotes. Previous results remain available below.
          </p>
        </div>
      ) : null}

      {state.error && !isPending ? (
        <p role="alert" className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/[0.04] p-4 text-sm leading-6 text-red-200">
          {state.error}
        </p>
      ) : null}

      {state.result && !isPending ? (
        <p aria-live="polite" role="status" className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-4 text-sm leading-6 text-emerald-200">
          Saved {state.result.savedCount} mapping{state.result.savedCount === 1 ? "" : "s"}.
          {" "}{state.result.pendingPairCount > 0
            ? `${state.result.pendingPairCount} evidence-assumption pairs remain for later batches.`
            : "All currently available evidence-assumption pairs have been analyzed."}
        </p>
      ) : null}

      {!canAnalyze ? (
        <p className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-400">
          Analysis requires an active thesis, a verified SEC identity, and at least one active assumption. Saved mappings remain available.
        </p>
      ) : !isAiConfigured ? (
        <p className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-200/[0.04] p-4 text-sm leading-6 text-amber-100/80">
          AI analysis is not configured. Add GEMINI_API_KEY from Google AI Studio to the server environment and restart the app. Saved filings remain available without AI.
        </p>
      ) : overview.eligibleEvidenceCount === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-400">
          No saved SEC excerpts are available for analysis. Use Sync SEC filings to import source documents and evidence first.
        </p>
      ) : !hasPendingPairs && !isPending ? (
        <p className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-400">
          No evidence-assumption pairs are waiting for analysis. Sync new filings or update your assumptions to continue.
        </p>
      ) : null}

      {isCoolingDown && canAnalyze && isAiConfigured && hasPendingPairs && !isPending ? (
        <p className="mt-3 text-xs leading-5 text-zinc-500" role="status">
          {now === null ? "Checking next batch availability..." : `Next batch available in ${cooldownSeconds}s.`}
        </p>
      ) : null}

      {overview.mappings.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-zinc-200">Latest saved mappings</h3>
          {overview.mappings.length === 50 ? (
            <p className="mt-1 text-xs leading-5 text-zinc-500">Showing the 50 most recent mappings. Earlier mappings remain saved.</p>
          ) : null}
          <div className="mt-3 space-y-3">
            {overview.mappings.map((mapping) => {
              const relationship = relationshipStyles[mapping.relationship];
              const sourceUrl = safeSourceUrl(mapping.sourceUrl);
              const analysisDate = formatDate(mapping.createdAt);

              return (
                <article key={mapping.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full border px-2.5 py-1 font-medium ${relationship.className}`}>
                      {relationship.label}
                    </span>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 capitalize text-zinc-400">
                      {mapping.materiality} materiality
                    </span>
                    {mapping.assumptionRetired ? (
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-zinc-500">Retired assumption</span>
                    ) : null}
                    {mapping.thesisVersion !== null ? (
                      <span className="text-zinc-500">
                        Thesis v{mapping.thesisVersion}{mapping.thesisVersion !== thesisVersion ? " · Earlier version" : ""}
                      </span>
                    ) : null}
                  </div>
                  <h4 className="mt-4 break-words text-sm font-medium leading-6 text-zinc-100">{mapping.assumptionStatement}</h4>
                  <p className="mt-3 break-words text-sm leading-6 text-zinc-400">
                    <span className="text-zinc-300">Evidence: </span>{mapping.claim}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200">{mapping.rationale}</p>
                  {mapping.sourceQuote ? (
                    <blockquote className="mt-4 border-l-2 border-amber-300/25 pl-4 text-sm leading-6 text-zinc-400">
                      <p className="whitespace-pre-wrap break-words">{mapping.sourceQuote}</p>
                    </blockquote>
                  ) : null}
                  <div className="mt-4 border-t border-white/[0.08] pt-4">
                    {sourceUrl ? (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-words text-sm leading-6 text-amber-100/85 underline decoration-amber-100/25 underline-offset-4 transition hover:text-amber-100"
                      >
                        {mapping.sourceTitle} <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <p className="break-words text-sm leading-6 text-zinc-400">{mapping.sourceTitle}</p>
                    )}
                    {mapping.sourceLocator ? <p className="mt-1 break-words text-xs leading-5 text-zinc-500">{mapping.sourceLocator}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs leading-5 text-zinc-500">
                      <span>Model confidence {mapping.confidence}/100</span>
                      {mapping.model ? <span className="break-all">{mapping.model}</span> : null}
                      {analysisDate ? <span>Analyzed {analysisDate}</span> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-zinc-500">
            Confidence is the model&apos;s self-assessment, not a calibrated probability. Review the linked source before making investment decisions.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 sm:p-5">
          <p className="text-sm font-medium text-zinc-200">No evidence analysis has been saved yet.</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Each result will show the assumption it affects, its relationship, the reason, and its original source.
          </p>
        </div>
      )}
    </section>
  );
}
