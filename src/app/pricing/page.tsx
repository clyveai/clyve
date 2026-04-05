'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

const tiers = [
    {
        name: 'Starter',
        id: 'tier-starter',
        description: 'Perfect for exploring AI capabilities and individual projects.',
        monthlyPrice: '$0',
        annualPrice: '$0',
        features: [
            'Basic AI generation tools',
            'Up to 50 campaigns per month',
            'Standard response speed',
            'Community discord access',
        ],
        mostPopular: false,
        ctaText: 'Get Started for Free',
    },
    {
        name: 'Creator',
        id: 'tier-creator',
        description: 'Ideal for professionals scaling their content creation.',
        monthlyPrice: '$29',
        annualPrice: '$24',
        features: [
            'Advanced AI agent access',
            'Unlimited campaign generation',
            'Priority processing speed',
            'Custom workflow templates',
            'Premium email support',
        ],
        mostPopular: true,
        ctaText: 'Upgrade to Creator',
    },
    {
        name: 'Scale',
        id: 'tier-scale',
        description: 'For teams requiring custom integrations and max performance.',
        monthlyPrice: '$99',
        annualPrice: '$79',
        features: [
            'Everything in Creator, plus:',
            'Custom AI model fine-tuning',
            'API access & Webhooks',
            'Dedicated account manager',
            '99.9% uptime SLA',
        ],
        mostPopular: false,
        ctaText: 'Contact Sales',
    },
];

export default function Pricing() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <section id="pricing" className="relative py-24 bg-[var(--bg-primary)] overflow-hidden">
            {/* Background Glow - Menggunakan opacity rendah agar tetap Pitch Black */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/[0.02] blur-[120px] rounded-full" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--fg-primary)] mb-4 text-balance"
                    >
                        Simple, transparent pricing.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-[var(--fg-secondary)] mb-8 text-pretty"
                    >
                        Choose the perfect plan to scale your campaigns. No hidden fees.
                    </motion.p>

                    {/* Billing Toggle - Menggunakan background dari global variables */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative flex items-center p-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full w-fit mx-auto"
                    >
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={`relative px-6 py-2 text-sm font-semibold rounded-full z-10 transition-all ${!isAnnual ? 'text-[var(--bg-primary)]' : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={`relative px-6 py-2 text-sm font-semibold rounded-full z-10 transition-all ${isAnnual ? 'text-[var(--bg-primary)]' : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
                                }`}
                        >
                            Annually
                        </button>

                        <div className="absolute inset-1 pointer-events-none">
                            <motion.div
                                className="w-1/2 h-full bg-[var(--fg-primary)] rounded-full shadow-sm"
                                layout
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                animate={{ x: isAnnual ? '100%' : '0%' }}
                            />
                        </div>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            /* Menggunakan class .glass dari global.css kamu */
                            className={`relative flex flex-col p-8 rounded-[2rem] glass transition-all duration-500 ${tier.mostPopular ? 'border-white/20 ring-1 ring-white/10 md:-mt-8 py-12' : ''
                                }`}
                        >
                            {tier.mostPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--fg-primary)] text-[var(--bg-primary)] text-[10px] font-bold uppercase tracking-[0.1em] rounded-full flex items-center gap-1.5 shadow-xl">
                                    <Sparkles className="w-3 h-3" />
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-[var(--fg-primary)] mb-2 tracking-tight">{tier.name}</h3>
                                <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{tier.description}</p>
                            </div>

                            <div className="mb-8 flex items-baseline text-[var(--fg-primary)]">
                                <span className="text-5xl font-bold tracking-tighter">
                                    {isAnnual ? tier.annualPrice : tier.monthlyPrice}
                                </span>
                                {tier.monthlyPrice !== '$0' && (
                                    <span className="text-sm text-[var(--fg-secondary)] ml-2 font-medium">/month</span>
                                )}
                            </div>

                            <ul className="flex-1 space-y-4 mb-10">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-[var(--fg-secondary)]">
                                        <div className="mt-1 bg-white/10 rounded-full p-0.5">
                                            <Check className="w-3.5 h-3.5 text-[var(--fg-primary)]" />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Menggunakan class .btn-primary dan .btn-secondary dari global.css */}
                            <button
                                className={`w-full !rounded-full !py-4 transition-transform active:scale-95 ${tier.mostPopular ? 'btn-primary' : 'btn-secondary'
                                    }`}
                            >
                                {tier.ctaText}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}