'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

const tiers = [
    {
        name: 'Starter',
        id: 'tier-starter',
        description: 'Perfect for exploring AI capabilities and individual projects.',
        monthlyPrice: 149000,
        annualTotal: 1490000,
        features: [
            'Basic AI generation tools',
            'Up to 50 campaigns per month',
            'Standard response speed',
            'Community access',
        ],
        mostPopular: false,
        ctaText: 'Start Trial',
    },
    {
        name: 'Creator',
        id: 'tier-creator',
        description: 'Ideal for professionals scaling their content creation.',
        monthlyPrice: 349000,
        annualTotal: 3490000,
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
        monthlyPrice: 1490000,
        annualTotal: 14900000,
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

    const formatPrice = (price: number) => {
        return `IDR ${price.toLocaleString('id-ID')}`;
    };

    return (
        <section id="pricing" className="relative pt-32 pb-24 bg-[var(--bg-primary)] overflow-hidden">
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

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-[var(--fg-secondary)] mb-8 text-pretty space-y-1"
                    >
                        <p>Choose the tier that matches your production scale.</p>
                        <p className="text-sm opacity-80">Credits never expire. No hidden fees.</p>
                    </motion.div>

                    {/* Toggle */}
                    <div className="flex flex-col items-center gap-4 mt-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="relative flex items-center p-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full w-fit mx-auto"
                        >
                            <button
                                onClick={() => setIsAnnual(false)}
                                className={`relative px-6 py-2 text-sm font-semibold rounded-full z-10 transition-all ${!isAnnual ? 'text-[var(--bg-primary)]' : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setIsAnnual(true)}
                                className={`relative px-6 py-2 text-sm font-semibold rounded-full z-10 transition-all ${isAnnual ? 'text-[var(--bg-primary)]' : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'}`}
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

                        {/* Saving Badge with subtle pulse */}
                        <div className="h-6">
                            {isAnnual && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[10px] font-bold tracking-widest uppercase text-white/80 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                >
                                    Save up to 17% Yearly
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {tiers.map((tier, index) => {
                        const displayPrice = isAnnual ? (tier.annualTotal / 12) : tier.monthlyPrice;

                        return (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className={`relative flex flex-col p-8 rounded-[2rem] glass transition-all duration-500 ${tier.mostPopular ? 'border-white/20 ring-1 ring-white/10 md:-mt-8 py-12' : ''}`}
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

                                <div className="mb-8 flex flex-col">
                                    <div className="flex items-baseline text-[var(--fg-primary)]">
                                        <span className="text-3xl font-bold tracking-tighter">
                                            {formatPrice(displayPrice)}
                                        </span>
                                        <span className="text-sm text-[var(--fg-secondary)] ml-2 font-medium">/mo</span>
                                    </div>

                                    {isAnnual && (
                                        <span className="text-[11px] text-[var(--fg-secondary)] mt-2 font-medium italic opacity-80">
                                            Billed as {formatPrice(tier.annualTotal)} / year
                                        </span>
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

                                <button
                                    className={`w-full !rounded-full !py-4 transition-transform active:scale-95 font-bold text-sm tracking-wide ${tier.mostPopular ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    {tier.ctaText}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}