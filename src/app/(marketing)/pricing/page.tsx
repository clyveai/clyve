'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Sparkles } from 'lucide-react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/shared/ui/card';

const ANNUAL_MONTHS_FREE = 2;

// COGS guardrail formula, dikunci: floor(Price * 0.25 / 1.40)
// 1.40 = estimasi biaya infra + LLM per active thesis per bulan
// 0.25 = ceiling cost ratio, target gross margin 75 sampai 80 persen
const COST_PER_THESIS = 1.4;
const COST_RATIO_CAP = 0.25;

function formulaSafeCap(price: number) {
    return Math.floor((price * COST_RATIO_CAP) / COST_PER_THESIS);
}

// Easing + transisi bersama untuk animasi tab
const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

const TAB_CONTENT_ANIMATION = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.28, ease: EASE_SMOOTH },
};

const INDIVIDUAL_PLANS = [
    {
        name: 'Free',
        id: 'plan-free',
        description:
            'One complete thesis, fully monitored. See how Clyve tracks a belief before you commit to more.',
        price: 0,
        limitNote: '1 active thesis, 1 tracked instrument',
        features: [
            '1 active investment thesis',
            'Continuous, event driven monitoring',
            'Full evidence chain, claim to source to impact',
            '30 day thesis history',
            'No credit card required',
        ],
        ctaText: 'Start for Free',
        highlight: false,
    },
    {
        name: 'Investor',
        id: 'plan-investor',
        description:
            'For self directed investors tracking a handful of core convictions, not a whole watchlist.',
        price: 19,
        limitNote: '3 active theses, up to 3 instruments each',
        features: [
            '3 active theses included',
            'Up to 3 tracked instruments per thesis',
            'Continuous monitoring, filings, earnings, news',
            '90 day thesis history',
            'Add 5 theses anytime for $35/mo',
        ],
        ctaText: 'Get Investor Access',
        highlight: true,
    },
    {
        name: 'Professional',
        id: 'plan-professional',
        description:
            'Built for analysts and PMs running a large, active research book that needs to stay current.',
        price: 79,
        limitNote: '14 active theses, up to 3 instruments each',
        features: [
            '14 active theses included',
            'Everything in Investor, plus',
            'Portfolio level intelligence across theses',
            'Data export (CSV)',
            'API access, coming soon',
            'Unlimited thesis history',
            'Add 5 theses anytime for $35/mo',
        ],
        ctaText: 'Get Professional Access',
        highlight: false,
    },
] as const;

const COMPARE_ROWS: {
    label: string;
    values: [string, string, string];
}[] = [
        {
            label: 'Active theses included',
            values: ['1', '3', '14'],
        },
        {
            label: 'Instruments per thesis',
            values: ['1', 'Up to 3', 'Up to 3'],
        },
        {
            label: 'Continuous monitoring',
            values: ['Yes', 'Yes', 'Yes'],
        },
        {
            label: 'Thesis history',
            values: ['30 days', '90 days', 'Unlimited'],
        },
        {
            label: 'Portfolio level intelligence',
            values: ['No', 'No', 'Yes'],
        },
        {
            label: 'Data export (CSV)',
            values: ['No', 'No', 'Yes'],
        },
        {
            label: 'API access',
            values: ['No', 'No', 'Coming soon'],
        },
        {
            label: 'Add on packs',
            values: ['No', '$35 per 5', '$35 per 5'],
        },
        {
            label: 'Priority support',
            values: ['No', 'Yes', 'Yes'],
        },
    ];

const PANEL_CONTENT = {
    team: {
        title: 'Fund Office',
        description:
            'For investment teams, family offices, and small funds who need shared visibility over conviction. Custom capacity, shared intelligence, and dedicated onboarding.',
        features: [
            'Custom thesis capacity',
            'Shared visibility across team members',
            'Dedicated onboarding',
            'Annual billing',
        ],
    },
    api: {
        title: 'API',
        description:
            "Build on top of Clyve's thesis monitoring and evidence graph. API access is planned for a future release, Professional customers get priority access at launch.",
        features: [
            'Thesis monitoring infrastructure',
            'Evidence graph access',
            'Programmatic intelligence',
            'Built for research workflows',
        ],
    },
} as const;

type Tab = 'individual' | 'team' | 'api';

function annualEquivMonthly(price: number) {
    if (price === 0) return 0;

    return Math.round(
        (price * (12 - ANNUAL_MONTHS_FREE)) / 12
    );
}

function annualTotal(price: number) {
    return price * (12 - ANNUAL_MONTHS_FREE);
}

