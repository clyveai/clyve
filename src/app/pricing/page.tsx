'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';

const tiers = [
    {
        name: 'Student',
        id: 'tier-student',
        description: 'Optimal logic for high school and university academic excellence.',
        price: 49000,
        href: 'http://lynk.id/clyveai/lgdgrpzyld8l/checkout', // Ganti dengan link kamu
        features: [
            'Instant Thesis & Research Framework',
            'Academic Expert Smart Prompts',
            'Human-Like Logic (Anti-AI Detection)',
            'Fast-Track Learning & Study Systems',
            'Lifetime Access & Student Community',
            'Step-by-Step Critical Thinking Guide',
        ],
        mostPopular: false,
        ctaText: 'Start Learning',
    },
    {
        name: 'Creator',
        id: 'tier-creator',
        description: 'Advanced reasoning for content creators and personal branding.',
        price: 89000,
        href: 'http://lynk.id/clyveai/ggnl986g9e0k/checkout', // Ganti dengan link kamu
        features: [
            'Viral Affiliate & Hook Strategies',
            'Personal Branding Authority Blueprints',
            'High-Conversion Creative Smart Prompts',
            'Advanced Content Multiplier & Optimizer',
            'Monthly Viral Trends & Prompt Updates',
            'Algorithm-Friendly Engagement Logic',
        ],
        mostPopular: true,
        ctaText: 'Start Creating',
    },
    {
        name: 'Professional',
        id: 'tier-pro',
        description: 'Institutional grade AI for market analysis and business scaling.',
        price: 139000,
        href: 'http://lynk.id/clyveai/8l6rpw3dv9e9/checkout', // Ganti dengan link kamu
        features: [
            'Institutional-Grade Market Analysis',
            'Advanced Stock & Crypto Insights Logic',
            'Professional Market Research Frameworks',
            'Full Commercial License',
            'Master Pass: All Student & Creator Access',
            'Priority Business Prompt Updates',
        ],
        mostPopular: false,
        ctaText: 'Go Professional',
    },
];

export default function Pricing() {
    const formatPrice = (price: number) => {
        return `IDR ${price.toLocaleString('id-ID')}`;
    };

    return (
        <section id="pricing" className="relative pt-32 pb-32 bg-[var(--bg-primary)] overflow-hidden font-sans text-[var(--fg-primary)]">
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-white/[0.03] blur-[120px] rounded-full" />
            </div>

            <div className="relative max-w-6xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold tracking-tighter mb-6"
                    >
                        Invest once. <span className="gradient-text">Build forever.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-[var(--fg-secondary)] opacity-70 text-base md:text-lg"
                    >
                        Stop paying monthly. Get the engineering logic that scales Clyve AI with a single lifetime payment.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-center">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative flex flex-col p-8 rounded-[2.5rem] bg-[var(--bg-secondary)] border transition-all duration-500 ${tier.mostPopular
                                ? 'border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.8)] scale-105 z-10'
                                : 'border-white/5 opacity-90'
                                }`}
                        >
                            {tier.mostPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-[var(--fg-primary)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-2 shadow-2xl">
                                    <Zap size={12} fill="currentColor" />
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                                <p className="text-xs text-[var(--fg-secondary)] opacity-60 leading-relaxed min-h-[40px]">
                                    {tier.description}
                                </p>
                            </div>

                            <div className="mb-10 flex flex-col">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter">
                                        {formatPrice(tier.price)}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">
                                        / Life
                                    </span>
                                </div>
                                <p className="text-[9px] font-bold text-[var(--fg-secondary)] uppercase tracking-widest mt-2 opacity-40">
                                    No hidden subscriptions
                                </p>
                            </div>

                            <ul className="flex-1 space-y-4 mb-12">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-xs md:text-sm text-[var(--fg-secondary)]">
                                        <div className="flex-shrink-0 bg-white/5 p-1 rounded-full border border-white/10">
                                            <Check className="w-3.5 h-3.5 text-[var(--fg-primary)]" />
                                        </div>
                                        <span className="opacity-80">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Tombol diganti menjadi anchor tag (a) untuk link eksternal */}
                            <motion.a
                                href={tier.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full py-4 rounded-2xl font-black text-[10px] text-center uppercase tracking-[0.2em] transition-all ${tier.mostPopular
                                    ? 'bg-[var(--fg-primary)] text-[var(--bg-primary)] hover:opacity-90 shadow-xl shadow-white/5'
                                    : 'bg-white/5 text-[var(--fg-primary)] border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {tier.ctaText}
                            </motion.a>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 flex flex-col items-center gap-6 opacity-40">
                    <div className="flex gap-8 items-center text-[var(--fg-secondary)]">
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default">
                            <ShieldCheck size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
                        </div>
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default">
                            <Sparkles size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Instant Delivery</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}