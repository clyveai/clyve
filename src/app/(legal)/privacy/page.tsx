"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
    return (
        /* REVISI: Menggunakan pt-32 agar sinkron dengan section pricing & terms */
        <main className="min-h-screen bg-[#000000] text-white font-sans selection:bg-white selection:text-black pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                    <header className="mb-12">
                        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tight mb-2 text-white">
                            Privacy Policy
                        </h1>
                        <p className="text-zinc-500 font-medium">Effective Date: April 2, 2026</p>
                    </header>

                    {/* Menggunakan glass-dark dan rounded-[2rem] agar identik dengan pricing */}
                    <div className="glass-dark p-6 md:p-10 rounded-[2rem] border border-white/5 space-y-10 leading-relaxed text-zinc-400 text-sm md:text-base">

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Data Collection Scope</h2>
                            <p>To facilitate advanced AI campaign workflows, we collect the following:</p>
                            <ul className="list-disc pl-5 mt-3 space-y-2">
                                <li><strong className="text-white">Account Data:</strong> Information provided during registration.</li>
                                <li><strong className="text-white">UGC Assets:</strong> Images and videos uploaded for AI transformation.</li>
                                <li><strong className="text-white">Operational Data:</strong> Prompt history and workflow configurations used to optimize the Nano Banana Pro engine.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Processing & AI Training</h2>
                            <p>
                                Clyve prioritizes user confidentiality. Your uploaded campaign assets are processed in a secure environment. We do not use your private UGC (User Generated Content) to train public AI models without your explicit participation in our opt-in research programs.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Data Security Measures</h2>
                            <p>
                                We employ enterprise-grade encryption for data at rest and in transit. Access to uploaded media is restricted to the authenticated user account. While we strive for absolute security, no method of transmission over the internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Retention & Deletion</h2>
                            <p>
                                Users have the right to request the permanent deletion of their data. Upon account termination or a specific deletion request, all assets related to your account will be purged from our servers within a 30-day window.
                            </p>
                        </section>

                        <section className="pt-8 border-t border-white/5 text-xs md:text-sm text-zinc-500 italic">
                            For privacy-related inquiries or to exercise your data rights, contact: <span className="text-white not-italic font-medium">support@clyve.com</span>
                        </section>

                    </div>
                </motion.div>
            </div>
        </main>
    );
}