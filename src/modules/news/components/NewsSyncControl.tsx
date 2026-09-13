"use client";

import { useActionState, useEffect, useState } from "react";
import { Spinner } from "@/shared/ui/spinner";
import { syncNewsAction, type NewsSyncActionState } from "../actions/sync-news";

type NewsSyncControlProps = {
  thesisId: string;
  canSync: boolean;
  configured: boolean;
  nextSyncAt: string | null;
};

const initialState: NewsSyncActionState = {};

function timestamp(value: string | null | undefined) {
  const time = value ? Date.parse(value) : 0;
  return Number.isFinite(time) ? time : 0;
}

export function NewsSyncControl({ thesisId, canSync, configured, nextSyncAt }: NewsSyncControlProps) {
  const [state, formAction, isPending] = useActionState(syncNewsAction.bind(null, thesisId), initialState);
  const [clock, setClock] = useState<number | null>(null);
  const retryTime = Math.max(timestamp(nextSyncAt), timestamp(state.result?.nextSyncAt), timestamp(state.retryAt));
  const isCoolingDown = retryTime > (clock ?? 0);

  useEffect(() => {
    const currentTime = Date.now();
    setClock(currentTime);

    if (retryTime <= currentTime) {
      return;
    }

    const timer = window.setTimeout(() => setClock(Date.now()), retryTime - currentTime + 100);
    return () => window.clearTimeout(timer);
  }, [retryTime]);

  const retryLabel = retryTime
    ? new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date(retryTime))
    : null;

  return (
    <form action={formAction} className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="submit"
        disabled={isPending || !canSync || !configured || isCoolingDown}
        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-amber-300/25 px-3 text-sm font-medium text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Spinner className="size-3.5" /> : null}
        {isPending ? "Syncing..." : "Sync news"}
      </button>
      <div aria-live="polite" className="max-w-xs text-xs leading-5 sm:text-right">
        {state.result ? (
          <p className="text-zinc-400">
            {state.result.addedCount > 0
              ? `Added ${state.result.addedCount} article${state.result.addedCount === 1 ? "" : "s"}.`
              : "No new articles found."}
          </p>
        ) : null}
        {canSync && configured && isCoolingDown && retryLabel ? (
          <p className="text-zinc-500">Next sync available {retryLabel} UTC.</p>
        ) : null}
      </div>
      {state.error ? <p role="alert" className="max-w-xs text-xs leading-5 text-red-300 sm:text-right">{state.error}</p> : null}
    </form>
  );
}
