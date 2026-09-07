"use client";

import { motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800 selection:text-white pt-24 pb-20 scroll-smooth">
            <div className="max-w-3xl mx-auto px-8">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                    {/* Header Area */}
                    <header className="mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Terms & Conditions
                        </h1>
                        <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
                            These Terms & Conditions ("Terms") govern your use of <span className="text-white font-medium">ClyveAI</span>. By accessing our platform, you agree to the terms below. They are written to be clear, not complicated.
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-zinc-600 uppercase tracking-[0.2em]">
                            <CalendarPlus size={12} strokeWidth={2.5} className="text-zinc-700" />
                            <span>Effective Date: June 12, 2026</span>
                        </div>
                    </header>

                    {/* Content Sections */}
                    <div className="space-y-8 text-zinc-400 leading-relaxed text-sm md:text-base">

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">1. What ClyveAI Does (and Doesn't Do)</h2>
                            <p>
                                ClyveAI is an investment intelligence platform built around your thesis. You record why you hold a position, and we track filings, news, and company events against it, flagging the moment reality starts to diverge. We do not generate proprietary data, predict prices, or write your thesis for you. That part is entirely yours.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">2. Not Financial Advice. Not Ever.</h2>
                            <p>
                                Nothing on ClyveAI is financial advice. We are not a licensed advisor, broker, or research firm. Every alert and summary you see is structured public evidence checked against your own reasoning, not a recommendation to act. Any investment decision you make is entirely your own responsibility. ClyveAI bears no liability for trading outcomes, capital performance, or financial decisions made using our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">3. Your Account, Your Access</h2>
                            <p className="mb-2">
                                Your account is personal and non-transferable. Access is governed by your active subscription tier. Two rules apply to everyone:
                            </p>
                            <ul className="space-y-1">
                                <li className="flex gap-2 items-start">
                                    <span className="text-zinc-700">•</span>
                                    <span>Your login credentials are for you only. Do not share or resell access.</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <span className="text-zinc-700">•</span>
                                    <span>Automated scraping, bulk data extraction, or programmatic abuse of the platform is strictly prohibited and will result in immediate account termination.</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">4. Intellectual Property</h2>
                            <p>
                                The platform, including its interface, data pipeline, and underlying logic, belongs to ClyveAI. You are welcome to export and use your thesis entries and summaries for personal or internal research. Redistributing, reverse engineering, or commercially repurposing ClyveAI's output or codebase is not permitted.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">5. Billing & Refund Policy</h2>
                            <p>
                                Subscriptions renew monthly or annually. Because infrastructure costs activate the moment you subscribe (live data feeds, cloud compute, continuous monitoring), all payments are non-refundable once processed. You can cancel anytime from your account dashboard to stop future charges. Cancellation takes effect at the end of your current billing period.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">6. Acceptable Use</h2>
                            <p>
                                Use ClyveAI in good faith and in compliance with applicable laws. Any attempt to disrupt the platform, exploit system vulnerabilities, or bypass usage controls will result in immediate account termination without refund, and may be escalated legally where warranted.
                            </p>
                        </section>

                        {/* Footer Section */}
                        <footer className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
                            <p>© 2026 ClyveAI</p>
                            <p>
                                Contact:{" "}
                                <a
                                    href="https://instagram.com/clyveai"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white font-bold hover:text-zinc-300 transition-colors"
                                >
                                    @clyveai
                                </a>
                            </p>
                        </footer>

                    </div>
                </motion.div>
            </div>
        </main>
    );
}