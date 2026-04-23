import Image from "next/image";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
    title: string;
    description: string;
    imageSrc: string;
    className?: string;
    badge?: string;
}

export function FeatureCard({
    title,
    description,
    imageSrc,
    className,
    badge,
}: FeatureCardProps) {
    return (
        <div
            className={cn(
                "flex flex-col rounded-[24px] bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden w-full transition-all duration-300",
                className
            )}
        >
            {/* Image Section - Dibuat Square (Aspek 1:1) agar visualnya besar seperti di foto */}
            <div className="relative w-full aspect-square bg-[#000000]">
                {badge && (
                    <div className="absolute top-4 right-4 z-10 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-[10px] font-medium text-white/60 border border-white/5">
                        {badge}
                    </div>
                )}
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Content Section - Padding lebih lega untuk kesan premium */}
            <div className="flex flex-col p-8 sm:p-9">
                <h3 className="text-white text-[20px] font-semibold tracking-tight mb-3">
                    {title}
                </h3>
                <p className="text-[#a1a1aa] text-[15px] leading-relaxed font-normal">
                    {description}
                </p>
            </div>
        </div>
    );
}