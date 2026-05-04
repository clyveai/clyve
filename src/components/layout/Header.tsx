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

    const navLinks = [
        { name: 'Blog', href: 'blog' },
        { name: 'Pricing', href: 'pricing' },
        { name: 'Community', href: 'https://www.instagram.com/clyveai/', external: true },
    ];

    return (
        <>
            {/* Header Floating Wrapper */}
            <div className="fixed top-5 md:top-8 inset-x-0 z-50 flex justify-center px-5 md:px-6 pointer-events-none">

                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    style={{
                        WebkitBackdropFilter: "blur(20px) saturate(160%)",
                        backgroundColor: "rgba(255, 255, 255, 0.88)"
                    }}
                    className="pointer-events-auto flex items-center p-1 md:p-1.5 w-full max-w-fit border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-full"
                >
                    {/* Brand/Logo Pill */}
                    <Link href="/" className="flex items-center gap-2 bg-[#121110] py-2 md:py-2.5 pl-2.5 pr-5 md:pl-3 md:pr-6 rounded-full shadow-sm group active:scale-95 transition-all">
                        <div className="relative flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden">
                            <Image
                                src="/logo.svg"
                                alt="Clyve AI Logo"
                                width={22}
                                height={22}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-[13px] md:text-[14px] font-bold text-white tracking-tight">Clyve</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 px-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                target={link.external ? "_blank" : undefined}
                                rel={link.external ? "noopener noreferrer" : undefined}
                                className="text-[13.5px] font-bold text-[#45403a] hover:text-black px-5 py-2 rounded-full hover:bg-black/5 transition-all"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Action Area */}
                    <div className="flex items-center gap-1 ml-auto md:ml-0">
                        <Link
                            href="/login"
                            className="hidden md:flex items-center gap-1.5 py-2.5 px-6 bg-[#e4e4e7] border border-black/5 text-black text-[13.5px] font-bold rounded-full hover:bg-black hover:text-white active:scale-95 transition-all shadow-sm"
                        >
                            Get Started
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </Link>

                        {/* Mobile Toggle - Smaller & More Compact */}
                        <button
                            className="md:hidden flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#121110] text-white active:scale-90 transition-all"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <AnimatePresence mode="wait">
                                {isMobileMenuOpen
                                    ? <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}><X className="w-4 h-4" /></motion.div>
                                    : <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}><Menu className="w-4 h-4" /></motion.div>
                                }
                            </AnimatePresence>
                        </button>
                    </div>
                </motion.header>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed inset-0 z-40 bg-white md:hidden flex flex-col pt-28 px-8 pb-12"
                    >
                        <motion.nav className="flex flex-col gap-6">
                            {navLinks.map((link, idx) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * idx }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        target={link.external ? "_blank" : undefined}
                                        rel={link.external ? "noopener noreferrer" : undefined}
                                        className="text-3xl font-bold text-black tracking-tight hover:opacity-60 transition-opacity"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.nav>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-auto"
                        >
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex w-full h-14 items-center justify-center gap-2 text-[15px] font-bold bg-[#121110] text-white rounded-2xl active:scale-[0.97] transition-all"
                            >
                                Get Started
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}