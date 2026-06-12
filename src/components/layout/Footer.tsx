"use client";

import { motion, Easing } from "framer-motion";
import { Moon } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    // Kurva Cubic Bezier kustom untuk animasi yang smooth
    const smoothEase: Easing = [0.22, 1, 0.36, 1];

    return (
        <footer className="relative w-full bg-[#000000] pt-12 pb-8 overflow-hidden flex flex-col items-center z-10 font-sans">

            {/* === App Logo & Button Section === */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: smoothEase }}
                className="flex flex-col items-center mb-16 z-20"
            >
                {/* Logo Container with Hover Effect */}
                <div className="relative group cursor-pointer mb-6">

                    {/* App Icon Base (Glassmorphism Dark) */}
                    <div className="relative w-24 h-24 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-[2rem] flex items-center justify-center overflow-hidden shadow-2xl transition-transform duration-500 ease-out group-hover:scale-[1.05] group-hover:border-white/20 backdrop-blur-xl">

                        {/* Subtle Starry/Dust Background */}
                        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

                        {/* Logo.svg implementation */}
                        <div className="relative w-16 h-16 transition-transform duration-500 group-hover:scale-110">
                            <img
                                src="/logo.svg"
                                alt="Logo"
                            />
                        </div>
                    </div>
                </div>

                {/* App Title */}
                <h2 className="text-[32px] font-semibold text-white tracking-tight mb-6">
                    Clyve AI
                </h2>

                {/* CTA Button */}
                <button className="relative group cursor-pointer">
                    <Link href="/dashboard" className="relative group inline-block cursor-pointer">
                        {/* Button Glow Behind */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition duration-500" />

                        {/* Button Body */}
                        <div className="relative flex items-center gap-2.5 bg-gradient-to-b from-[#FF5100] to-[#E63E00] hover:from-[#FF611A] hover:to-[#FF4500] text-white px-7 py-2.5 rounded-full font-medium transition-all duration-300 shadow-inner shadow-white/20">
                            <span className="text-[15px] tracking-wide">Try It Now</span>
                            <Moon className="w-[18px] h-[18px] fill-white mb-[2px]" />
                        </div>
                    </Link>
                </button>
            </motion.div>

            {/* === Giant Aesthetic Typography (CLYVE) === */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 60 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                    duration: 1.5,
                    delay: 0.2,
                    ease: smoothEase
                }}
                className="relative w-full flex justify-center items-center pointer-events-none select-none z-0"
            >
                <h1 className="text-[25vw] leading-[0.8] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/10 via-white/5 to-transparent">
                    CLYVE
                </h1>

                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent z-10" />
            </motion.div>

            {/* === Bottom Links, Socials & Copyright (Static - No Animation) === */}
            <div className="relative z-20 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl px-6 mt-10 text-sm font-medium text-[#71717a]">

                {/* Legal Links */}
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                    <Link href="/privacy" className="hover:text-white transition-colors duration-300">
                        Privacy
                    </Link>
                    <span className="w-[1px] h-3 bg-[#27272a]" />
                    <Link href="/terms" className="hover:text-white transition-colors duration-300">
                        Terms
                    </Link>
                </div>

                {/* Social Media Links */}
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                    <Link href="https://www.threads.com/@clyveai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
                        Threads
                    </Link>
                    <Link href="https://instagram.com/clyveai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
                        Instagram
                    </Link>
                    <Link href="https://linkedin.com/company/clyveai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
                        LinkedIn
                    </Link>
                    <Link href="https://youtube.com/@clyveai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
                        YouTube
                    </Link>
                </div>

                {/* Copyright */}
                <p className="tracking-wide">
                    © {new Date().getFullYear()} Clyve AI. All rights reserved.
                </p>
            </div>
        </footer>
    );
}