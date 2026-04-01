"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react"; // Pastikan lucide-react sudah terinstall

export default function Footer() {
    return (
        <footer className="relative w-full bg-[#000000] border-t border-[#18181b] pt-24 pb-8 overflow-hidden flex flex-col items-center z-10 font-sans">

            {/* === Call to Action Section (Avioo Inspired) === */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center text-center px-4 z-20 w-full max-w-4xl mx-auto"
            >
                {/* Brand/Logo Mini */}
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white tracking-tight text-lg">
                        clyveai
                    </span>
                </div>

                {/* Heading CTA */}
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-10 tracking-tight text-balance">
                    So, want to make something?
                </h2>

                {/* CTA Button */}
                <button className="px-8 py-3.5 rounded-full bg-white text-black font-semibold tracking-wide hover:bg-[#e4e4e7] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    Get Started
                </button>
            </motion.div>

            {/* === Giant Aesthetic Typography (YAPI Inspired) === */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative w-full flex justify-center items-center mt-20 pointer-events-none select-none z-0"
            >
                {/* Teks raksasa dengan efek gradient yang memudar ke bawah.
          Menggunakan font-black dan tracking yang rapat untuk kesan premium.
        */}
                <h1 className="text-[25vw] leading-[0.8] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/10 via-white/5 to-transparent">
                    CLYVE
                </h1>

                {/* Overlay gradient untuk memastikan teks benar-benar fade out di bagian bawah */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent z-10" />
            </motion.div>

            {/* === Bottom Links & Copyright === */}
            <div className="relative z-20 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl px-6 mt-10 text-sm font-medium text-[#71717a]">

                <div className="flex items-center gap-6 mb-4 md:mb-0">
                    <Link href="/terms" className="hover:text-white transition-colors duration-200">
                        Terms
                    </Link>
                    <span className="w-[1px] h-3 bg-[#27272a]" />
                    <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                        Privacy
                    </Link>
                </div>

                <p className="tracking-wide">
                    © {new Date().getFullYear()} Clyve AI. All rights reserved.
                </p>

            </div>
        </footer>
    );
}