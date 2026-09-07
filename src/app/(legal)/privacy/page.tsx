"use client";

import { motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";

export default function PrivacyPage() {
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
                            Privacy Policy
                        </h1>
                        <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
                            Your thesis is your own. <span className="text-white font-medium">ClyveAI</span> exists to remember it, not to mine it. Here is exactly how we handle your data.
                        </p>

                        {/* Effective Date with Icon */}
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-zinc-600 uppercase tracking-[0.2em]">
                            <CalendarPlus size={12} strokeWidth={2.5} className="text-zinc-700" />
                            <span>Effective Date: June 12, 2026</span>
                        </div>
                    </header>

                    {/* Content Sections */}
                    <div className="space-y-8 text-zinc-400 leading-relaxed text-sm md:text-base">

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">1. What Data We Use</h2>
                            <p>
                                To track your positions, ClyveAI draws only on publicly available information: regulatory filings, earnings releases, financial news, and public market data. We never ingest non-public, insider, or proprietary data of any kind. If it is not already public, it never enters our pipeline.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">2. Your Thesis Stays Yours</h2>
                            <p>
                                Everything you record, your reasoning, your assumptions, your positions, belongs to you alone. We do not read your thesis entries for commercial purposes, sell your holdings or activity to third parties, or use your data to train any AI model, ours or anyone else's. Your thesis is private by design, not by policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">3. How We Protect Your Data</h2>
                            <p>
                                Your account, thesis entries, and session data are encrypted with AES-256, the same standard used by financial institutions. Access is strictly authenticated, and your data is never exposed to unauthorized parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">4. Third-Party AI Providers</h2>
                            <p>
                                To check filings and news against your thesis, ClyveAI routes data through third-party AI providers via secure, enterprise-grade APIs. These providers are contractually prohibited from retaining or using your data for model training. Your inputs are processed in real time and not stored on their end.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">5. Your Right to Delete</h2>
                            <p>
                                You are in full control of your data. You can request permanent account deletion at any time from your account dashboard. Once submitted, all associated data, including every thesis entry and its history, will be permanently removed from our systems within 30 days.
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