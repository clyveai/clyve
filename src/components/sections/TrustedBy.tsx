'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// ─── Data ────────────────────────────────────────────────────────────────────

const ROW_1 = [
    { name: 'Shopee', slug: 'shopee' },
    { name: 'Tokopedia', slug: 'duolingo' },
    { name: 'Instagram', slug: 'instagram' },
    { name: 'TikTok', slug: 'tiktok' },
    { name: 'Shopify', slug: 'shopify' },
];

const ROW_2 = [
    { name: 'Shopee', slug: 'shopee' },
    { name: 'Tokopedia', slug: 'duolingo' },
    { name: 'Instagram', slug: 'instagram' },
    { name: 'TikTok', slug: 'tiktok' },
    { name: 'Shopify', slug: 'shopify' },
];

const LOOP_1 = [...ROW_1, ...ROW_1, ...ROW_1];
const LOOP_2 = [...ROW_2, ...ROW_2, ...ROW_2];

const CDN = 'https://cdn.simpleicons.org';

// ─── Logo Card ────────────────────────────────────────────────────────────────

function LogoCard({ name, slug }: { name: string; slug: string }) {
    const [failed, setFailed] = useState(false);
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            animate={{
                backgroundColor: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                borderColor: hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
                y: hovered ? -2 : 0,
            }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 20px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                minWidth: 148,
                flexShrink: 0,
                cursor: 'default',
                userSelect: 'none',
            }}
        >
            {failed ? (
                <div style={{
                    width: 18, height: 18,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    flexShrink: 0,
                }} />
            ) : (
                <motion.img
                    src={`${CDN}/${slug}/ffffff`}
                    alt={name}
                    width={18}
                    height={18}
                    animate={{ opacity: hovered ? 0.9 : 0.28 }}
                    transition={{ duration: 0.22 }}
                    style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }}
                    onError={() => setFailed(true)}
                    loading="lazy"
                />
            )}
            <motion.span
                animate={{ color: hovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.28)' }}
                transition={{ duration: 0.22 }}
                style={{
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                }}
            >
                {name}
            </motion.span>
        </motion.div>
    );
}

// ─── Marquee Row ──────────────────────────────────────────────────────────────

function MarqueeRow({
    items,
    direction = 'left',
    duration = 30,
}: {
    items: typeof LOOP_1;
    direction?: 'left' | 'right';
    duration?: number;
}) {
    const from = direction === 'left' ? '0%' : '-33.333%';
    const to = direction === 'left' ? '-33.333%' : '0%';

    return (
        <div style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
            {/* Edge Fades */}
            <div style={{
                position: 'absolute', inset: '0 auto 0 0', width: 140, zIndex: 2,
                pointerEvents: 'none',
                background: 'linear-gradient(to right, #000 0%, transparent 100%)',
            }} />
            <div style={{
                position: 'absolute', inset: '0 0 0 auto', width: 140, zIndex: 2,
                pointerEvents: 'none',
                background: 'linear-gradient(to left, #000 0%, transparent 100%)',
            }} />

            <motion.div
                animate={{ x: [from, to] }}
                transition={{ x: { repeat: Infinity, repeatType: 'loop', duration, ease: 'linear' } }}
                style={{ display: 'flex', gap: 10, width: 'max-content', padding: '5px 0' }}
            >
                {items.map((item, i) => (
                    <LogoCard key={`${item.slug}-${i}`} {...item} />
                ))}
            </motion.div>
        </div>
    );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function TrustedBy() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: '-8%' });

    return (
        <section
            ref={sectionRef}
            style={{
                position: 'relative',
                paddingTop: '5rem',
                paddingBottom: '5rem',
                background: '#000000',
                overflow: 'hidden',
            }}
        >
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

                {/* ── Label ── */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        textAlign: 'center',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.22)',
                        marginBottom: '2.5rem',
                    }}
                >
                    Trusted by sellers on
                </motion.p>

                {/* ── Dual Marquee ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                    <MarqueeRow items={LOOP_1} direction="left" duration={30} />
                    <MarqueeRow items={LOOP_2} direction="right" duration={38} />
                </motion.div>

            </div>
        </section>
    );
}