import type { SecFilingListItem } from "../types";

type SecFilingHistoryProps = {
  ticker: string;
  hasSecIdentity: boolean;
  isArchived: boolean;
  filings: SecFilingListItem[];
};

function formatDate(value: Date | string | null) {
  if (!value) {
    return null;
  }

  const date = typeof value === "string" ? new Date(`${value}T12:00:00.000Z`) : value;
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function SecFilingHistory({ ticker, hasSecIdentity, isArchived, filings }: SecFilingHistoryProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-200/80">SEC EDGAR</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Saved filings</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
        Primary filing documents imported for {ticker}. These are source records only; thesis assessment will be added later.
      </p>

      {filings.length > 0 ? (
        <div className="mt-6 space-y-3">
          {filings.map((filing) => {
            const filingDate = formatDate(filing.filingDate ?? filing.occurredAt);
            const reportDate = formatDate(filing.reportDate);

            return (
              <article key={filing.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-amber-300/20 bg-amber-200/[0.06] px-2.5 py-1 font-medium text-amber-100">
                        {filing.form ?? "SEC filing"}
                      </span>
                      {filingDate ? <span className="text-zinc-500">Filed {filingDate}</span> : null}
                    </div>
                    <h3 className="mt-3 text-sm font-medium leading-6 text-zinc-100">{filing.title}</h3>
                    {filing.summary ? <p className="mt-2 text-sm leading-6 text-zinc-400">{filing.summary}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                      {reportDate ? <span>Period ended {reportDate}</span> : null}
                      {filing.accessionNumber ? <span>Accession {filing.accessionNumber}</span> : null}
                    </div>
                  </div>
                  <a
                    href={filing.indexUrl ?? filing.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-white/15 px-3 text-sm font-medium text-zinc-100 transition hover:bg-white/[0.07]"
                  >
                    Open SEC filing <span aria-hidden="true" className="ml-1.5">↗</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-zinc-200">No SEC filings have been saved yet.</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {!hasSecIdentity
              ? "Verify the SEC identity before filing monitoring can begin."
              : isArchived
                ? "No SEC filing history was saved before this thesis was archived."
                : "Use Sync SEC filings to import the latest 10-K, 10-Q, and 8-K documents."}
          </p>
        </div>
      )}
    </section>
  );
}
