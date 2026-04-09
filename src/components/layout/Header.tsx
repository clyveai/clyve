'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Menu, X } from 'lucide-react';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    // Tambahkan properti 'external: true' untuk link Instagram
    const navLinks = [
        { name: 'Template', href: 'template' },
        { name: 'Pricing', href: 'pricing' },
        { name: 'Community', href: 'https://www.instagram.com/clyveai/', external: true },
    ];

    return (
        <>
            {/* Header Floating Wrapper */}
            <div className="fixed top-6 md:top-8 inset-x-0 z-50 flex justify-center px-6 pointer-events-none">

                {/* Main Pill Container - Optimized for Readability */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    style={{
                        WebkitBackdropFilter: "blur(24px) saturate(160%)",
                        backgroundColor: "rgba(255, 255, 255, 0.85)"
                    }}
                    className="pointer-events-auto flex items-center p-1.5 w-full max-w-fit border border-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-full"
                >
                    {/* Brand/Logo Pill - Dark Obsidian */}
                    <Link href="/" className="flex items-center gap-2.5 bg-[#121110] py-2.5 pl-3 pr-6 rounded-full shadow-sm group active:scale-95 transition-all">
                        <div className="relative flex items-center justify-center w-6 h-6 rounded-full overflow-hidden">
                            <Image
                                src="/logo.svg"
                                alt="Clyve AI Logo"
                                width={18}
                                height={18}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-[14px] font-bold text-white tracking-tight">Clyve</span>
                    </Link>

                    {/* Desktop Navigation - High Contrast Typography */}
                    <nav className="hidden md:flex items-center gap-1 px-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                // Kondisi untuk open in new tab
                                target={link.external ? "_blank" : undefined}
                                rel={link.external ? "noopener noreferrer" : undefined}
                                className="text-[13.5px] font-bold text-[#45403a] hover:text-black px-5 py-2 rounded-full hover:bg-black/5 transition-all"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Action Area */}
                    <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                        <Link
                            href="/start"
                            className="hidden md:flex items-center gap-1.5 py-2.5 px-6 bg-[#e4e4e7] border border-black/5 text-black text-[13.5px] font-bold rounded-full hover:bg-[#8b5cf6] active:scale-95 transition-all shadow-sm"
                        >
                            Get Started
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </Link>

                        {/* Mobile Toggle - iOS Control Style */}
                        <button
                            className="md:hidden flex items-center justify-center w-11 h-11 rounded-full bg-[#121110] text-white active:scale-90 transition-all"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <AnimatePresence mode="wait">
                                {isMobileMenuOpen
                                    ? <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><X className="w-5 h-5" /></motion.div>
                                    : <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Menu className="w-5 h-5" /></motion.div>
                                }
                            </AnimatePresence>
                        </button>
                    </div>
                </motion.header>
            </div>

            {/* Mobile Menu Overlay - Depth & Clarity */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="fixed inset-0 z-40 bg-white/90 md:hidden flex flex-col pt-32 px-10 pb-16"
                    >
                        <motion.nav className="flex flex-col gap-8">
                            {navLinks.map((link, idx) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + (idx * 0.05) }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        // Kondisi untuk open in new tab di Mobile
                                        target={link.external ? "_blank" : undefined}
                                        rel={link.external ? "noopener noreferrer" : undefined}
                                        className="text-5xl font-bold text-black tracking-tighter"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.nav>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-auto"
                        >
                            <Link
                                href="/start"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex w-full h-16 items-center justify-center gap-3 text-lg font-bold bg-[#121110] text-white rounded-3xl active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                            >
                                Get Started
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}