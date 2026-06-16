"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookOpen, MessageSquareText, ShieldOff, Users, Activity } from "lucide-react";

// ─── FAQ CONFIG ───────────────────────────────────────────────────────────────
// Keep pricing copy in sync with Pricing.tsx TIERS config.
// Current model: Free = 3 lifetime, Pro = 50 queries/mo at $19/mo or $149/yr.

const faqs = [
    {
        id: 1,
        icon: <BookOpen className="w-5 h-5 text-blue-400" />,
        question: "What exactly is Clyve AI?",
        answer:
            "Clyve AI is a financial research assistant that structures publicly available market data, SEC filings, and financial news into clear, readable research briefs. We don't predict markets or give financial advice — we organize information so you can form your own view, faster.",
    },
    {
        id: 2,
        icon: <MessageSquareText className="w-5 h-5 text-amber-500" />,
        question: "What kind of questions can I ask Clyve?",
        answer:
            "Anything research-oriented. Ask about a company's revenue trend, what a 10-K filing says about their debt structure, recent news around an earnings report, or how a stock has performed over a given period. If it's a factual equity question, Clyve can structure the answer.",
    },
    {
        id: 3,
        icon: <ShieldOff className="w-5 h-5 text-emerald-500" />,
        question: "Is Clyve a financial advisor?",
        answer:
            "No — and that's intentional. Clyve surfaces structured data and organized context from public sources. We do not issue buy/sell recommendations, price targets, or investment advice. What you do with the research is entirely your decision.",
    },
    {
        id: 4,
        icon: <Users className="w-5 h-5 text-violet-500" />,
        question: "Who is Clyve built for?",
        answer:
            "Serious independent investors and analysts who are tired of toggling between earnings PDFs, news feeds, and screeners. If you do your own research and want your research process to be faster and cleaner, Clyve is built for you.",
    },
    {
        id: 5,
        icon: <Activity className="w-5 h-5 text-zinc-300" />,
        question: "How does the query limit work?",
        answer:
            "Free users get 3 lifetime queries to explore what a full structured brief looks like. Pro subscribers get 50 queries per month, which resets every billing cycle. That covers serious research on 10–15 positions per month. No hidden usage tiers, no surprise charges — your limit is always visible in your dashboard.",
    },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function SupportSection() {
    const [openId, setOpenId] = useState<number | null>(null);

    return (
        <section className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-20 font-sans">

            {/* Header icon */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-6"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full" />
                    <MessageCircle className="w-12 h-12 relative z-10 text-white" fill="white" />
                </div>
            </motion.div>

            {/* Hero text */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                className="text-center mb-16"
            >
                <h1 className="text-5xl font-medium tracking-tight mb-4">Need backup?</h1>
                <p className="text-gray-500 text-sm tracking-wide">
                    We're here to help you get the most out of Clyve AI.
                </p>
            </motion.div>

            {/* FAQ list */}
            <div className="w-full max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-10"
                >
                    <h2 className="text-3xl font-medium mb-2">Clyve Essentials</h2>
                    <p className="text-gray-500 text-sm italic">Everything you need to know.</p>
                </motion.div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.12 + index * 0.06 }}
                            className="border border-white/5 bg-[#0A0A0A] rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() =>
                                    setOpenId(openId === faq.id ? null : faq.id)
                                }
                                className="w-full px-5 py-4 flex items-start gap-4 text-left transition-colors hover:bg-white/[0.02]"
                            >
                                <div className="mt-1 flex-shrink-0">{faq.icon}</div>

                                <div className="flex-1 min-w-0">
                                    <span className="text-[15px] font-medium text-gray-200">
                                        {faq.question}
                                    </span>
                                    <AnimatePresence initial={false}>
                                        {openId === faq.id && (
                                            <motion.div
                                                key="answer"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.28, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <p className="pt-3 text-sm leading-relaxed text-gray-400">
                                                    {faq.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <X
                                    className={cn(
                                        "w-4 h-4 text-gray-600 flex-shrink-0 mt-1 transition-transform duration-300",
                                        openId === faq.id ? "rotate-0" : "rotate-45"
                                    )}
                                />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer support */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-16 text-center"
            >
                <p className="text-gray-500 font-medium text-xs mb-1">
                    Can't find the answer you were looking for? Ask us directly.
                </p>
                <p className="text-gray-500 font-medium text-xs mb-4">Contact us at</p>
                <a
                    href="https://www.instagram.com/clyveai/"
                    className="text-orange-500 font-medium hover:underline decoration-orange-500/30"
                >
                    @Clyve AI
                </a>
            </motion.div>
        </section>
    );
}