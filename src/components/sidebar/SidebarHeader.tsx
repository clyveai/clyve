"use client";

import { ChevronLeft } from "lucide-react";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarHeader({ isCollapsed, onToggleCollapse }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-4">
      {!isCollapsed && (
        <span className="text-sm font-bold tracking-[-0.04em] text-white">CLYVE</span>
      )}
      <button
        onClick={onToggleCollapse}
        className="grid h-8 w-8 place-items-center rounded transition hover:bg-[#0a0a0a]"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          className="h-4 w-4 text-[var(--fg-secondary)] transition-transform"
          style={{
            transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
    </div>
  );
}
