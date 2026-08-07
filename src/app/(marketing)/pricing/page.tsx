'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Single source of truth. Keep in sync with SupportSection FAQ #5.

const TIERS = [
    {
        name: 'Free',
        id: 'tier-free',
        description: 'Try Clyve with no commitment. See exactly what structured research looks like before you subscribe.',
        monthlyPrice: null,
        annualTotal: null,
        annualMonthlyEquiv: null,
        limitNote: '3 lifetime queries · No credit card required',
        features: [
            '3 lifetime research queries',
            'Full structured brief per query',
            'Executive summary, financials, news',
            'Sentiment analysis included',
            'No credit card required',
        ],
        mostPopular: false,
        ctaText: 'Start for Free',
    },
    {
        name: 'Pro',
        id: 'tier-pro',
        // FIX: differentiated from section headline, not redundant
        description: 'Full access to every research tool Clyve offers. Built for analysts who move fast and think independently.',
        monthlyPrice: 19,
        annualTotal: 149,
        // FIX: rounded to $12, not $12.42 — cleaner, more premium
        annualMonthlyEquiv: 12,
        limitNote: '50 queries / mo · Resets every billing cycle',
        features: [
            '50 institutional-grade queries per month',
            'Full structured briefs — financials, SEC filings, risk factors, news',
            'Research history, saved and searchable',
            'PDF export for every analysis',
            'Sentiment analysis on all news',
            'Priority processing speed',
        ],
        mostPopular: true,
        ctaText: 'Get Pro Access',
    },
] as const;

// ─── BILLING TOGGLE ───────────────────────────────────────────────────────────

function BillingToggle({
    isAnnual,
    onToggle,
}: {
    isAnnual: boolean;
    onToggle: (v: boolean) => void;
}) {
    return (
        <div className="flex flex-col items-center gap-3 mt-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative flex items-center p-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full w-fit mx-auto"
            >
                {(['Monthly', 'Annually'] as const).map((label) => {
                    const active = label === 'Annually' ? isAnnual : !isAnnual;
                    return (
                        <button
                            key={label}
                            onClick={() => onToggle(label === 'Annually')}
                            className={`relative px-6 py-2 text-sm font-semibold rounded-full z-10 transition-colors duration-200 ${active
                                ? 'text-[var(--bg-primary)]'
                                : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
                                }`}
                        >
                            {label}
                        </button>
                    );
                })}
                <div className="absolute inset-1 pointer-events-none">
                    <motion.div
                        className="w-1/2 h-full bg-[var(--fg-primary)] rounded-full shadow-sm"
                        layout
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        animate={{ x: isAnnual ? '100%' : '0%' }}
                    />
                </div>
            </motion.div>

            <div className="h-7 flex items-center">
                <AnimatePresence mode="wait">
                    {isAnnual && (
                        <motion.div
                            key="promo-badge"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="text-[10px] font-bold tracking-widest uppercase text-white/80 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                        >
                            Save $79 a year
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── PRICE BLOCK ──────────────────────────────────────────────────────────────

function PriceBlock({
    tier,
    isAnnual,
}: {
    tier: (typeof TIERS)[number];
    isAnnual: boolean;
}) {
    const price =
        isAnnual && tier.annualMonthlyEquiv
            ? tier.annualMonthlyEquiv
            : tier.monthlyPrice;

    return (
        <div className="mb-8 flex flex-col gap-1.5">
            <div className="flex items-baseline text-[var(--fg-primary)] tabular-nums">
                {price === null ? (
                    <span className="text-4xl font-bold tracking-tighter">Free</span>
                ) : (
                    <>
                        {/* Always whole number — no decimals */}
                        <span className="text-4xl font-bold tracking-tighter">
                            ${price}
                        </span>
                        <span className="text-sm text-[var(--fg-secondary)] ml-2 font-medium">/mo</span>
                    </>
                )}
            </div>

            {/* text-xs = 12px — readable but secondary, opacity-75 not 60 */}
            <span className="text-xs text-[var(--fg-secondary)] opacity-75 font-medium">
                {tier.limitNote}
            </span>

            <AnimatePresence mode="wait">
                {tier.id === 'tier-pro' && (
                    <motion.span
                        key={isAnnual ? 'annual-line' : 'monthly-line'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.65 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        // removed italic — cleaner, easier to scan
                        className="text-xs text-[var(--fg-secondary)]"
                    >
                        {isAnnual
                            ? `Billed annually at $${tier.annualTotal}`
                            : `Switch to annual and save $79/year`}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── TIER CARD ────────────────────────────────────────────────────────────────

function TierCard({
    tier,
    isAnnual,
    index,
}: {
    tier: (typeof TIERS)[number];
    isAnnual: boolean;
    index: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`relative flex flex-col rounded-[2rem] glass transition-all duration-500 ${tier.mostPopular
                ? 'border-white/20 ring-1 ring-white/10 md:-mt-8 px-8 py-12'
                : 'p-8'
                }`}
        >
            {tier.mostPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--fg-primary)] text-[var(--bg-primary)] text-[10px] font-bold uppercase tracking-[0.1em] rounded-full flex items-center gap-1.5 shadow-xl whitespace-nowrap">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                </div>
            )}

            <div className="mb-7">
                <h3 className="text-xl font-bold text-[var(--fg-primary)] mb-2 tracking-tight">
                    {tier.name}
                </h3>
                <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                    {tier.description}
                </p>
            </div>

            <PriceBlock tier={tier} isAnnual={isAnnual} />

            <div className="w-full h-px bg-white/5 mb-7" />

            <ul className="flex-1 space-y-4 mb-10">
                {tier.features.map((feature) => (
                    <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-[var(--fg-secondary)]"
                    >
                        <div className="mt-0.5 bg-white/10 rounded-full p-0.5 flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-[var(--fg-primary)]" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="relative group overflow-hidden rounded-full mt-auto">
                <button
                    type="button"
                    aria-label={`${tier.ctaText} — join waitlist`}
                    className={`w-full py-4 font-bold text-sm tracking-wide transition-all opacity-40 cursor-default ${tier.mostPopular ? 'btn-primary' : 'btn-secondary'
                        }`}
                >
                    {tier.ctaText}
                </button>
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white bg-white/10 border border-white/20 px-4 py-1.5 rounded-full shadow-2xl">
                        Join Waitlist
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Pricing() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <section
            id="pricing"
            className="relative pt-32 pb-24 bg-[var(--bg-primary)] overflow-hidden"
        >
            <div className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
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
                        Simple, Transparent Pricing
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-[var(--fg-secondary)] mb-8 text-pretty space-y-1"
                    >
                        <p>Research infrastructure for serious investors</p>
                        <p className="text-sm opacity-90">No hidden fees · Cancel anytime</p>
                    </motion.div>

                    <BillingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-center">
                    {TIERS.map((tier, index) => (
                        <TierCard
                            key={tier.id}
                            tier={tier}
                            isAnnual={isAnnual}
                            index={index}
                        />
                    ))}
                </div>

                <br />

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-sm md:text-[15px] text-[var(--fg-secondary)] opacity-40 mt-10 max-w-md mx-auto leading-relaxed"
                >
                    All outputs are structured public data for research purposes only. Not financial advice.
                </motion.p>
            </div>
        </section>
    );
}