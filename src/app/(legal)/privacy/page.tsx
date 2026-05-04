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
                            At <span className="text-white font-medium">Clyve AI</span>, we recognize that your market analysis and trade queries are sensitive strategic assets. This policy details our commitment to securing your financial intelligence and the integrity of your data.
                        </p>

                        {/* Effective Date with Icon */}
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-zinc-600 uppercase tracking-[0.2em]">
                            <CalendarPlus size={12} strokeWidth={2.5} className="text-zinc-700" />
                            <span>Effective Date: April 20, 2026</span>
                        </div>
                    </header>

                    {/* Content Sections */}
                    <div className="space-y-8 text-zinc-400 leading-relaxed text-sm md:text-base">

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">1. Data Minimization & Integrity</h2>
                            <p>
                                We operate on a strict principle of data minimization. We only collect essential information for account authentication and secure subscription management. Clyve AI does not store the specific financial datasets or proprietary ticker symbols you analyze beyond the duration of your active session unless explicitly requested for your history.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">2. Query Confidentiality</h2>
                            <p>
                                Your market inquiries and the resulting <span className="text-white">Predictive Insights</span> are strictly confidential. We do not monitor, sell, or train our internal models on your individual search patterns or sentiment queries. Your strategic "edge" remains exclusively yours.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">3. Protection of Financial Intelligence</h2>
                            <p>
                                We understand that market research is part of your professional know-how. All interaction data is encrypted using industry-standard AES-256 protocols. Our infrastructure ensures that your analysis history and account tier details remain inaccessible to unauthorized third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">4. AI Engine Ecosystem</h2>
                            <p>
                                Clyve AI serves as the intelligence layer, while the underlying processing is powered by secure Large Language Models (LLMs). Your data is passed through encrypted APIs to these engines for real-time synthesis. We ensure that our enterprise-grade API agreements prevent your data from being used for generic model training by third-party providers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">5. Sovereignty & Deletion</h2>
                            <p>
                                You maintain absolute sovereignty over your account data. You may request a full export of your analysis history or permanent deletion of your profile at any time. Upon execution, all associated records will be purged from our active high-security servers within 30 days.
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