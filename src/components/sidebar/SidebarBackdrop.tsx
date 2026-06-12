"use client";

import { AnimatePresence, motion } from "framer-motion";

interface SidebarBackdropProps {
    isVisible: boolean;
    onClose: () => void;
}

export function SidebarBackdrop({ isVisible, onClose }: SidebarBackdropProps) {
    return (
        <AnimatePresence>
            {isVisible ? (
                <motion.button
                    type="button"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
                    aria-label="Close sidebar"
                />
            ) : null}
        </AnimatePresence>
    );
}
