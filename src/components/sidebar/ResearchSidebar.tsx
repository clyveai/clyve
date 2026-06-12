"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { HistoryItem } from "./HistoryItem";
import { NewResearchButton } from "./NewResearchButton";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarBackdrop } from "./SidebarBackdrop";
import { useResearchHistory } from "@/hooks/useResearchHistory";
import { useSidebar } from "@/context/SidebarContext";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
}

interface ResearchSidebarProps {
    user: User | null;
    onHistoryItemClick?: (query: string) => void;
    onNewResearch?: () => void;
}

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 56;
const MOBILE_SIDEBAR_WIDTH = 280;

export function ResearchSidebar({
    user,
    onHistoryItemClick,
    onNewResearch,
}: ResearchSidebarProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const { history, isLoading, deleteHistory } = useResearchHistory(user?.id);
    const { isMobile, isOpen, isCollapsed, close, toggleCollapsed } = useSidebar();

    useEffect(() => {
        setMounted(true);
    }, []);

    const effectiveCollapsed = !isMobile && isCollapsed;

    const handleNewResearch = useCallback(() => {
        setActiveId(null);
        onNewResearch?.();
        if (isMobile) {
            close();
        }
    }, [close, isMobile, onNewResearch]);

    const handleHistoryItemClick = useCallback(
        (query: string, id: string) => {
            setActiveId(id);
            onHistoryItemClick?.(query);
            if (isMobile) {
                close();
            }
        },
        [close, isMobile, onHistoryItemClick],
    );

    const handleDelete = useCallback(
        async (id: string) => {
            try {
                await deleteHistory(id);
                if (activeId === id) {
                    setActiveId(null);
                }
            } catch (error) {
                console.error("Failed to delete history item:", error);
            }
        },
        [activeId, deleteHistory],
    );

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
                <NewResearchButton isCollapsed={effectiveCollapsed} onClick={handleNewResearch} />
            </div>

            {user ? (
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="px-3 py-2">
                        <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.05em] text-[var(--fg-secondary)]">
                            {!effectiveCollapsed && "Recents"}
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 pb-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--fg-secondary)] border-t-white" />
                            </div>
                        ) : history.length === 0 ? (
                            !effectiveCollapsed && (
                                <p className="px-2 py-4 text-xs text-[var(--fg-secondary)]">
                                    No research yet. Start exploring!
                                </p>
                            )
                        ) : (
                            <div className="space-y-1">
                                {history.map((item) => (
                                    <HistoryItem
                                        key={item.id}
                                        id={item.id}
                                        title={item.title}
                                        isActive={activeId === item.id}
                                        isCollapsed={effectiveCollapsed}
                                        onClick={() => handleHistoryItemClick(item.query, item.id)}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center px-3 text-center">
                    <p className="text-xs text-[var(--fg-secondary)]">
                        {!effectiveCollapsed && "Sign in to save research history"}
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
