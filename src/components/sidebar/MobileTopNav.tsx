"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

interface MobileTopNavProps {
    user?: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
}

export function MobileTopNav({ user }: MobileTopNavProps) {
    const { open } = useSidebar();

    const initials =
        user?.name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

    return (
        <div className="fixed inset-x-0 top-0 z-30 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4" style={{ height: 52 }}>
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-1">
                <button
                    type="button"
                    onClick={open}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border-color)] bg-[#0a0a0a] transition hover:bg-[#141414]"
                    aria-label="Open sidebar"
                >
                    <Menu className="h-5 w-5 text-white" />
                </button>

                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white">
                    CLYVE
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[#111111] text-sm font-semibold text-white">
                    {initials}
                </div>
            </div>
        </div>
    );
}
