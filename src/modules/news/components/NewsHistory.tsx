import type { NewsHistoryData } from "../types";
import { NewsSyncControl } from "./NewsSyncControl";

type NewsHistoryProps = {
  thesisId: string;
  ticker: string;
  companyName: string | null;
  canSync: boolean;
  isArchived: boolean;
  history: NewsHistoryData;
};

function formatDate(value: Date | null) {
  if (!value || Number.isNaN(value.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(value);
}

export function NewsHistory({ thesisId, ticker, companyName, canSync, isArchived, history }: NewsHistoryProps) {
  const lastSynced = formatDate(history.lastSyncedAt);
  const availabilityMessage = isArchived
    ? "This thesis is archived. Saved news remains available."
    : !canSync
      ? "Verify the company identity before syncing news."
      : !history.configured
        ? "News syncing is not configured yet."
        : null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-200/80">Company coverage</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Company news</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Latest saved coverage for {companyName ?? ticker}. Open an article to read the full story from its publisher.
          </p>
        </div>
        <NewsSyncControl
          key={thesisId}
          thesisId={thesisId}
          canSync={canSync && !isArchived}
          configured={history.configured}
          nextSyncAt={history.nextSyncAt?.toISOString() ?? null}
        />
      </div>

      {lastSynced && history.lastSyncedAt ? (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Last synced <time dateTime={history.lastSyncedAt.toISOString()}>{lastSynced} UTC</time>.
        </p>
      ) : null}
      {availabilityMessage ? <p className="mt-3 text-sm leading-6 text-zinc-500">{availabilityMessage}</p> : null}

      {history.articles.length > 0 ? (
        <div className="mt-6 space-y-3">
          {history.articles.map((article) => {
            const publishedAt = formatDate(article.publishedAt);

            return (
              <article key={article.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="font-medium text-amber-100/80">{article.publisher ?? "News publisher"}</span>
                      {publishedAt && article.publishedAt ? (
                        <time dateTime={article.publishedAt.toISOString()} className="text-zinc-500">{publishedAt} UTC</time>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-sm font-medium leading-6 text-zinc-100">{article.title}</h3>
                    {article.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">{article.description}</p> : null}
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-white/15 px-3 text-sm font-medium text-zinc-100 transition hover:bg-white/[0.07]"
                  >
                    Read article <span aria-hidden="true" className="ml-1.5">&#8599;</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-zinc-200">No news articles have been saved yet.</p>
          {canSync && !isArchived && history.configured ? (
            <p className="mt-2 text-sm leading-6 text-zinc-500">Use Sync news to look for company coverage from the past seven days.</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
