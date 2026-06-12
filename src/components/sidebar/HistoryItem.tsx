"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

interface HistoryItemProps {
    id: string;
    title: string;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
    onDelete: (id: string) => void;
}

export function HistoryItem({
    id,
    title,
    isActive,
    isCollapsed,
    onClick,
    onDelete,
}: HistoryItemProps) {
    const [isHovering, setIsHovering] = useState(false);
    const compactLabel = title.charAt(0).toUpperCase() || "•";

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`group relative flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-white transition ${isActive
                    ? "border-l-2 border-white bg-[#111111]"
                    : "border-l-2 border-transparent hover:bg-[#0a0a0a]"
                }`}
            title={title}
        >
            <span className="min-w-0 flex-1 truncate">
                {isCollapsed ? compactLabel : title}
            </span>

            {!isCollapsed && isHovering && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id);
                    }}
                    className="flex-shrink-0 rounded p-1 text-[var(--fg-secondary)] transition hover:bg-[#1a1a1a] hover:text-white"
                    aria-label="Delete this research"
                    title="Delete"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            )}
        </button>
    );
}
