"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const CARDS = [
    {
        id: "brief",
        tag: "Research Brief",
        title: "From question to brief.",
        subtitle: "Type a ticker. Get the full picture.",
        accent: "#22c55e",
        rows: [
            { label: "Financials & valuation", status: "structured", color: "#22c55e" },
            { label: "Analyst consensus", status: "synthesized", color: "#22c55e" },
            { label: "Risk factors", status: "surfaced", color: "#a1a1aa" },
        ],
    },
    {
        id: "signal",
        tag: "No Noise",
        title: "Signal, not opinion.",
        subtitle: "No forecasts. No buy signals. No advice.",
        accent: "#ffffff",
        rows: [
            { label: "Public data only", status: "verified", color: "#a1a1aa" },
            { label: "Sourced & cited", status: "always", color: "#a1a1aa" },
            { label: "Your call to make", status: "not ours", color: "#71717a" },
        ],
    },
    {
        id: "speed",
        tag: "Time to Insight",
        title: "3 hours \u2192 3 minutes.",
        subtitle: "Spend your time on the analysis, not the assembly.",
        accent: "#3b82f6",
        rows: [
            { label: "News sentiment", status: "scored", color: "#3b82f6" },
            { label: "Research history", status: "saved", color: "#a1a1aa" },
            { label: "PDF export", status: "one click", color: "#a1a1aa" },
        ],
    },
];

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.5 },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

export default function Hero() {
    return (
        <section className="relative min-h-screen w-full bg-[#030303] text-white overflow-hidden selection:bg-white/20">

            {/* Background */}
            <div className="absolute inset-0 z-0">
                <DottedSurface />
            </div>

            {/* Radial top glow — single, centered */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 100%)",
                }}
            />

            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center pt-24 pb-32 max-w-[1200px] mx-auto px-6">

                {/* Eyebrow */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex items-center gap-2 mb-8"
                >
                    <span
                        className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e]"
                        style={{ boxShadow: "0 0 6px #22c55e" }}
                    />
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
                        Waitlist Open
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-[80px] font-medium text-center leading-[1.05] tracking-tight max-w-3xl"
                >
                    Own your <br />
                    <span className="text-zinc-400">equity research.</span>
                </motion.h1>

                {/* Subline */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="mt-6 text-sm md:text-base text-zinc-500 text-center max-w-md leading-relaxed"
                >
                    You already know how to read a balance sheet.
                    Stop spending 3 hours gathering the data before you can start.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="mt-8"
                >
                    <Link href="/signup" passHref>
                        <div className="cursor-pointer rounded-full inline-block">
                            <LiquidMetalButton label="Join Waitlist" viewMode="text" />
                        </div>
                    </Link>
                </motion.div>

                {/* Card Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {CARDS.map((card) => (
                        <DataCard key={card.id} card={card} />
                    ))}
                </motion.div>

                {/* Bottom disclaimer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="mt-10 text-[11px] font-mono text-zinc-700 tracking-wider uppercase"
                >
                    Public data only &mdash; not financial advice &mdash; not a licensed advisor
                </motion.p>
            </div>
        </section>
    );
}

interface CardRow {
    label: string;
    status: string;
    color: string;
}

interface CardData {
    id: string;
    tag: string;
    title: string;
    subtitle: string;
    accent: string;
    rows: CardRow[];
}

function DataCard({ card }: { card: CardData }) {
    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
            className="group relative rounded-2xl border border-white/[0.06] bg-[#0e0e0e] p-5 overflow-hidden cursor-pointer"
            style={{ willChange: "transform" }}
        >
            {/* Subtle top-edge accent line */}
            <div
                className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${card.accent}40, transparent)` }}
            />

            {/* Card header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest mb-1">
                        {card.subtitle}
                    </p>
                    <h3 className="text-base font-medium text-white tracking-tight">
                        {card.title}
                    </h3>
                </div>
                <span
                    className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] border border-white/[0.06] px-2 py-1 rounded-md tracking-wide whitespace-nowrap"
                >
                    {card.tag}
                </span>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-white/[0.05] mb-4" />

            {/* Data rows */}
            <div className="space-y-3">
                {card.rows.map((row, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500 font-mono">{row.label}</span>
                        <div className="flex items-center gap-1.5">
                            <span
                                className="inline-block w-1 h-1 rounded-full"
                                style={{ backgroundColor: row.color }}
                            />
                            <span
                                className="text-[11px] font-mono"
                                style={{ color: row.color }}
                            >
                                {row.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom mono line — signature terminal feel */}
            <div className="mt-5 pt-4 border-t border-white/[0.04]">
                <p className="text-[10px] font-mono text-zinc-700 leading-relaxed">
                    clyve / <span className="text-zinc-600">layer.{card.id}</span>
                </p>
            </div>
        </motion.div>
    );
}