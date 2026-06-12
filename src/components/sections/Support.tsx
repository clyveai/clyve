"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Zap,
    Target,
    BarChart3,
    ShieldCheck,
    HelpCircle,
    MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

import { BookOpen, MessageSquareText, ShieldOff, Users, Infinity } from "lucide-react";

const faqs = [
    {
        id: 1,
        icon: <BookOpen className="w-5 h-5 text-blue-400" />,
        question: "What exactly is Clyve AI?",
        answer: "Clyve AI is a financial research assistant that structures publicly available market data, SEC filings, and financial news into clear, readable research briefs. We don't predict markets or give financial advice — we organize information so you can form your own view, faster."
    },
    {
        id: 2,
        icon: <MessageSquareText className="w-5 h-5 text-amber-500" />,
        question: "What kind of questions can I ask Clyve?",
        answer: "Anything research-oriented. Ask about a company's revenue trend, what a 10-K filing says about their debt structure, recent news around an earnings report, or how a stock has performed over a given period. If it's a factual equity question, Clyve can structure the answer."
    },
    {
        id: 3,
        icon: <ShieldOff className="w-5 h-5 text-emerald-500" />,
        question: "Is Clyve a financial advisor?",
        answer: "No — and that's intentional. Clyve surfaces structured data and organized context from public sources. We do not issue buy/sell recommendations, price targets, or investment advice. What you do with the research is entirely your decision."
    },
    {
        id: 4,
        icon: <Users className="w-5 h-5 text-violet-500" />,
        question: "Who is Clyve built for?",
        answer: "Serious retail investors and independent analysts who are tired of toggling between earnings PDFs, news feeds, and screeners. If you do your own research and want the information layer to be faster and cleaner, Clyve is built for you."
    },
    {
        id: 5,
        icon: <Infinity className="w-5 h-5 text-zinc-300" />,
        question: "How does the query limit work?",
        answer: "Free users get 3 lifetime queries to explore what Clyve can do. Pro subscribers get unlimited research queries at $19/month or $149/year. No hidden credits, no usage tiers — just flat access to the full research layer."
    }
];

export default function SupportSection() {
    const [openId, setOpenId] = useState<number | null>(null);

    return (
        <section className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-20 font-sans">

            {/* Header Icon */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full" />
                    <MessageCircle className="w-12 h-12 relative z-10 text-white" fill="white" />
                </div>
            </motion.div>

            {/* Hero Text */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-medium tracking-tight mb-4">Need backup?</h1>
                <p className="text-gray-500 text-sm tracking-wide">
                    We're here to help you stay in Clyve AI.
                </p>
            </div>

            {/* FAQ Section */}
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-medium mb-2">Clyve Essentials</h2>
                    <p className="text-gray-500 text-sm italic">Everything you need to know.</p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq) => (
                        <motion.div
                            key={faq.id}
                            className="group border border-white/5 bg-[#0A0A0A] rounded-xl overflow-hidden"
                            initial={false}
                        >
                            <button
                                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                                className="w-full px-5 py-4 flex items-start gap-4 text-left transition-colors hover:bg-white/[0.02]"
                            >
                                <div className="mt-1">{faq.icon}</div>
                                <div className="flex-1">
                                    <span className="text-[15px] font-medium text-gray-200">
                                        {faq.question}
                                    </span>
                                    <AnimatePresence>
                                        {openId === faq.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <p className="pt-3 text-sm leading-relaxed text-gray-400">
                                                    {faq.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <X className={cn(
                                    "w-4 h-4 text-gray-600 transition-transform duration-300",
                                    openId === faq.id ? "rotate-0" : "rotate-45"
                                )} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer Support */}
            <div className="mt-16 text-center">
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
            </div>

            {/* Bottom Glow Effect */}
            {/* <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-red-600/20 blur-[120px] pointer-events-none" /> */}
        </section>
    );
}