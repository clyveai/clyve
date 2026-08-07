"use client";

import { Plus } from "lucide-react";

interface NewResearchButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
}

export function NewResearchButton({ isCollapsed, onClick }: NewResearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mx-3 mt-4 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-[10px] border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm font-medium text-white transition hover:border-[#27272a] hover:bg-[#0a0a0a]"
      title="Start a new research"
    >
      <Plus className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && <span className="truncate">New Research</span>}
    </button>
  );
}
