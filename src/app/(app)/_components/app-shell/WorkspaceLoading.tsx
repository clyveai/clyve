import type { ReactNode } from "react";
import AmbientGlow from "@/app/(app)/_components/AmbientGlow";

type WorkspaceLoadingProps = {
  children: ReactNode;
};

export function WorkspaceLoading({ children }: WorkspaceLoadingProps) {
  return (
    <div aria-busy="true" aria-label="Loading thesis workspace" className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] text-white">
      <AmbientGlow />

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[260px] border-r border-[var(--border-color)] bg-[var(--bg-primary)] lg:block">
        <div className="flex h-full flex-col animate-pulse">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-4">
            <span className="text-sm font-bold tracking-[-0.04em] text-white">CLYVE</span>
            <div className="size-8 rounded bg-white/[0.06]" />
          </div>

          <div className="px-3 py-4">
            <div className="mx-3 mt-4 h-9 rounded-[10px] border border-white/[0.07] bg-white/[0.035]" />
          </div>

          <div className="px-3 py-2">
            <div className="h-2 w-12 rounded-full bg-white/[0.08]" />
          </div>

          <div className="space-y-2 px-3 pt-2">
            <div className="rounded-xl px-2 py-3">
              <div className="h-3 w-4/5 rounded-full bg-white/[0.08]" />
              <div className="mt-2 h-2 w-2/5 rounded-full bg-white/[0.05]" />
            </div>
            <div className="rounded-xl px-2 py-3">
              <div className="h-3 w-3/5 rounded-full bg-white/[0.07]" />
              <div className="mt-2 h-2 w-1/3 rounded-full bg-white/[0.05]" />
            </div>
          </div>

          <div className="mt-auto border-t border-[var(--border-color)] px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-white/[0.08]" />
              <div className="h-2.5 w-24 rounded-full bg-white/[0.07]" />
            </div>
          </div>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 h-[52px] border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 lg:left-[260px] lg:right-0 lg:h-20 lg:border-0 lg:bg-transparent lg:px-6">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3">
          <div className="size-10 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.04] lg:hidden" />
          <span className="text-sm font-semibold uppercase tracking-[0.26em] text-zinc-100">Clyve</span>
          <div className="size-10 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.08] lg:size-8 lg:rounded-full lg:border-0" />
        </div>
      </header>

      <main className="relative z-10 flex min-h-screen flex-col px-4 pb-8 pt-[52px] sm:px-6 lg:ml-[260px] lg:pt-20">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
          <div className="flex flex-1 items-center py-10">{children}</div>

          <div className="mb-4 flex justify-center">
            <div className="w-full max-w-xl animate-pulse rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[0_10px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:max-w-3xl">
              <div className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-2">
                <div className="h-10 flex-1 rounded-full bg-white/[0.045]" />
                <div className="size-10 rounded-full bg-white/[0.1]" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <span className="sr-only">Loading thesis workspace...</span>
    </div>
  );
}

export function DashboardWorkspaceSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <div className="h-3 w-28 rounded-full bg-amber-100/[0.12]" />
        <div className="mt-4 h-9 w-3/4 max-w-md rounded-xl bg-white/[0.1]" />
        <div className="mt-5 h-3 w-full max-w-xl rounded-full bg-white/[0.07]" />
        <div className="mt-2 h-3 w-5/6 max-w-lg rounded-full bg-white/[0.07]" />
        <div className="mt-7 h-11 w-32 rounded-xl bg-white/[0.1]" />
      </section>
    </div>
  );
}

export function ThesisDetailWorkspaceSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="h-3 w-28 rounded-full bg-amber-100/[0.12]" />
            <div className="mt-4 h-9 w-3/4 max-w-xl rounded-xl bg-white/[0.1]" />
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="h-7 w-16 rounded-full bg-white/[0.07]" />
              <div className="h-7 w-16 rounded-full bg-white/[0.07]" />
              <div className="h-7 w-20 rounded-full bg-white/[0.07]" />
            </div>
          </div>
          <div className="h-14 w-full rounded-2xl bg-amber-100/[0.07] sm:w-52" />
        </div>
        <div className="mt-7 h-4 w-1/4 rounded-full bg-white/[0.07]" />
        <div className="mt-5 h-4 w-full rounded-full bg-white/[0.08]" />
        <div className="mt-3 h-4 w-11/12 rounded-full bg-white/[0.08]" />
        <div className="mt-3 h-4 w-4/5 rounded-full bg-white/[0.08]" />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-8">
        <div className="h-3 w-36 rounded-full bg-amber-100/[0.12]" />
        <div className="mt-3 h-7 w-48 rounded-xl bg-white/[0.1]" />
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="h-4 w-4/5 rounded-full bg-white/[0.08]" />
            <div className="mt-3 h-3 w-1/2 rounded-full bg-white/[0.06]" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="h-4 w-3/4 rounded-full bg-white/[0.08]" />
            <div className="mt-3 h-3 w-2/5 rounded-full bg-white/[0.06]" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="h-4 w-5/6 rounded-full bg-white/[0.08]" />
            <div className="mt-3 h-3 w-1/3 rounded-full bg-white/[0.06]" />
          </div>
        </div>
      </section>
    </div>
  );
}

export function ThesisCaptureWorkspaceSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-7">
        <div className="h-3 w-24 rounded-full bg-amber-100/[0.12]" />
        <div className="mt-3 h-8 w-3/4 rounded-xl bg-white/[0.1]" />
        <div className="mt-4 h-3 w-full max-w-2xl rounded-full bg-white/[0.07]" />
        <div className="mt-2 h-3 w-4/5 max-w-xl rounded-full bg-white/[0.07]" />
      </section>

      <section className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:grid-cols-2 sm:p-7">
        <div className="h-20 rounded-xl bg-black/20" />
        <div className="h-20 rounded-xl bg-black/20" />
        <div className="h-20 rounded-xl bg-black/20" />
        <div className="h-20 rounded-xl bg-black/20" />
        <div className="h-20 rounded-xl bg-black/20 sm:col-span-2" />
        <div className="h-40 rounded-xl bg-black/20 sm:col-span-2" />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-7">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="h-3 w-32 rounded-full bg-amber-100/[0.12]" />
            <div className="mt-3 h-7 w-44 rounded-xl bg-white/[0.1]" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-white/[0.08]" />
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="h-4 w-28 rounded-full bg-white/[0.08]" />
          <div className="mt-5 h-24 rounded-xl bg-white/[0.06]" />
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_0.7fr_0.45fr]">
            <div className="h-20 rounded-xl bg-white/[0.06]" />
            <div className="h-20 rounded-xl bg-white/[0.06]" />
            <div className="h-20 rounded-xl bg-white/[0.06]" />
          </div>
        </div>
      </section>
    </div>
  );
}
