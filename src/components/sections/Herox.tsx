"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = ["Explore", "Collections", "Activity", "Features", "Community"];

export default function Herox() {
    return (
        <section className="relative min-h-screen w-full bg-[#030303] text-white overflow-hidden selection:bg-white/20">
            {/* Background Wavy Lines & Gradient Glow */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.05] via-transparent to-transparent" />
                <svg
                    className="absolute inset-0 w-full h-full opacity-20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M-100 200 C 300 100, 600 400, 1500 100"
                        fill="transparent"
                        stroke="white"
                        strokeWidth="0.5"
                    />
                    <path
                        d="M-100 300 C 400 150, 700 500, 1500 200"
                        fill="transparent"
                        stroke="white"
                        strokeWidth="0.5"
                    />
                    <path
                        d="M-100 400 C 500 200, 800 600, 1500 300"
                        fill="transparent"
                        stroke="white"
                        strokeWidth="0.5"
                    />
                </svg>
            </div>


            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center pt-20 pb-32 max-w-[1400px] mx-auto px-4">

                {/* Floating Circular Text (Top Left) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute left-10 top-32 hidden lg:block"
                >
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <path id="curve" d="M 60, 60 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent" />
                        <text className="text-[11px] fill-gray-400 tracking-[0.2em] uppercase font-medium">
                            <textPath href="#curve"> clyveai -- clyveai -- clyveai -- </textPath>
                        </text>
                    </svg>
                </motion.div>

                {/* Floating Paragraph (Top Right) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute right-10 top-40 hidden lg:block max-w-[280px]"
                >
                    <p className="text-xs leading-relaxed text-gray-400/80 text-right">
                        Clyve AI bridges the gap between human intent and machine precision. Through advanced logic and context optimization, we turn standard AI inputs into elite professional outputs. Stop guessing. Start architecting.
                    </p>
                </motion.div>

                {/* Main Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-[80px] font-medium text-center leading-[1.1] tracking-tight max-w-4xl"
                >
                    Smart Prompting Is <br /> The Ultimate Edge
                </motion.h1>

                {/* NFT Cards Presentation */}
                <div className="relative mt-24 flex justify-center items-end h-[500px] w-full max-w-4xl">

                    {/* Card 1 (Left) */}
                    <motion.div
                        initial={{ opacity: 0, x: -100, y: 50, rotate: -20 }}
                        animate={{ opacity: 1, x: -180, y: 40, rotate: -12 }}
                        transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                        className="absolute z-10 w-[300px] h-[400px] rounded-[2rem] p-6 bg-gradient-to-br from-[#70d6ff] to-[#4361ee] shadow-2xl flex flex-col justify-between overflow-hidden group hover:z-40"
                    >
                        <CardHeader />
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/20 blur-3xl rounded-full" />
                        {/* Placeholder for 3D Art */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-pink-400/80 rounded-full blur-xl group-hover:scale-110 transition-transform" />
                        <img src="/assets/student.png" alt="3d avatar" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-56 object-cover mix-blend-overlay rounded-full" />
                    </motion.div>

                    {/* Card 2 (Center - Main) */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                        className="relative z-30 w-[320px] h-[440px] rounded-[2rem] p-6 bg-gradient-to-b from-[#ffffff] via-[#ffe5d9] to-[#ff9770] shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden group hover:-translate-y-4 transition-transform duration-500"
                    >
                        <CardHeader />
                        {/* Placeholder for 3D Art */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-56 bg-orange-400/40 rounded-full blur-2xl" />
                        <img src="/assets/creator.png" alt="3d avatar" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 object-cover mix-blend-overlay rounded-full" />
                    </motion.div>

                    {/* Card 3 (Right) */}
                    <motion.div
                        initial={{ opacity: 0, x: 100, y: 50, rotate: 20 }}
                        animate={{ opacity: 1, x: 180, y: 40, rotate: 12 }}
                        transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                        className="absolute z-20 w-[300px] h-[400px] rounded-[2rem] p-6 bg-gradient-to-br from-[#8338ec] to-[#3a0ca3] shadow-2xl flex flex-col justify-between overflow-hidden group hover:z-40"
                    >
                        <CardHeader />
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/20 blur-3xl rounded-full" />
                        {/* Placeholder for 3D Art */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-400/60 rounded-full blur-xl group-hover:scale-110 transition-transform" />
                        <img src="/assets/professional.png" alt="3d avatar" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-56 object-cover mix-blend-overlay rounded-full" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

// Reusable Card Header Component
function CardHeader() {
    return (
        <div className="relative z-10 flex justify-between items-start text-black">
            <div>
                <h3 className="text-xl font-bold tracking-tight text-black/100">Time to win</h3>
                <p className="text-sm font-medium text-black/100">Unlock your skills</p>
                <p className="text-xs font-medium text-black/100 mt-6">Try it now!</p>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="w-8 h-8 rounded-full border-2 border-white/50 bg-gray-200 overflow-hidden"
                        >
                            <img
                                src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                alt="avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
                <p className="font-bold mt-4">👑</p>
            </div>
        </div>
    );
}