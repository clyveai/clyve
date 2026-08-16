"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import {
    IconSearch,
    IconChartBar,
    IconFileText,
    IconSparkles,
    IconArrowRight,
    IconBuildingBank,
    IconUser,
    IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseCase {
    id: string;
    icon: React.ReactNode;
    audience: string;
    headline: string;
    description: string;
    workflow: string[];
    stat: { value: string; label: string };
}

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const USE_CASES: UseCase[] = [
    {
        id: "independent-investor",
        icon: <IconUser size={18} />,
        audience: "Independent Investors",
        headline: "You already know why you bought. Clyve makes sure you still do.",
        description:
            "Six months after opening a position, most investors could not restate their own thesis if asked. Clyve holds the reasons you held in the first place, then checks them against every filing and disclosure that follows, so conviction is never something you have to reconstruct from memory.",
        workflow: [
            "Record your thesis in plain language when you open a position",
            "Clyve converts it into specific, checkable assumptions",
            "New filings and news are matched against those assumptions",
            "You are notified only when something material shifts",
        ],
        stat: { value: "0", label: "Assumptions forgotten" },
    },
    {
        id: "serious-retail",
        icon: <IconChartBar size={18} />,
        audience: "Serious Retail & HNW",
        headline: "Your conviction should decay on evidence, not on silence.",
        description:
            "Most portfolios drift not because the thesis broke, but because nobody was watching for the moment it did. Clyve tracks each assumption independently, so you know exactly which part of your reasoning is holding and which part has quietly stopped being true.",
        workflow: [
            "Track multiple theses across a full portfolio",
            "See each assumption scored individually, not as one blended score",
            "Get flagged the moment an assumption weakens, not when the price moves",
            "Review a running history of what changed and when",
        ],
        stat: { value: "Per assumption", label: "Not per headline" },
    },
    {
        id: "analysts",
        icon: <IconUsers size={18} />,
        audience: "Analysts",
        headline: "A record of what you believed, not just what you published.",
        description:
            "A research note captures a moment. It does not tell you, six quarters later, which of your original assumptions were right. Clyve keeps that thread alive, so your track record is built from evidence, not from memory of your own calls.",
        workflow: [
            "Attach a structured thesis to every coverage initiation",
            "Let evidence accumulate against each assumption automatically",
            "Revisit any call with its full evidence trail intact",
            "Export a clean thesis history for your own record",
        ],
        stat: { value: "Full trail", label: "Claim to evidence" },
    },
    {
        id: "investment-teams",
        icon: <IconBuildingBank size={18} />,
        audience: "Investment Teams",
        headline: "What the team believes should not live in one person's head.",
        description:
            "When conviction is undocumented, it cannot be reviewed, challenged, or handed off. Clyve gives a team a shared, structured record of what is believed, why, and what has changed since, so alignment does not depend on who happens to remember the original call.",
        workflow: [
            "Shared thesis records across every position the team holds",
            "Visibility into who changed their view, and when",
            "One evidence trail everyone on the team can query",
            "Coming soon: workspace access for teams and firms",
        ],
        stat: { value: "Soon", label: "Team workspace" },
    },
];

const CORE_CAPABILITIES: Feature[] = [
    {
        icon: <IconFileText size={16} />,
        title: "SEC EDGAR Native",
        description:
            "Direct ingestion of 10-K, 10-Q, 8-K, and proxy filings. No third party data intermediaries.",
    },
    {
        icon: <IconSearch size={16} />,
        title: "Claim to Evidence",
        description:
            "Every flag traces back through claim, event, source, and evidence. Nothing is a black box.",
    },
    {
        icon: <IconSparkles size={16} />,
        title: "Thesis Memory",
        description:
            "What you believed does not disappear after one session. It persists, and it compounds over time.",
    },
    {
        icon: <IconChartBar size={16} />,
        title: "Divergence Detection",
        description:
            "Clyve flags the assumption that broke, not every mention of your ticker in the news.",
    },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    }),
};

const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number = 0) => ({
        opacity: 1,
        transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" as const },
    }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#8a8a94] border border-[#1a1a1a] px-3 py-1 rounded-full">
            {children}
        </span>
    );
}

