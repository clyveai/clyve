"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ThesisListItem } from "../types";

type ThesisSidebarListProps = {
  theses: ThesisListItem[];
};

/** Domain navigation rendered inside the app shell's sidebar slot. */
export function ThesisSidebarList({ theses }: ThesisSidebarListProps) {
  const pathname = usePathname();

  if (theses.length === 0) {
    return <p className="px-2 py-4 text-xs leading-5 text-[var(--fg-secondary)]">No theses yet. Create one to begin monitoring.</p>;
  }

  return (
    <div className="space-y-1">
      {theses.map((thesis) => {
        const isActive = pathname === `/thesis/${thesis.id}`;

        return (
          <Link
            key={thesis.id}
            href={`/thesis/${thesis.id}`}
            title={`${thesis.ticker} — ${thesis.title}`}
            className={`block rounded-lg px-2.5 py-2 transition ${
              isActive ? "bg-white/[0.09] text-white" : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[11px] font-semibold tracking-wide text-zinc-200">{thesis.ticker}</span>
              <span className="truncate text-xs font-medium">{thesis.title}</span>
            </div>
            <p className="mt-1 truncate text-[11px] text-zinc-500">{thesis.companyName ?? thesis.position}</p>
          </Link>
        );
      })}
    </div>
  );
}