function AudienceSwitcher({
    tab,
    onChange,
}: {
    tab: Tab;
    onChange: (tab: Tab) => void;
}) {
    const tabs: { id: Tab; label: string }[] = [
        { id: 'individual', label: 'Individual' },
        { id: 'team', label: 'Team & Fund' },
        { id: 'api', label: 'API' },
    ];

    return (
        <div
            role="tablist"
            aria-label="Pricing audience"
            className="
                mx-auto mt-8 inline-flex max-w-full items-center
                rounded-full
                border border-white/[0.08]
                bg-white/[0.035]
                p-1
                shadow-[0_8px_30px_rgba(0,0,0,0.18)]
                backdrop-blur-xl
            "
        >
            {tabs.map(({ id, label }) => {
                const active = tab === id;

                return (
                    <motion.button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(id)}
                        whileTap={{ scale: 0.96 }}
                        transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                        }}
                        className={`
                            relative rounded-full
                            px-4 py-2 sm:px-5
                            text-[13px] font-medium sm:text-sm
                            transition-colors duration-300
                            focus:outline-none
                            focus-visible:ring-2 focus-visible:ring-white/20
                            ${active
                                ? 'text-white'
                                : 'text-white/45 hover:text-white/80'
                            }
                        `}
                    >
                        {active && (
                            <motion.div
                                layoutId="audience-pill"
                                className="
                                    absolute inset-0 -z-10
                                    rounded-full
                                    border border-white/[0.08]
                                    bg-white/[0.10]
                                    shadow-[0_2px_12px_rgba(0,0,0,0.2)]
                                "
                                transition={{
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 32,
                                    mass: 0.9,
                                }}
                            />
                        )}

                        <span className="relative z-10 whitespace-nowrap">
                            {label}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}

function BillingToggle({
    isAnnual,
    onToggle,
}: {
    isAnnual: boolean;
    onToggle: (value: boolean) => void;
}) {
    return (
        <div className="mt-5 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.025] p-1">
                {(['Monthly', 'Annually'] as const).map((label) => {
                    const active =
                        label === 'Annually' ? isAnnual : !isAnnual;

                    return (
                        <button
                            key={label}
                            type="button"
                            onClick={() => onToggle(label === 'Annually')}
                            className={`
                                rounded-full px-3 py-1
                                text-xs font-medium
                                transition-all duration-200
                                ${active
                                    ? 'bg-white/[0.10] text-white shadow-sm'
                                    : 'text-white/40 hover:text-white/70'
                                }
                            `}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/55">
                Save up to 17%
            </span>
        </div>
    );
}

function PlanCard({
    plan,
    isAnnual,
    onToggle,
    index,
}: {
    plan: (typeof INDIVIDUAL_PLANS)[number];
    isAnnual: boolean;
    onToggle: (value: boolean) => void;
    index: number;
}) {
    const isFree = plan.price === 0;
    const displayPrice = isAnnual ? annualEquivMonthly(plan.price) : plan.price;

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 + index * 0.06, duration: 0.45 }}
            className="relative mx-auto h-full w-full max-w-md lg:max-w-none"
        >
            {plan.highlight && (
                <span
                    className="
                        absolute -top-3 left-5 z-10 sm:left-7
                        inline-flex items-center gap-1.5
                        rounded-full bg-[#FE4E00]
                        px-3 py-1 text-[11px] font-semibold
                        tracking-wide text-white
                        shadow-[0_4px_16px_rgba(254,78,0,0.35)]
                    "
                >
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                </span>
            )}

            <Card
                className={`
                    h-full gap-0 pt-6 pb-0 sm:pt-7
                    overflow-visible rounded-[28px]
                    border text-white ring-0
                    shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:shadow-[0_24px_70px_rgba(0,0,0,0.18)]
                    ${plan.highlight
                        ? 'border-[#FE4E00]/40 bg-white/[0.04] hover:border-[#FE4E00]/60'
                        : 'border-white/[0.08] bg-white/[0.025] hover:border-white/[0.14] hover:bg-white/[0.035]'
                    }
                `}
            >
                <CardHeader className="mb-6 px-5 sm:mb-7 sm:px-7">
                    <h3 className="mb-2 text-xl font-semibold tracking-tight text-white">
                        {plan.name}
                    </h3>
                    <p className="text-sm leading-6 text-white/50">
                        {plan.description}
                    </p>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col px-5 sm:px-7">
                    <div className="mb-6 sm:mb-7">
                        <div className="flex items-baseline tabular-nums text-white">
                            {isFree ? (
                                <span className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                                    Free
                                </span>
                            ) : (
                                <>
                                    <span className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                                        ${displayPrice}
                                    </span>
                                    <span className="ml-2 text-sm font-medium text-white/35">
                                        /mo
                                    </span>
                                </>
                            )}
                        </div>

                        <span className="mt-1 block text-xs text-white/35">
                            {plan.limitNote}
                        </span>

                        {/* Free: placeholder tak terlihat HANYA di desktop (lg) agar 3 card sejajar.
                            Di mobile card ditumpuk, jadi tidak perlu spacer. */}
                        {isFree ? (
                            <div aria-hidden className="invisible hidden lg:block">
                                <span className="mt-1 block text-xs">billed monthly</span>
                                <BillingToggle isAnnual={false} onToggle={() => { }} />
                            </div>
                        ) : (
                            <>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={isAnnual ? 'annual' : 'monthly'}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="mt-1 block text-xs text-white/35"
                                    >
                                        {isAnnual
                                            ? `billed as $${annualTotal(plan.price)}/yr`
                                            : 'billed monthly'}
                                    </motion.span>
                                </AnimatePresence>

                                <BillingToggle isAnnual={isAnnual} onToggle={onToggle} />
                            </>
                        )}
                    </div>

                    <div className="mb-6 h-px w-full bg-white/[0.07] sm:mb-7" />

                    <ul className="flex-1 space-y-3.5">
                        {plan.features.map((feature) => (
                            <li
                                key={feature}
                                className="flex items-start gap-3 text-sm text-white/55"
                            >
                                <span className="mt-0.5 flex shrink-0 rounded-full bg-white/[0.07] p-0.5">
                                    <Check className="h-3.5 w-3.5 text-white/75" />
                                </span>
                                <span className="leading-5">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>

                <CardFooter className="rounded-b-[28px] rounded-t-none border-0 bg-transparent px-5 pb-6 pt-8 sm:px-7 sm:pb-7">
                    <button
                        type="button"
                        aria-label={plan.ctaText}
                        className={`
                            flex w-full items-center justify-center
                            rounded-full px-6 py-3.5
                            text-sm font-medium tracking-tight
                            shadow-[0_1px_2px_rgba(0,0,0,0.15)]
                            transition-all duration-200
                            active:scale-[0.985]
                            focus:outline-none focus:ring-2 focus:ring-white/20
                            ${plan.highlight
                                ? 'border border-[#FE4E00] bg-[#FE4E00] text-white hover:bg-[#e64600] hover:shadow-[0_4px_16px_rgba(254,78,0,0.3)]'
                                : 'border border-white bg-white text-black hover:bg-white/90 hover:shadow-[0_4px_16px_rgba(255,255,255,0.12)]'
                            }
                        `}
                    >
                        {plan.ctaText}
                    </button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

function CompareTable() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                delay: 0.25,
                duration: 0.45,
            }}
            className="
                mx-auto mt-16 max-w-4xl
                overflow-x-auto
                rounded-[28px]
                border border-white/[0.08]
                bg-white/[0.025]
                p-7
                shadow-[0_20px_60px_rgba(0,0,0,0.10)]
                backdrop-blur-xl
                md:p-8
            "
        >
            <h3 className="mb-6 text-lg font-semibold tracking-tight text-white">
                Compare features across plans
            </h3>

            <table className="w-full min-w-[520px] text-sm">
                <thead>
                    <tr className="border-b border-white/[0.07]">
                        <th className="py-3 text-left font-medium text-white/40">
                            Feature
                        </th>

                        {['Free', 'Investor', 'Professional'].map(
                            (name) => (
                                <th
                                    key={name}
                                    className="py-3 text-center font-medium text-white"
                                >
                                    {name}
                                </th>
                            )
                        )}
                    </tr>
                </thead>

                <tbody>
                    {COMPARE_ROWS.map((row) => (
                        <tr
                            key={row.label}
                            className="border-b border-white/[0.045] last:border-0"
                        >
                            <td className="py-3.5 text-white/45">
                                {row.label}
                            </td>

                            {row.values.map((value, index) => (
                                <td
                                    key={`${row.label}-${index}`}
                                    className="py-3.5 text-center"
                                >
                                    {value === 'Yes' ? (
                                        <Check className="mx-auto h-4 w-4 text-white/80" />
                                    ) : value === 'No' ? (
                                        <X className="mx-auto h-4 w-4 text-white/20" />
                                    ) : (
                                        <span className="text-white/75">
                                            {value}
                                        </span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <p className="mt-6 text-xs leading-5 text-white/30">
                Cancelling an add on pack archives your extra active theses
                as read only, nothing is deleted. Reactivate a pack or
                upgrade anytime to restore full monitoring.
            </p>
        </motion.div>
    );
}

function PricingPanel({
    type,
}: {
    type: 'team' | 'api';
}) {
    const content = PANEL_CONTENT[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                delay: 0.1,
                duration: 0.45,
            }}
            className="mx-auto max-w-4xl"
        >
            <div
                className="
                    rounded-[28px]
                    border border-white/[0.08]
                    bg-white/[0.025]
                    px-7 py-8
                    shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                    backdrop-blur-xl
                    md:px-9 md:py-9
                "
            >
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 max-w-2xl">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-semibold tracking-tight text-white">
                                {content.title}
                            </h3>

                            <span
                                className="
                                    inline-flex shrink-0
                                    items-center gap-1.5
                                    rounded-full
                                    border border-white/[0.08]
                                    bg-white/[0.045]
                                    px-2.5 py-1
                                    text-[10px] font-medium
                                    tracking-wide
                                    text-white/45
                                "
                            >
                                <Clock className="h-3 w-3" />
                                Coming Soon
                            </span>
                        </div>

                        <p className="max-w-xl text-sm leading-6 text-white/50">
                            {content.description}
                        </p>

                        {content.features.length > 0 && (
                            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                                {content.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2.5 text-sm text-white/50"
                                    >
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-white/55" />

                                        <span className="leading-5">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        type="button"
                        disabled
                        aria-label={`${content.title} coming soon`}
                        className="
                            inline-flex shrink-0
                            cursor-not-allowed
                            items-center justify-center
                            gap-2
                            rounded-full
                            border border-white/[0.08]
                            bg-white/[0.06]
                            px-6 py-3.5
                            text-sm font-medium
                            tracking-tight text-white/40
                        "
                    >
                        Coming Soon
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

export default function Pricing() {
    const [tab, setTab] = useState<Tab>('individual');
    const [isAnnual, setIsAnnual] = useState(false);

    return (
        <section
            id="pricing"
            className="
                relative overflow-hidden
                bg-[var(--bg-primary)]
                pb-24 pt-32
            "
        >
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden
            >
                <div
                    className="
                        absolute left-1/2 top-[-10%]
                        h-[500px] w-[800px]
                        -translate-x-1/2
                        rounded-full
                        bg-white/[0.025]
                        blur-[140px]
                    "
                />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto mb-4 max-w-2xl text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45 }}
                        className="
                            mb-4
                            text-balance
                            text-4xl
                            font-semibold
                            tracking-[-0.04em]
                            text-white
                            md:text-5xl
                        "
                    >
                        Plans for every level of conviction
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08, duration: 0.45 }}
                        className="space-y-1 text-pretty text-lg text-white/55"
                    >
                        <p>
                            Priced by active investment theses,
                            not queries or tokens
                        </p>

                        <p className="text-sm text-white/30">
                            No usage metering, no surprise bills,
                            cancel anytime
                        </p>
                    </motion.div>

                    <AudienceSwitcher tab={tab} onChange={setTab} />
                </div>

                <AnimatePresence mode="wait" initial={false}>
                    {tab === 'individual' && (
                        <motion.div
                            key="individual"
                            {...TAB_CONTENT_ANIMATION}
                            className="mt-16"
                        >
                            <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3 lg:gap-6">
                                {INDIVIDUAL_PLANS.map((plan, index) => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        isAnnual={isAnnual}
                                        onToggle={setIsAnnual}
                                        index={index}
                                    />
                                ))}
                            </div>

                            <CompareTable />
                        </motion.div>
                    )}

                    {tab === 'team' && (
                        <motion.div
                            key="team"
                            {...TAB_CONTENT_ANIMATION}
                            className="mt-16"
                        >
                            <PricingPanel type="team" />
                        </motion.div>
                    )}

                    {tab === 'api' && (
                        <motion.div
                            key="api"
                            {...TAB_CONTENT_ANIMATION}
                            className="mt-16"
                        >
                            <PricingPanel type="api" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35 }}
                    className="
                        mx-auto mt-16 max-w-md
                        text-center
                        text-sm leading-relaxed
                        text-white/30
                        md:text-[15px]
                    "
                >
                    Clyve monitors public filings, earnings,
                    and news to test the reasoning behind your
                    own positions.
                </motion.p>
            </div>
        </section>
    );
}