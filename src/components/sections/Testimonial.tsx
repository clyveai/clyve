'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useAnimationFrame, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const testimonialsData = [
    {
        quote: "The sentiment analysis is surprisingly sharp. It caught a bearish shift on NVIDIA hours before the mainstream news cycle even picked it up.",
        name: 'Mayra',
        title: 'Retail Trader',
        avatar: '/avatars/avatar1.png',
    },
    {
        quote: "Finally, an AI that doesn't just hallucinate numbers. Clyve actually deconstructs market data into structured, logical reports that I can trust.",
        name: 'Zain',
        title: 'Entrepreneur',
        avatar: '/avatars/avatar2.png',
    },
    {
        quote: "I use Clyve to synthesize global macro trends. It's like having a high-level research team helping me spot opportunities without the noise.",
        name: 'Ibrahim',
        title: 'Entrepreneur',
        avatar: '/avatars/avatar3.png',
    },
    {
        quote: "The way it breaks down dense financial filings is a game changer. I can now extract key risk factors from a 10-K report in seconds.",
        name: 'Sarah',
        title: 'Investor',
        avatar: '/avatars/avatar4.png',
    },
];

const totalTestimonials = [...testimonialsData, ...testimonialsData, ...testimonialsData, ...testimonialsData];

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonialsData[0] }) => (
    <div className={cn(
        "group flex flex-col p-5 md:p-6 rounded-[22px] flex-shrink-0 relative overflow-hidden",
        "w-[280px] md:w-[380px] h-auto",
        "bg-[#050505] border border-white/[0.06]",
        "transition-all duration-500 hover:border-white/[0.12]"
    )}>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        <p className="text-[#a1a1a1] text-[14px] md:text-[15px] leading-[1.5] font-sans font-normal relative z-10 mb-5">
            "{testimonial.quote}"
        </p>

        <div className="flex items-center gap-3 relative z-10">
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                    unoptimized
                />
            </div>
            <div className="flex flex-col -space-y-0.5">
                <span className="text-white text-[13px] md:text-[14px] font-sans font-medium tracking-tight">
                    {testimonial.name}
                </span>
                <span className="text-[#525252] text-[12px] md:text-[13px] font-sans font-normal">
                    {testimonial.title}
                </span>
            </div>
        </div>
    </div>
);

const Testimonial = () => {
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState(0);
    const baseX = useMotionValue(0);

    const smoothVelocity = useSpring(-30, {
        damping: 60,
        stiffness: 400,
    });

    useEffect(() => {
        if (containerRef.current) {
            setContentWidth(containerRef.current.scrollWidth / 4);
        }
    }, []);

    useEffect(() => {
        smoothVelocity.set(isHovered ? -8 : -30);
    }, [isHovered, smoothVelocity]);

    useAnimationFrame((time, delta) => {
        if (!contentWidth) return;
        const moveBy = smoothVelocity.get() * (delta / 1000);
        let newX = baseX.get() + moveBy;

        if (newX <= -contentWidth) {
            newX += contentWidth;
        }
        baseX.set(newX);
    });

    return (
        <section className="bg-black py-20 px-0 flex flex-col items-center overflow-hidden">
            <div className="text-center mb-12 px-6 max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tighter mb-4">
                    See what they have to say!
                </h2>
                <p className="text-base md:text-lg text-[#666666] font-sans leading-relaxed">
                    Trusted by retail traders, investors, and entrepreneurs.
                </p>
            </div>

            <div
                className="w-full relative overflow-hidden cursor-default"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Vignettes: 
                   Mobile -> w-12 & via-black/40 (lebih tipis)
                   Desktop -> md:w-64 & via-black/90 (lebih pekat)
                */}
                <div className="absolute left-0 top-0 bottom-0 w-12 md:w-64 z-20 bg-gradient-to-r from-black via-black/40 md:via-black/90 to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 md:w-64 z-20 bg-gradient-to-l from-black via-black/40 md:via-black/90 to-transparent pointer-events-none" />

                <motion.div
                    ref={containerRef}
                    className="flex gap-4 w-max px-4 will-change-transform"
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