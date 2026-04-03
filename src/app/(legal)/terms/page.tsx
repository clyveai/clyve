"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#000000] text-white font-sans selection:bg-white selection:text-black py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                    <header className="mb-12">
                        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tight mb-2">Terms of Service</h1>
                        <p className="text-zinc-500 font-medium">Last Updated: April 2, 2026</p>
                    </header>

                    <div className="glass-dark p-6 md:p-10 rounded-[32px] border border-white/5 space-y-10 leading-relaxed text-zinc-400 text-sm md:text-base">

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Agreement</h2>
                            <p>
                                By accessing Clyve, you enter into a legally binding agreement. Our platform provides high-fidelity AI generation and workflow automation for professional content campaigns. Unauthorized use of the service is strictly prohibited.
                            </p>
                        </section>

                        {/* MANDATORY SAFETY SECTION */}
                        <section className="p-6 bg-red-500/[0.03] border border-red-500/10 rounded-2xl">
                            <h2 className="text-lg font-bold text-red-500 mb-3 uppercase tracking-wider">2. Zero-Tolerance Safety Policy</h2>
                            <p className="text-zinc-200 mb-4 font-medium">
                                Clyve enforces a strict policy regarding human likeness and privacy:
                            </p>
                            <ul className="list-disc pl-5 space-y-3 text-zinc-300">
                                <li><span className="text-white font-semibold">Consent:</span> You must not upload images or data of any individual without their explicit, verifiable legal consent.</li>
                                <li><span className="text-white font-semibold">Prohibited Content:</span> Generation of non-consensual sexual imagery (NCII), deepfakes, or misleading political content is strictly forbidden.</li>
                                <li><span className="text-white font-semibold">Public Figures:</span> The use of public figures for commercial campaign generation without licensing is at the user&apos;s own legal risk and may result in account termination.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. User Obligations & Conduct</h2>
                            <p>
                                Users are responsible for all activity under their account. You agree not to bypass any security measures or use the output of Clyve to infringe upon the intellectual property of others.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Intellectual Property</h2>
                            <p>
                                While users retain rights to the specific outputs generated via their prompts (subject to third-party rights), Clyve maintains all rights, titles, and interests in the platform architecture, UI/UX design, and proprietary AI workflow logic.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
                            <p>
                                Clyve and its affiliates shall not be held liable for any damages resulting from the misuse of AI-generated content. We provide the tools; the legal responsibility for the campaign content lies solely with the user.
                            </p>
                        </section>

                    </div>
                </motion.div>
            </div>
        </main>
    );
}