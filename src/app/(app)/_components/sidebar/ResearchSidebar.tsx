"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { NewThesisButton } from "./NewThesisButton";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarBackdrop } from "./SidebarBackdrop";
import { useSidebar } from "@/context/SidebarContext";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
}

interface ResearchSidebarProps {
    user: User | null;
    onNewThesis?: () => void;
}

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 56;
const MOBILE_SIDEBAR_WIDTH = 280;

export function ResearchSidebar({
    user,
    onNewThesis,
}: ResearchSidebarProps) {
    const [mounted, setMounted] = useState(false);

    const { isMobile, isOpen, isCollapsed, close, toggleCollapsed } = useSidebar();

    useEffect(() => {
        setMounted(true);
    }, []);

    const effectiveCollapsed = !isMobile && isCollapsed;

    const handleNewThesis = useCallback(() => {
        onNewThesis?.();
        if (isMobile) {
            close();
        }
    }, [close, isMobile, onNewThesis]);

    if (!mounted) {
        return null;
    }

    const sidebarWidth = isMobile ? MOBILE_SIDEBAR_WIDTH : effectiveCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
    const initials =
        user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

    const sidebarContent = (
        <div className="flex h-full flex-col overflow-hidden border-r border-[var(--border-color)] bg-[var(--bg-primary)]">
            {isMobile ? (
                <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-4">
                    <span className="text-sm font-bold tracking-[-0.04em] text-white">CLYVE</span>
                    <button
                        type="button"
                        onClick={close}
                        className="grid h-8 w-8 place-items-center rounded transition hover:bg-[#0a0a0a]"
                        aria-label="Close sidebar"
                    >
                        <span className="text-lg text-white">×</span>
                    </button>
                </div>
            ) : (
                <SidebarHeader isCollapsed={effectiveCollapsed} onToggleCollapse={toggleCollapsed} />
            )}

            <div className="px-3 py-4">
                <NewThesisButton isCollapsed={effectiveCollapsed} onClick={handleNewThesis} />
            </div>

            {user ? (
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="px-3 py-2">
                        <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.05em] text-[var(--fg-secondary)]">
                            {!effectiveCollapsed && "Theses"}
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 pb-4">
                        {!effectiveCollapsed && (
                            <p className="px-2 py-4 text-xs leading-5 text-[var(--fg-secondary)]">
                                Your active theses will appear here after the first monitoring slice is complete.
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center px-3 text-center">
                    <p className="text-xs text-[var(--fg-secondary)]">
                        {!effectiveCollapsed && "Sign in to record an investment thesis"}
                    </p>
                </div>
            )}

            {user && (
                <div className="border-t border-[var(--border-color)] px-3 py-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-[0.65rem] font-bold text-white">
                            {initials}
                        </div>
                        {!effectiveCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-white">{user.name || "User"}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            <SidebarBackdrop isVisible={isMobile && isOpen} onClose={close} />

            {isMobile ? (
                <AnimatePresence>
                    {isOpen && (
                        <motion.aside
                            key="mobile-sidebar"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                            style={{ width: sidebarWidth }}
                            className="fixed left-0 top-0 z-50 h-screen"
                        >
                            {sidebarContent}
                        </motion.aside>
                    )}
                </AnimatePresence>
            ) : (
                <motion.aside
                    animate={{ width: sidebarWidth }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed left-0 top-0 z-50 h-screen"
                    style={{ width: sidebarWidth }}
                >
                    {sidebarContent}
                </motion.aside>
            )}
        </>
    );
}
