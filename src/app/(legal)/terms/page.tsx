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
                            These Terms & Conditions ("Terms") govern the professional use of <span className="text-white font-medium">Clyve AI</span>. By accessing our platform or utilizing our proprietary analytical tools, you agree to be bound by these formal protocols.
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-zinc-600 uppercase tracking-[0.2em]">
                            <CalendarPlus size={12} strokeWidth={2.5} className="text-zinc-700" />
                            <span>Effective Date: April 20, 2026</span>
                        </div>
                    </header>

                    {/* Content Sections */}
                    <div className="space-y-8 text-zinc-400 leading-relaxed text-sm md:text-base">

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">1. Scope of Service</h2>
                            <p>
                                Clyve AI is a financial intelligence platform providing market sentiment analysis and predictive data modeling. All outputs are generated through advanced Large Language Models (LLMs) and structured datasets to support quantitative and qualitative research.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">2. Financial Liability Disclaimer</h2>
                            <p>
                                Clyve AI does not provide financial, investment, or legal advice. All data generated is for informational and educational purposes only. Users are solely responsible for their investment decisions. Clyve AI shall not be held liable for any financial losses or damages resulting from the use of the platform's analytical data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">3. Subscription & Resource Allocation</h2>
                            <p className="mb-2">
                                Access to Clyve AI is governed by a subscription-based credit system. Credits are utilized to process real-time market data and generate high-fidelity reports.
                            </p>
                            <ul className="space-y-1">
                                <li className="flex gap-2 items-start">
                                    <span className="text-zinc-700">•</span>
                                    <span>User accounts are strictly personal and non-transferable.</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <span className="text-zinc-700">•</span>
                                    <span>Automated extraction (scraping) of Clyve AI’s proprietary data or interface is strictly prohibited.</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">4. Intellectual Property Rights</h2>
                            <p>
                                All analytical frameworks, system architectures, and interface designs are the exclusive intellectual property of Clyve AI. Unauthorized reproduction, reverse-engineering, or redistribution of the platform's internal logic is a direct violation of these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">5. Billing & Refund Policy</h2>
                            <p>
                                Due to the immediate allocation of computational resources and the digital nature of the services provided, all transactions are final. Subscriptions can be managed or canceled at any time to avoid future billing cycles, but no refunds will be issued for processed payments.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">6. Compliance</h2>
                            <p>
                                Users agree to utilize Clyve AI in accordance with international financial regulations and AI safety guidelines. Any misuse that compromises the integrity of our infrastructure will result in immediate account termination.
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