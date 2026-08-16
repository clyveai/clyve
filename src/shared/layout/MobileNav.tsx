'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

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
                    {/* Overlay Transparan dengan efek blur bertahap */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm md:hidden"
                    />

                    {/* Floating Menu Card - Mengikuti gaya iOS Frosted Glass Header */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -8 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                            backgroundColor: "rgba(8, 8, 8, 0.75)",
                            backdropFilter: "blur(20px) saturate(180%)",
                            WebkitBackdropFilter: "blur(20px) saturate(180%)",
                            boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 40px rgba(0,0,0,0.5)",
                        }}
                        className="fixed top-20 left-5 right-5 z-[60] md:hidden rounded-[28px] p-4 overflow-hidden"
                    >
                        {/* Navigation Links */}
                        <nav className="flex flex-col gap-0.5">
                            {navLinks.map((link, idx) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.04 * idx, duration: 0.2 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between py-3 px-4 text-[13.5px] font-medium text-white/70 hover:text-white active:bg-white/[0.06] rounded-full transition-all duration-200"
                                    >
                                        <span>{link.name}</span>
                                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        {/* CTA Section */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="mt-3 pt-3 border-t border-white/[0.06]"
                        >
                            <Link
                                href="/signup"
                                onClick={() => setIsOpen(false)}
                                className="flex w-full h-11 items-center justify-center gap-1.5 text-[13px] font-semibold bg-white text-black rounded-full active:scale-95 transition-all duration-200"
                            >
                                Get Started
                                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}