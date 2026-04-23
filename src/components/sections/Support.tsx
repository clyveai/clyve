"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    MessageCircle,
    HelpCircle,
    CreditCard,
    Zap,
    ShieldCheck,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils"; // Pastikan utilitas ini ada dari instalasi shadcn

const faqs = [
    {
        id: 1,
        icon: <HelpCircle className="w-5 h-5 text-yellow-400" />,
        question: "What exactly is Clyve AI?",
        answer: "Clyve AI is the tactical logic layer between raw intent and absolute precision. It is an engineering blueprint designed to strip away AI noise and command high-performance results through cold, calculated structural power."
    },
    {
        id: 2,
        icon: <Zap className="w-5 h-5 text-red-500" />,
        question: "How does 'Smart Prompt Logic' work?",
        answer: "Unlike standard prompts that yield generic results, our logic frameworks act as a neural blueprint. It forces the AI to reason through complex tasks with structured context, eliminating hallucinations and ensuring institutional-grade excellence."
    },
    {
        id: 3,
        icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
        question: "Is my data and input secure?",
        answer: "Absolutely. Clyve AI operates as a local-first logic layer. We do not store, track, or sell your private prompts or business data. Your engineering intelligence remains entirely yours."
    },
    {
        id: 4,
        icon: <Target className="w-5 h-5 text-violet-500" />,
        question: "Who is the Professional tier for?",
        answer: "It is engineered for founders, leaders, and high-level builders. This tier includes a full commercial license and advanced frameworks designed to scale business operations and automate high-stakes decision-making."
    },
    {
        id: 5,
        icon: <CreditCard className="w-5 h-5 text-zinc-200" />,
        question: "Is this really a lifetime deal?",
        answer: "Yes. Invest once, build forever. No hidden subscriptions or monthly fees. You get permanent access to the Clyve AI logic ecosystem and future updates with a single lifetime payment."
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
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-red-600/20 blur-[120px] pointer-events-none" />
        </section>
    );
}