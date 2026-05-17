"use client";

import { DottedSurface } from "@/components/ui/dotted-surface";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function SkillsPage() {
    const router = useRouter();

    const handlePaymentRedirect = () => {
        const paymentUrl = process.env.NEXT_PUBLIC_PAYMENT_URL;

        if (paymentUrl) {
            window.open(paymentUrl, '_blank', 'noopener,noreferrer');
        } else {
            console.error("Payment URL is not defined in environment variables.");
        }
    };

    return (
        <main className="h-screen w-full overflow-hidden">
            <DottedSurface>
                <div className="flex h-screen w-full flex-col items-center justify-center px-4 text-center">
                    {/* Radial Glow Effect */}
                    <div
                        aria-hidden="true"
                        className={cn(
                            'pointer-events-none absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full',
                            'bg-[radial-gradient(circle_at_center,rgba(var(--foreground-rgb),0.08),transparent_70%)]',
                            'blur-[60px]',
                        )}
                    />

                    {/* Content */}
                    <div className="relative space-y-8">
                        <div className="space-y-4">
                            <h1 className="font-mono text-5xl font-bold tracking-tighter sm:text-7xl">
                                Unlock Claude <span className="text-muted-foreground">Skills</span>
                            </h1>
                            <p className="mx-auto max-w-[600px] font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground/80">
                                Market Forensics • Quantitative Risk Modeling
                            </p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="flex flex-col items-center justify-center gap-4 pt-4">
                        <LiquidMetalButton
                            label="Access Terminal"
                            onClick={handlePaymentRedirect}
                        />
                        <p className="font-mono text-[10px] uppercase text-muted-foreground/50 tracking-widest">
                            Secure Encrypted Transaction
                        </p>
                    </div>
                </div>
            </DottedSurface>
        </main>
    );
}