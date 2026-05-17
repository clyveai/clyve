'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';
import MobileNav from './MobileNav';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Mencegah scroll saat menu terbuka
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    const navLinks = [
        { name: 'Skills', href: 'skills' },
        { name: 'Pricing', href: 'pricing' },
        { name: 'Community', href: 'https://www.instagram.com/iamzeiyn/', external: true },
    ];

    return (
        <>
            {/* Header Wrapper - Menggunakan absolute agar ikut ke-scroll */}
            <div className="absolute top-5 md:top-8 inset-x-0 z-50 flex justify-center px-5 md:px-6 pointer-events-none">
                <header
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)"
                    }}
                    className="pointer-events-auto flex items-center p-1 md:p-1.5 w-full max-w-fit border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-full"
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 bg-[#121110] py-2 md:py-2.5 pl-2.5 pr-5 md:pl-3 md:pr-6 rounded-full shadow-sm group active:scale-95 transition-all">
                        <div className="relative flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden">
                            <Image src="/logo.svg" alt="Logo" width={22} height={22} className="object-contain" />
                        </div>
                        <span className="text-[13px] md:text-[14px] font-bold text-white tracking-tight">Clyve</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 px-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                // Tambahkan baris di bawah ini
                                target={link.external ? "_blank" : undefined}
                                rel={link.external ? "noopener noreferrer" : undefined}
                                className="text-[13.5px] font-bold text-[#45403a] hover:text-black px-5 py-2 rounded-full hover:bg-black/5 transition-all"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Action */}
                    <div className="flex items-center gap-1">
                        <Link
                            href="/login"
                            className="hidden md:flex items-center gap-1.5 py-2.5 px-6 bg-[#e4e4e7] text-black text-[13.5px] font-bold rounded-full hover:bg-black hover:text-white transition-all shadow-sm"
                        >
                            Get Started
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </Link>

                        {/* Mobile Toggle Button */}
                        <button
                            className="md:hidden relative flex items-center justify-center w-9 h-9 rounded-full bg-[#121110] text-white active:scale-90 transition-transform overflow-hidden z-[70]"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <AnimatePresence mode="wait">
                                {isMobileMenuOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 28,
                                            mass: 0.8
                                        }}
                                    >
                                        <X className="w-[18px] h-[18px]" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                        exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 28,
                                            mass: 0.8
                                        }}
                                    >
                                        <Menu className="w-[18px] h-[18px]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </header>
            </div>

            {/* Komponen Mobile Terpisah */}
            <MobileNav
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
                navLinks={navLinks}
            />
        </>
    );
}