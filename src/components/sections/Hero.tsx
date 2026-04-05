"use client";

import { motion, Variants, TargetAndTransition } from "framer-motion";
import Image from "next/image";

// === Animation Variants ===
const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            delay: custom * 0.1,
            // Mengubah number[] menjadi tuple spesifik yang diminta Framer Motion
            ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
        },
    }),
};

// Continuous subtle floating effect for images
const float = (delay: number): TargetAndTransition => ({
    y: [0, -12, 0],
    transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut" as const, // Mengunci string agar tidak dibaca sebagai string biasa
        delay: delay,
    },
});

export default function Hero() {
    return (
        <section className="relative min-h-screen w-full bg-[#000000] overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-white selection:text-black">

            {/* === Floating Images Container (Hidden on small mobile for readability) === */}
            <div className="absolute inset-0 pointer-events-none hidden md:block">

                {/* Left Top Image */}
                <motion.div
                    initial={{ opacity: 0, x: -50, rotate: -15 }}
                    animate={{ opacity: 1, x: 0, rotate: -10 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute top-[12%] left-[6%] w-[280px] h-[360px] rounded-[24px] overflow-hidden border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-0"
                >
                    <motion.div animate={float(0)} className="w-full h-full relative">
                        <Image
                            src="/assets/assets1.png" // Ganti dengan asset Anda
                            alt="Campaign image 1"
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </motion.div>

                {/* Left Bottom Image */}
                <motion.div
                    initial={{ opacity: 0, x: -30, y: 50, rotate: -5 }}
                    animate={{ opacity: 1, x: 0, y: 0, rotate: 6 }}
                    transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                    className="absolute bottom-[8%] left-[12%] w-[260px] h-[320px] rounded-[24px] overflow-hidden border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-10"
                >
                    <motion.div animate={float(1)} className="w-full h-full relative">
                        <Image
                            src="/assets/assets2.png" // Ganti dengan asset Anda
                            alt="Campaign image 2"
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </motion.div>

                {/* Right Top Image */}
                <motion.div
                    initial={{ opacity: 0, x: 50, rotate: 15 }}
                    animate={{ opacity: 1, x: 0, rotate: 12 }}
                    transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
                    className="absolute top-[15%] right-[8%] w-[260px] h-[340px] rounded-[24px] overflow-hidden border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-0"
                >
                    <motion.div animate={float(0.5)} className="w-full h-full relative">
                        <Image
                            src="/assets/assets3.png" // Ganti dengan asset Anda
                            alt="Campaign image 3"
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </motion.div>

                {/* Right Bottom Image */}
                <motion.div
                    initial={{ opacity: 0, x: 30, y: 50, rotate: 5 }}
                    animate={{ opacity: 1, x: 0, y: 0, rotate: -8 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                    className="absolute bottom-[12%] right-[5%] w-[280px] h-[360px] rounded-[24px] overflow-hidden border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-10"
                >
                    <motion.div animate={float(1.5)} className="w-full h-full relative">
                        <Image
                            src="/assets/assets4.png" // Ganti dengan asset Anda
                            alt="Campaign image 4"
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* === Main Content === */}
            <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-4xl mx-auto mt-[-5vh]">

                <motion.h1
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-tight text-white leading-[1.05] mb-6 text-balance"
                >
                    Campaign-level content <br className="hidden md:block" />
                    in seconds.
                </motion.h1>

                <motion.p
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="text-[#a1a1aa] text-lg md:text-xl max-w-2xl mb-10 text-pretty font-medium"
                >
                    Creating realistic AI content doesn't have to be hard. Get started
                    easily with our pre-built workflow templates.
                </motion.p>

                <motion.div
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="flex flex-col sm:flex-row items-center gap-4"
                >
                    <button className="px-8 py-3.5 rounded-full bg-white text-black font-semibold tracking-wide hover:bg-[#e4e4e7] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                        Get started
                    </button>
                    <button className="px-8 py-3.5 rounded-full bg-transparent text-white font-semibold tracking-wide border border-[#27272a] hover:bg-[#18181b] hover:border-[#3f3f46] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                        Browse templates
                    </button>
                </motion.div>
            </div>

            {/* === Scroll Indicator === */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none z-20"
            >
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#71717a] uppercase">
                    Scroll
                </span>
                <div className="w-[1px] h-12 bg-white/10 relative overflow-hidden">
                    <motion.div
                        className="w-full h-1/2 bg-white/60 absolute top-0 left-0"
                        animate={{ y: ["-100%", "200%"] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "circInOut",
                        }}
                    />
                </div>
            </motion.div>

        </section>
    );
}