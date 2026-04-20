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
                            At <span className="text-white font-medium">Clyve AI</span>, we recognize that your prompts are your competitive advantage. This policy details our commitment to protecting your data and the strategic integrity of your workflows.
                        </p>

                        {/* Effective Date with Icon */}
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-zinc-600 uppercase tracking-[0.2em]">
                            <CalendarPlus size={12} strokeWidth={2.5} className="text-zinc-700" />
                            <span>Effective Date: April 20, 2026</span>
                        </div>
                    </header>

                    {/* Content Sections - Tight & Balanced Spacing */}
                    <div className="space-y-8 text-zinc-400 leading-relaxed text-sm md:text-base">

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">1. Data Minimization</h2>
                            <p>
                                We operate on a principle of data minimization. We only collect essential information required for account authentication (email via Google/Apple) and secure payment processing. Clyve AI does not have access to, nor do we store, the proprietary data you input into third-party AI models.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">2. Prompt Confidentiality</h2>
                            <p>
                                Your creative and technical application of our <span className="text-white">Smart Prompts</span> is strictly confidential. We do not monitor, log, or train internal models on the specific results or modifications you make to the prompts within your local environment.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">3. Protection of Strategic Assets</h2>
                            <p>
                                We understand that how you use AI is part of your professional "know-how." All account-related data is encrypted using industry-standard protocols. Our infrastructure is built to ensure that your purchase history and account details remain inaccessible to unauthorized entities.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">4. Third-Party Ecosystems</h2>
                            <p>
                                Clyve AI provides the "logic" (prompts), but the "engine" (LLMs like Claude or GPT) is provided by third parties. Your interactions with these engines are subject to their respective privacy policies. We recommend reviewing the data retention settings of the AI providers you utilize.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">5. Control & Erasure</h2>
                            <p>
                                You maintain absolute ownership of your account data. You may request a full export or permanent deletion of your account at any time. Upon request, all associated data will be purged from our active systems within 30 days.
                            </p>
                        </section>

                        {/* Footer with Linked Instagram Accent */}
                        <footer className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
                            <p>© 2026 Clyve Labs Pte. Ltd.</p>
                            <p>
                                Contact:{" "}
                                <a
                                    href="https://instagram.com/clyveai"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-violet-500 font-bold hover:text-violet-400 transition-colors"
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