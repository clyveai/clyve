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
                            These Terms & Conditions ("Terms") govern your use of <span className="text-white font-medium">Clyve AI</span>. By accessing our platform or purchasing our smart prompts, you agree to be bound by these Terms.
                        </p>

                        {/* Last Updated with Icon */}
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-zinc-600 uppercase tracking-[0.2em]">
                            <CalendarPlus size={12} strokeWidth={2.5} className="text-zinc-700" />
                            <span>Last updated: April 20, 2026</span>
                        </div>
                    </header>

                    {/* Content Sections - Tight & Balanced Spacing */}
                    <div className="space-y-8 text-zinc-400 leading-relaxed text-sm md:text-base">

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">About Clyve AI</h2>
                            <p>
                                Clyve AI is a specialized platform providing advanced <span className="text-white">Smart Prompts</span>. Our products are engineered to significantly upgrade the reasoning, creativity, and efficiency of Large Language Models (LLMs) like Claude for professional-grade output.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">Accounts</h2>
                            <p>
                                Access to our services is provided via Google or Apple ID authentication. You are solely responsible for maintaining the security of your account credentials and for all activities that occur under your identity.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">Smart Prompts & Usage</h2>
                            <p className="mb-2">
                                Purchasing a product grants you a non-transferable, personal-use license. Given the proprietary nature of our digital assets, you agree:
                            </p>
                            <ul className="space-y-1">
                                <li className="flex gap-2 items-start">
                                    <span className="text-zinc-700">•</span>
                                    <span>Not to redistribute, leak, or resell Clyve AI prompt formulas to any third party.</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <span className="text-zinc-700">•</span>
                                    <span>Not to use our prompts for illegal activities or in violation of AI safety guidelines.</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">Payments & Refunds</h2>
                            <p>
                                All transactions are final. Since our products consist of digital intellectual property that is instantly accessible and replicable, we do not offer refunds once access to the prompt content has been granted.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-base font-semibold text-white mb-1 tracking-tight">Intellectual Property</h2>
                            <p>
                                All instruction architectures, prompt logic, and interface designs are the exclusive property of Clyve Labs. Reverse-engineering our delivery systems or prompt structures is strictly prohibited.
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