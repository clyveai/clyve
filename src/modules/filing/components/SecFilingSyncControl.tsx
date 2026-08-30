"use client";

import { useActionState } from "react";
import { Spinner } from "@/shared/ui/spinner";
import { syncSecFilingsAction, type SyncSecFilingsActionState } from "../actions/sync-sec-filings";

const initialState: SyncSecFilingsActionState = {};

function resultMessage({
  sourceCount,
  eventCount,
  evidenceCount,
  skippedFilingCount,
  failedFilingCount,
  remainingFilingCount,
}: NonNullable<SyncSecFilingsActionState["result"]>) {
  const messages: string[] = [];

  if (eventCount > 0 || evidenceCount > 0) {
    messages.push(`Synced ${eventCount} filing event${eventCount === 1 ? "" : "s"} and ${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}.`);
  } else if (sourceCount === 0 && skippedFilingCount === 0 && failedFilingCount === 0) {
    messages.push("No new SEC filings found.");
  }

  if (skippedFilingCount > 0) {
    messages.push(`${skippedFilingCount} filing${skippedFilingCount === 1 ? " was" : "s were"} skipped because no primary document was available.`);
  }

  if (failedFilingCount > 0) {
    messages.push(`${failedFilingCount} filing${failedFilingCount === 1 ? " could" : "s could"} not be processed.`);
  }

  if (remainingFilingCount > 0) {
    messages.push(`${remainingFilingCount} additional filing${remainingFilingCount === 1 ? " is" : "s are"} available for the next sync.`);
  }

  return messages.join(" ");
}

export function SecFilingSyncControl({ thesisId }: { thesisId: string }) {
  const [state, formAction, isPending] = useActionState(syncSecFilingsAction.bind(null, thesisId), initialState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-amber-300/25 px-3 text-sm font-medium text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Spinner className="size-3.5" /> : null}
        {isPending ? "Syncing..." : "Sync SEC filings"}
      </button>
      {state.result ? <p aria-live="polite" className="max-w-xs text-xs leading-5 text-zinc-400">{resultMessage(state.result)}</p> : null}
      {state.error ? <p role="alert" className="max-w-xs text-xs leading-5 text-red-300">{state.error}</p> : null}
    </form>
  );
}
