'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, LayoutGrid, Tag, Users } from 'lucide-react';

interface MobileNavProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    navLinks: any[];
}

export default function MobileNav({ isOpen, setIsOpen, navLinks }: MobileNavProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay Transparan (Klik untuk tutup) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-[55] bg-black/10 md:hidden"
                    />

                    {/* Floating Menu Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 350 }}
                        className="fixed top-20 left-5 right-5 z-[60] md:hidden bg-[#121110] border border-white/10 rounded-[28px] p-5 shadow-2xl overflow-hidden"
                    >
                        <nav className="flex flex-col gap-1">
                            {navLinks.map((link, idx) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * idx }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between py-4 px-4 text-[15px] font-medium text-[#efefef] active:bg-white/5 rounded-2xl transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            {link.name}
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-30" />
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 pt-4 border-t border-white/5"
                        >
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="flex w-full h-12 items-center justify-center gap-2 text-[14px] font-bold bg-white text-black rounded-xl active:scale-[0.98] transition-all"
                            >
                                Get Started
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}