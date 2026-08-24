"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ThesisListItem } from "../types";

type ThesisSidebarListProps = {
  theses: ThesisListItem[];
};

export function ThesisSidebarList({ theses }: ThesisSidebarListProps) {
  const pathname = usePathname();
  const activeTheses = theses.filter((thesis) => thesis.status !== "archived");
  const archivedTheses = theses.filter((thesis) => thesis.status === "archived");

  const renderThesis = (thesis: ThesisListItem) => {
    const isActive = pathname === `/thesis/${thesis.id}`;
    const isArchived = thesis.status === "archived";

    return (
      <Link
        key={thesis.id}
        href={`/thesis/${thesis.id}`}
        title={`${thesis.ticker} - ${thesis.title}`}
        className={`block rounded-lg px-2.5 py-2 transition ${
          isActive ? "bg-white/[0.09] text-white" : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
        } ${isArchived ? "opacity-70" : ""}`}
      >
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[11px] font-semibold tracking-wide text-zinc-200">{thesis.ticker}</span>
          <span className="truncate text-xs font-medium">{thesis.title}</span>
        </div>
        <p className="mt-1 truncate text-[11px] text-zinc-500">{isArchived ? "Archived" : thesis.companyName ?? thesis.position}</p>
      </Link>
    );
  };

  return (
    <div className="space-y-1">
      {activeTheses.length > 0 ? activeTheses.map(renderThesis) : null}
      {activeTheses.length === 0 && archivedTheses.length === 0 ? (
        <p className="px-2 py-4 text-xs leading-5 text-[var(--fg-secondary)]">No theses yet. Create one to begin monitoring.</p>
      ) : null}
      {archivedTheses.length > 0 ? (
        <details className="mt-4 border-t border-white/[0.08] pt-3" open={archivedTheses.some((thesis) => pathname === `/thesis/${thesis.id}`)}>
          <summary className="cursor-pointer px-2 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500 transition hover:text-zinc-300">
            Archived ({archivedTheses.length})
          </summary>
          <div className="mt-2 space-y-1">{archivedTheses.map(renderThesis)}</div>
        </details>
      ) : null}
    </div>
  );
}
