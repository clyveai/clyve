"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Zap } from "lucide-react"

export default function Hero() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8 },
        },
    }

    return (
        <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center pt-20 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
                {/* Subtle gradient blur */}
                <div className="absolute top-40 right-0 w-96 h-96 bg-white/5 rounded-full blur-full opacity-40 -z-20" />
                <div className="absolute bottom-40 left-0 w-96 h-96 bg-white/5 rounded-full blur-full opacity-40 -z-20" />
            </div>

            <motion.div
                className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Badge */}
                <motion.div
                    variants={itemVariants}
                    className="flex justify-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-light bg-background-secondary text-xs font-medium text-foreground-secondary hover:border-border-DEFAULT transition-colors cursor-default">
                        <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                        Now in Beta 🚀
                    </div>
                </motion.div>

                {/* Main Heading */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 leading-tight">
                        <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent inline-block">
                            Professional Market
                        </span>
                        <br className="hidden sm:block" />
                        <span className="text-foreground-DEFAULT">
                            Intelligence
                        </span>
                    </h1>
                </motion.div>

                {/* Description */}
                <motion.p
                    variants={itemVariants}
                    className="text-center max-w-2xl mx-auto text-lg text-foreground-secondary mb-10"
                >
                    AI-powered analysis for stocks and crypto. Real-time sentiment tracking,
                    risk metrics, and actionable insights for the next generation of traders.
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    <button className="px-8 py-3.5 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 flex items-center gap-2 group">
                        Get Started Free
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-8 py-3.5 glass text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-200 active:scale-95 flex items-center gap-2">
                        <Zap size={18} />
                        View Features
                    </button>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    variants={itemVariants}
                    className="relative"
                >
                    <div className="relative aspect-video rounded-xl border border-border-light overflow-hidden bg-background-secondary glass hover:border-border-DEFAULT transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                                    <Zap className="text-white/40" size={24} />
                                </div>
                                <p className="text-foreground-tertiary text-sm">
                                    Dashboard Preview
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}