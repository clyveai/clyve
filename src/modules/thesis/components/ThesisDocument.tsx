import type { ThesisDetail } from "../types";

const importanceLabel: Record<ThesisDetail["assumptions"][number]["importance"], string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

/** Domain UI for a saved thesis. Evidence and alerts will be composed here in the next slice. */
export function ThesisDocument({ thesis }: { thesis: ThesisDetail }) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-200/80">Investment thesis</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{thesis.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-300">
              <span className="rounded-full border border-white/15 px-3 py-1.5 font-medium">{thesis.ticker}</span>
              <span className="rounded-full border border-white/15 px-3 py-1.5 capitalize">{thesis.position}</span>
              <span className="rounded-full border border-white/15 px-3 py-1.5 capitalize">{thesis.status}</span>
              {thesis.timeHorizon ? <span className="rounded-full border border-white/15 px-3 py-1.5">{thesis.timeHorizon}</span> : null}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-300/15 bg-amber-200/[0.04] px-4 py-3 text-sm text-amber-100/85">
            Monitoring is awaiting source ingestion.
          </div>
        </div>

        {thesis.companyName ? <p className="mt-6 text-sm text-zinc-400">{thesis.companyName}</p> : null}
        <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-zinc-200">{thesis.thesis}</p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-200/80">What Clyve will monitor</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Key assumptions</h2>
        <div className="mt-6 space-y-3">
          {thesis.assumptions.map((assumption) => (
            <article key={assumption.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="max-w-2xl text-sm leading-6 text-zinc-200">{assumption.statement}</p>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-400">
                  {importanceLabel[assumption.importance]}
                </span>
              </div>
              {assumption.expectedOutcome ? (
                <p className="mt-3 text-sm text-zinc-400">Expected: {assumption.expectedOutcome}</p>
              ) : null}
              {assumption.metric ? <p className="mt-1 text-sm text-zinc-500">Metric: {assumption.metric}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
