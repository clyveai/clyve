'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';
import MobileNav from './MobileNav';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const { scrollY } = useScroll();

    // Track scroll position for glass intensity
    useMotionValueEvent(scrollY, "change", (y) => {
        setScrolled(y > 12);
    });

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    const navLinks = [
        { name: 'Use Cases', href: '/use-cases' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Changelog', href: '/changelog' },
    ];

    return (
        <>
            {/* Fixed wrapper */}
            <div className="fixed top-4 md:top-6 inset-x-0 z-50 flex justify-center px-5 md:px-6 pointer-events-none">
                <motion.header
                    initial={false}
                    animate={{
                        // Subtle scale-in on scroll for refinement
                        scale: scrolled ? 0.995 : 1,
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                        // iOS-style frosted glass
                        backgroundColor: scrolled
                            ? "rgba(8, 8, 8, 0.75)"
                            : "rgba(8, 8, 8, 0.55)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        boxShadow: scrolled
                            ? "0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)"
                            : "0 0 0 1px rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.2)",
                        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
                    }}
                    className="pointer-events-auto flex items-center p-1 md:p-1.5 w-full max-w-fit rounded-full"
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] py-2 md:py-2.5 pl-2.5 pr-5 md:pl-3 md:pr-6 rounded-full active:scale-95 transition-all duration-200"
                    >
                        <div className="relative flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden">
                            <Image src="/logo.svg" alt="Logo" width={22} height={22} className="object-contain" />
                        </div>
                        <span className="text-[13px] md:text-[14px] font-bold text-white tracking-tight">
                            Clyve
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-0.5 px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-[13.5px] font-medium text-white/70 hover:text-white px-4 py-2 rounded-full hover:bg-white/[0.06] transition-all duration-200"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA */}
                    <div className="flex items-center gap-1">
                        <Link
                            href="/signup"
                            className="hidden md:flex items-center gap-1.5 py-2 px-5 bg-white text-black text-[13px] font-semibold rounded-full hover:bg-white/90 active:scale-95 transition-all duration-200"
                        >
                            Get Started
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </Link>

                        {/* Mobile toggle */}
                        <button
                            className="md:hidden relative flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white active:scale-90 transition-all duration-200 overflow-hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isMobileMenuOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.8 }}
                                    >
                                        <X className="w-[18px] h-[18px]" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                        exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.8 }}
                                    >
                                        <Menu className="w-[18px] h-[18px]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </motion.header>
            </div>

            <MobileNav
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
                navLinks={navLinks}
            />
        </>
    );
}