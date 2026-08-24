"use client";

import { useActionState, useState } from "react";
import {
  archiveThesisAction,
  type ArchiveThesisActionState,
} from "../actions/archive-thesis";

const initialState: ArchiveThesisActionState = {};

export function ThesisArchiveControl({ thesisId, version }: { thesisId: string; version: number }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(archiveThesisAction.bind(null, thesisId, version), initialState);

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="h-9 rounded-xl border border-red-300/20 px-3 text-sm font-medium text-red-200 transition hover:bg-red-400/10"
      >
        Archive thesis
      </button>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border border-red-300/20 bg-red-950/20 p-4">
      <p className="text-sm font-medium text-red-100">Archive this thesis?</p>
      <p className="mt-1 text-xs leading-5 text-red-100/70">Its evidence and history will remain available, but monitoring and editing will stop.</p>
      {state.error ? <p role="alert" className="mt-3 text-xs text-red-200">{state.error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-9 rounded-xl bg-red-200 px-3 text-sm font-semibold text-red-950 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Archiving..." : "Confirm archive"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setIsConfirming(false)}
          className="h-9 rounded-xl border border-white/15 px-3 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