function UseCaseCard({ useCase, index }: { useCase: UseCase; index: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const isEven = index % 2 === 0;

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
            custom={0}
            className="group relative border border-[#1a1a1a] rounded-[10px] overflow-hidden bg-[#080808] hover:border-[#2a2a2a] transition-colors duration-300"
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 60%)" }}
            />

            <div className={`grid grid-cols-1 lg:grid-cols-2 ${!isEven ? "lg:[direction:rtl]" : ""}`}>
                {/* Content side */}
                <div className={`p-8 lg:p-12 flex flex-col justify-between gap-8 ${!isEven ? "lg:[direction:ltr]" : ""}`}>
                    <div className="space-y-5">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#111111] border border-[#1f1f1f] text-[#71717a]">
                                {useCase.icon}
                            </span>
                            <span className="text-xs font-medium text-[#8a8a94] tracking-wide uppercase">
                                {useCase.audience}
                            </span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight" style={{ letterSpacing: "-0.04em" }}>
                            {useCase.headline}
                        </h2>

                        <p className="text-sm text-[#a1a1aa] leading-relaxed" style={{ letterSpacing: "-0.01em" }}>
                            {useCase.description}
                        </p>
                    </div>

                    <div className="flex items-end gap-4 pt-4 border-t border-[#111111]">
                        <div>
                            <div className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: "-0.04em" }}>
                                {useCase.stat.value}
                            </div>
                            <div className="text-xs text-[#8a8a94] mt-0.5">{useCase.stat.label}</div>
                        </div>
                    </div>
                </div>

                {/* Workflow side */}
                <div className={`border-t lg:border-t-0 border-[#1a1a1a] p-8 lg:p-12 flex flex-col justify-center gap-3 ${!isEven ? "lg:[direction:ltr] lg:border-r lg:border-l-0" : "lg:border-l"}`}>
                    <p className="text-xs font-medium text-[#71717a] uppercase tracking-widest mb-2">
                        Workflow
                    </p>
                    {useCase.workflow.map((step, i) => (
                        <motion.div
                            key={i}
                            initial="hidden"
                            animate={inView ? "visible" : "hidden"}
                            variants={fadeIn}
                            custom={i + 1}
                            className="flex items-start gap-3 group/step"
                        >
                            <span className="flex-shrink-0 w-5 h-5 rounded-full border border-[#1f1f1f] bg-[#0d0d0d] flex items-center justify-center mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#3f3f46] group-hover/step:bg-white transition-colors duration-200" />
                            </span>
                            <span className="text-sm text-[#a1a1aa] leading-relaxed group-hover/step:text-[#e4e4e7] transition-colors duration-200">
                                {step}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function CapabilityCard({ feature, index }: { feature: Feature; index: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
            custom={index * 0.5}
            className="group p-6 border border-[#1a1a1a] rounded-[10px] bg-[#080808] hover:border-[#2a2a2a] hover:bg-[#0a0a0a] transition-all duration-300"
        >
            <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#111111] border border-[#1f1f1f] text-[#71717a] group-hover:text-white group-hover:border-[#2f2f2f] transition-all duration-300">
                    {feature.icon}
                </span>
                <span className="text-sm font-semibold text-[#e4e4e7]">{feature.title}</span>
            </div>
            <p className="text-sm text-[#a1a1aa] leading-relaxed" style={{ letterSpacing: "-0.01em" }}>
                {feature.description}
            </p>
        </motion.div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UseCasesPage() {
    const heroRef = useRef(null);
    const heroInView = useInView(heroRef, { once: true });

    return (
        <main className="min-h-screen bg-[#000000] text-white">
            {/* ── Hero ── */}
            <section ref={heroRef} className="relative pt-32 pb-24 px-6 overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
                        backgroundSize: "80px 80px",
                    }}
                />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 60%)",
                    }}
                />

                <div className="relative max-w-4xl mx-auto text-center space-y-6">
                    <motion.div
                        initial="hidden"
                        animate={heroInView ? "visible" : "hidden"}
                        variants={fadeUp}
                        custom={0}
                    >
                        <SectionLabel>Use Cases</SectionLabel>
                    </motion.div>

                    <motion.h1
                        initial="hidden"
                        animate={heroInView ? "visible" : "hidden"}
                        variants={fadeUp}
                        custom={1}
                        className="text-5xl lg:text-7xl font-bold tracking-tight gradient-text"
                        style={{ letterSpacing: "-0.04em" }}
                    >
                        Who Clyve is built for.
                    </motion.h1>

                    <motion.p
                        initial="hidden"
                        animate={heroInView ? "visible" : "hidden"}
                        variants={fadeUp}
                        custom={2}
                        className="text-base lg:text-lg text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed"
                        style={{ letterSpacing: "-0.01em" }}
                    >
                        Clyve is not a research tool you query and forget. It is the{" "}
                        <span className="text-[#e4e4e7]">memory layer between what you believe and what actually happens</span>,
                        built for anyone whose conviction needs to survive contact with new evidence.
                    </motion.p>
                </div>
            </section>

            {/* ── Use Cases ── */}
            <section className="px-6 pb-24 max-w-6xl mx-auto space-y-4">
                {USE_CASES.map((useCase, index) => (
                    <UseCaseCard key={useCase.id} useCase={useCase} index={index} />
                ))}
            </section>

            {/* ── Core Capabilities ── */}
            <section className="px-6 pb-24 max-w-6xl mx-auto">
                <div className="border-t border-[#1a1a1a] pt-16 space-y-12">
                    <div className="flex flex-col items-start gap-4">
                        <SectionLabel>Core Capabilities</SectionLabel>
                        <h2
                            className="text-3xl lg:text-4xl font-bold gradient-text"
                            style={{ letterSpacing: "-0.04em" }}
                        >
                            What powers every thesis.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {CORE_CAPABILITIES.map((feature, index) => (
                            <CapabilityCard key={feature.title} feature={feature} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="px-6 pb-32 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="relative rounded-[10px] border border-[#1a1a1a] bg-[#080808] p-12 lg:p-16 overflow-hidden text-center"
                >
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                        }}
                    />
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 pointer-events-none"
                        style={{
                            background:
                                "radial-gradient(ellipse at top, rgba(255,255,255,0.05) 0%, transparent 70%)",
                        }}
                    />

                    <div className="relative space-y-6 max-w-xl mx-auto">
                        <h2
                            className="text-3xl lg:text-4xl font-bold gradient-text"
                            style={{ letterSpacing: "-0.04em" }}
                        >
                            Record your first thesis.
                        </h2>
                        <p className="text-sm text-[#a1a1aa]" style={{ letterSpacing: "-0.01em" }}>
                            Free tier available. No credit card required. NYSE and NASDAQ coverage from day one.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <Link href="/signup">
                                <button className="btn-primary px-6 py-2.5 text-sm rounded-[10px] inline-flex items-center">
                                    Get Started
                                    <IconArrowRight size={14} className="ml-2" />
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="btn-secondary px-6 py-2.5 text-sm rounded-[10px]">
                                    View Pricing
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}