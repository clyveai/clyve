"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const COLLAPSE_STATE_KEY = "sidebar-collapsed";

interface SidebarContextValue {
    isOpen: boolean;
    isMobile: boolean;
    isCollapsed: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            if (typeof window === "undefined") return;
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (isMobile) {
            setIsOpen(false);
            return;
        }

        const saved = window.localStorage.getItem(COLLAPSE_STATE_KEY);
        setIsCollapsed(saved === "true");
        setIsOpen(true);
    }, [isMobile]);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
    const toggleCollapsed = useCallback(() => {
        setIsCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                window.localStorage.setItem(COLLAPSE_STATE_KEY, String(next));
            }
            return next;
        });
    }, []);

    useEffect(() => {
        if (!isMobile) return;

        let startX = 0;

        const onTouchStart = (event: TouchEvent) => {
            startX = event.touches[0]?.clientX ?? 0;
        };

        const onTouchEnd = (event: TouchEvent) => {
            const endX = event.changedTouches[0]?.clientX ?? 0;
            const diff = endX - startX;

            if (startX <= 20 && diff > 60) {
                setIsOpen(true);
            }

            if (diff < -80) {
                setIsOpen(false);
            }
        };

        document.addEventListener("touchstart", onTouchStart);
        document.addEventListener("touchend", onTouchEnd);

        return () => {
            document.removeEventListener("touchstart", onTouchStart);
            document.removeEventListener("touchend", onTouchEnd);
        };
    }, [isMobile]);

    const value = useMemo(
        () => ({ isOpen, isMobile, isCollapsed, open, close, toggle, toggleCollapsed }),
        [isOpen, isMobile, isCollapsed, open, close, toggle, toggleCollapsed],
    );

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within SidebarProvider");
    }
    return context;
}
