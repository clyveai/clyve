'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const testimonialsData = [
    {
        quote: 'Clyve AI transformed how I analyze the market. The real-time intelligence for NVIDIA and BTC is unparalleled for my portfolio.',
        name: 'Adrian Chen',
        title: 'Quantitative Trader',
        // Bored Ape NFT style
        avatar: 'https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149622021.jpg',
    },
    {
        quote: 'Finally, an institutional-grade agent that actually understands market sentiment. It saves me hours of manual data scraping.',
        name: 'Elena Rodriguez',
        title: 'Hedge Fund Analyst',
        // Anime/Azuki NFT style
        avatar: 'https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149611030.jpg',
    },
    {
        quote: 'The precision of Clyve AI in identifying trend reversals is insane. It is like having a Bloomberg Terminal in my pocket.',
        name: 'Marcus Thorne',
        title: 'Crypto Strategist',
        // Doodles/Abstract NFT style
        avatar: 'https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149622024.jpg',
    },
    {
        quote: 'As a builder, I appreciate the clean logic behind Clyve. It provides actionable insights that simplified my entire investment thesis.',
        name: 'Sarah Jenkins',
        title: 'FinTech Founder',
        // Cyberpunk NFT style
        avatar: 'https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149629742.jpg',
    },
];

const totalTestimonials = [...testimonialsData, ...testimonialsData, ...testimonialsData, ...testimonialsData];

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonialsData[0] }) => (
    <div className={cn(
        "flex flex-col justify-between p-6 md:p-7 rounded-[22px] flex-shrink-0 relative overflow-hidden",
        "w-[320px] h-[170px] md:w-[400px] md:h-[190px]",
        "bg-gradient-to-b from-white/[0.08] via-[#050505] to-black",
        "backdrop-blur-[20px] shadow-2xl",
        "transition-all duration-500"
    )}>
        <p className="text-[#8e9196] text-[13px] md:text-[15px] leading-relaxed font-sans font-medium relative z-20">
            {testimonial.quote}
        </p>

        <div className="flex items-center gap-3 mt-4 relative z-20">
            {/* Avatar Container with subtle NFT-glow */}
            <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)] flex-shrink-0">
                <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover scale-110" // Zoom sedikit agar karakter NFT lebih fokus
                    unoptimized
                />
            </div>
            <div className="flex flex-col">
                <span className="text-white text-[13px] md:text-[15px] font-sans font-semibold tracking-tight">{testimonial.name}</span>
                <span className="text-[#5c5f66] text-[11px] md:text-[12px] font-mono uppercase tracking-wider">{testimonial.title}</span>
            </div>
        </div>
    </div>
);

const Testimonial = () => {
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState(0);
    const baseX = useMotionValue(0);

    useEffect(() => {
        if (containerRef.current) {
            setContentWidth(containerRef.current.scrollWidth / 4);
        }
    }, []);

    useAnimationFrame((time, delta) => {
        if (!contentWidth) return;

        const baseVelocity = -50;
        const hoverVelocity = -10;

        const velocity = isHovered ? hoverVelocity : baseVelocity;
        const moveBy = velocity * (delta / 1000);
        let newX = baseX.get() + moveBy;

        if (newX <= -contentWidth) {
            newX = 0;
        }

        baseX.set(newX);
    });

    return (
        <section className="bg-black py-12 md:py-24 px-0 flex flex-col items-center overflow-hidden">
            <div className="text-center mb-10 md:mb-16 px-6 max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tight mb-4 leading-tight">
                    Trusted by elite traders & market makers.
                </h2>
                <p className="text-base md:text-lg text-[#5c5f66] font-sans">
                    Master the markets. Command your capital.
                </p>
            </div>

            <div
                className="w-full relative overflow-hidden cursor-default"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="absolute left-0 top-0 bottom-0 w-16 md:w-72 z-10 bg-gradient-to-r from-black via-black/40 to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 md:w-72 z-10 bg-gradient-to-l from-black via-black/40 to-transparent pointer-events-none" />

                <motion.div
                    ref={containerRef}
                    className="flex gap-4 md:gap-6 w-max px-4"
                    style={{ x: baseX }}
                >
                    {totalTestimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} testimonial={testimonial} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Testimonial;