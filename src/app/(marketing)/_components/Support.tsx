"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookOpen, MessageSquareText, ShieldOff, Users, Activity } from "lucide-react";

// ─── FAQ CONFIG ───────────────────────────────────────────────────────────────
// Keep pricing copy in sync with Pricing.tsx TIERS config.
// Positioning, ClyveAI is the memory layer for your investment thesis, not a research chatbot.

const faqs = [
    {
        id: 1,
        icon: <BookOpen className="w-5 h-5 text-blue-400" />,
        question: "What exactly is ClyveAI?",
        answer:
            "ClyveAI is an investment intelligence platform built around your thesis. You record why you hold a position, and Clyve continuously tracks filings, news, and company events to flag the moment reality starts to diverge from what you believed. It is not a chatbot you query, it is the memory layer that holds you accountable to your own reasoning.",
    },
    {
        id: 2,
        icon: <MessageSquareText className="w-5 h-5 text-amber-500" />,
        question: "How is this different from asking an AI chatbot about a stock?",
        answer:
            "A chatbot answers a question once and forgets it. Clyve remembers the specific thesis you recorded for each position, permanently, and keeps checking new filings and news against it. The value compounds, the longer you use Clyve, the more thesis history it holds and the sharper its drift detection becomes.",
    },
    {
        id: 3,
        icon: <ShieldOff className="w-5 h-5 text-emerald-500" />,
        question: "Is Clyve a financial advisor?",
        answer:
            "No, and that is intentional. Clyve does not issue buy or sell recommendations, price targets, or investment advice. It surfaces structured evidence from public filings and news, and shows you whether that evidence still supports the reasoning you originally recorded. What you do with that is entirely your decision.",
    },
    {
        id: 4,
        icon: <Users className="w-5 h-5 text-violet-500" />,
        question: "Who is Clyve built for?",
        answer:
            "Independent investors and analysts who already do their own research but lose track of why they entered a position months later. If you have ever looked at a holding and thought 'why did I buy this again,' Clyve exists to answer that question for you, automatically.",
    },
    {
        id: 5,
        icon: <Activity className="w-5 h-5 text-zinc-300" />,
        question: "How does thesis tracking actually work?",
        answer:
            "For each position, you record your thesis, the specific assumptions your investment depends on. Clyve monitors filings and news against those assumptions and marks each position green, yellow, or red depending on whether your reasoning still holds. Instead of a raw feed of every event, Clyve gives you one curated, periodic summary per position, so your history reads like a document, not a stream of alerts.",
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
                    className="text-orange-500 font-medium no-underline hover:no-underline hover:text-orange-600 transition-colors duration-200"
                >
                    @ClyveAI
                </a>
            </motion.div>
        </section>
    );
}