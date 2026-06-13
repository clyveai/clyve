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
                            Your research is your own. <span className="text-white font-medium">Clyve AI</span> is built to structure public data, not to collect, monitor, or profit from yours. Here's exactly how we handle your information.
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
                                Clyve AI only works with publicly available information: regulatory filings, earnings releases, financial news, and public market metrics. We do not ingest, process, or store non-public, insider, or proprietary data of any kind. If it's not already public, it's not part of our pipeline.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">2. Your Queries Are Private</h2>
                            <p>
                                What you research on Clyve stays yours. We do not monitor your search history for commercial purposes, sell your usage patterns to third parties, or use your queries to train any AI model, ours or anyone else's. Your research process is private by design.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">3. How We Protect Your Data</h2>
                            <p>
                                Your account data, research history, and session information are encrypted using AES-256, the same standard used by financial institutions. Access is strictly authenticated, and your data is never exposed to unauthorized parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">4. Third-Party AI Providers</h2>
                            <p>
                                To structure and format research briefs, Clyve AI routes queries through third-party AI providers via secure, enterprise-grade APIs. These providers are contractually prohibited from retaining or using your queries for model training. Your inputs are processed in real time and not stored on their end.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">5. Your Right to Delete</h2>
                            <p>
                                You're in full control of your data. You can clear your research history or request permanent account deletion at any time from your account dashboard. Once submitted, all associated data will be permanently removed from our systems within 30 days.
                            </p>
                        </section>

                        {/* Footer Section */}
                        <footer className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
                            <p>© 2026 Clyve AI</p>
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