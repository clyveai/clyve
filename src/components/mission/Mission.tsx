"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Balancer from 'react-wrap-balancer';
import Link from "next/link";

const MissionSection = () => {
    return (
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#000000] overflow-hidden pt-10">

            {/* 1. Efek Cincin Cahaya (The Cosmic Arc) */}
            <div className="absolute bottom-[-50%] left-1/2 -translate-x-1/2 w-[140%] aspect-square max-w-[1200px] pointer-events-none">
                <div
                    className="absolute inset-0 rounded-full border-[1px] border-orange-500/30"
                    style={{
                        maskImage: 'linear-gradient(to top, black 20%, transparent 50%)',
                        WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 50%)',
                    }}
                />

                <div
                    className="absolute inset-0 rounded-full opacity-20"
                    style={{
                        boxShadow: '0 0 100px 10px #FF6B00',
                        maskImage: 'linear-gradient(to top, black 10%, transparent 40%)',
                        WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 40%)',
                    }}
                />
            </div>

            {/* 2. Konten Utama */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">

                {/* Logo Clyve AI - Ukuran Orisinil (Besar) */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-24 h-24 mb-8 rounded-[2rem] p-[1.5px] bg-gradient-to-b from-white/20 to-transparent shadow-2xl"
                >
                    <div className="absolute inset-0 bg-black rounded-[2rem] m-[1px] flex items-center justify-center overflow-hidden border border-white/5">
                        <Image
                            src="/logo.svg"
                            alt="Clyve AI Logo"
                            width={64}
                            height={64}
                            className="object-contain"
                            priority
                        />
                    </div>
                    {/* Inner Glow Logo yang lebih tegas sesuai ukuran besar */}
                    <div className="absolute inset-0 rounded-[2rem] bg-orange-500/10 blur-xl -z-10" />
                </motion.div>

                {/* Brand Name - Subtle & Spaced */}
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs font-semibold text-white mb-4 tracking-[0.4em] uppercase"
                >
                    Clyve AI
                </motion.span>

                {/* Main Headline - Balanced Hierarchy */}
                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="font-bold leading-[1.1] mb-6 tracking-tighter text-white uppercase"
                    style={{
                        fontSize: 'clamp(2.2rem, 6vw, 4rem)',
                    }}
                >
                    <Balancer>Architect the Outcome <br /> <span className="text-zinc-500">Command the Result</span></Balancer>
                </motion.h1>

                {/* Deskripsi Misi - Sleek Typography */}
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="max-w-xl text-zinc-500 text-sm md:text-base leading-relaxed mb-10"
                >
                    <Balancer>
                        Eliminate computational noise and bypass generic AI limitations.
                        With <span className="text-white font-medium">Smart Prompt Logic</span>,
                        Clyve AI optimizes deep context into high-performance structural execution.
                    </Balancer>
                </motion.p>

                {/* CTA Button - Tactical Design */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    {/* CTA Button */}
                    <button className="relative group cursor-pointer">
                        <Link href="/blog" className="relative group inline-block cursor-pointer">
                            {/* Button Glow Behind */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition duration-500" />

                            {/* Button Body */}
                            <div className="relative flex items-center gap-2.5 bg-gradient-to-b from-[#FF5100] to-[#E63E00] hover:from-[#FF611A] hover:to-[#FF4500] text-white px-7 py-2.5 rounded-full font-medium transition-all duration-300 shadow-inner shadow-white/20">
                                <span className="text-[15px] tracking-wide">Get Access</span>
                            </div>
                        </Link>
                    </button>
                </motion.div>
            </div>

            {/* Ambient Background Gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_20%,_rgba(255,107,0,0.03)_0%,_transparent_50%)] pointer-events-none" />
        </section >
    );
};

export default MissionSection;