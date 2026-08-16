import Link from "next/link";

/** The dashboard's first domain-level entry point into thesis monitoring. */
export function ThesisStartPanel() {
  return (
    <section className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-left shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-200/80">Thesis monitoring</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Know when reality changes your thesis.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
        Record why you hold a company and the assumptions behind it. Clyve will turn future filings, announcements,
        and news into traceable evidence—not buy or sell advice.
      </p>
      <Link
        href="/thesis/new"
        className="mt-7 inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
      >
        Create your first thesis
      </Link>
    </section>
  );
}
