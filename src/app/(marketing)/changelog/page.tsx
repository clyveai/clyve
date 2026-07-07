"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useInView, Variants } from "framer-motion";
import {
    changelog,
    CHANGE_TYPE_CONFIG,
    VERSION_LABEL_CONFIG,
    type ChangelogEntry
} from "@/lib/changelog";

// --- Animation Variants ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const entryVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export default function ChangelogPage() {
    const [search, setSearch] = useState("");

    const filteredLogs = useMemo(() => {
        return changelog.filter((entry) =>
            entry.title.toLowerCase().includes(search.toLowerCase()) ||
            entry.subtitle.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    return (
        <main className="min-h-screen bg-[#000000] text-[#ffffff] selection:bg-white selection:text-black">
            <header className="max-w-[1200px] mx-auto pt-32 pb-16 px-6 lg:px-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter">
                        <span className="gradient-text">Changelog</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg pl-9 pr-12 py-2 text-sm w-full md:w-48 focus:w-64 focus:outline-none focus:border-zinc-500 transition-all duration-300"
                        />
                        <div className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
                            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[#1a1a1a] bg-black px-1.5 font-mono text-[10px] font-medium text-zinc-500">
                                ⌘K
                            </kbd>
                        </div>
                    </div>
                    <button className="h-9 px-4 text-xs font-medium border border-[#1a1a1a] rounded-lg hover:bg-[#111]">
                        Subscribe
                    </button>
                </div>
            </header>

            <section className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-32">
                <div className="relative border-l border-[#1a1a1a] ml-0 md:ml-32">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-24"
                        >
                            {filteredLogs.map((entry, index) => (
                                <ChangelogEntryItem key={entry.slug} entry={entry} isFirst={index === 0} />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>
        </main>
    );
}

function ChangelogEntryItem({ entry, isFirst }: { entry: ChangelogEntry; isFirst: boolean }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div ref={ref} variants={entryVariants} className="relative pl-8 md:pl-16 group">
            <div className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border border-black transition-colors duration-500 ${isInView ? (isFirst ? "bg-white" : "bg-zinc-700") : "bg-zinc-900"}`} />

            <div className="md:absolute md:-left-40 md:top-0 mb-4 md:mb-0">
                <span className="text-sm font-mono text-zinc-500 tracking-tighter">{entry.date}</span>
            </div>

            <div className="rounded-2xl border border-[#1a1a1a] bg-[#050505] overflow-hidden hover:border-zinc-700 transition-all duration-500">
                <div className="h-[240px] md:h-[320px] flex items-center justify-center p-8 border-b border-[#1a1a1a] relative overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#111_0%,transparent_100%)]">
                    <h3 className="text-4xl md:text-6xl font-bold tracking-tighter text-center z-10">{entry.title}</h3>
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="p-8 md:p-12 space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{entry.title}</h2>
                            {entry.label && (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                                    {VERSION_LABEL_CONFIG[entry.label].text}
                                </span>
                            )}
                        </div>
                        <p className="text-lg text-zinc-400 font-medium leading-snug">{entry.subtitle}</p>
                    </div>

                    <p className="text-zinc-400 leading-relaxed max-w-2xl">{entry.description}</p>

                    <div className="flex flex-wrap gap-2 pt-4">
                        {entry.changes.map((change, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-[#000] border border-[#1a1a1a] px-3 py-1.5 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CHANGE_TYPE_CONFIG[change.type].bg }} />
                                <span className="text-xs font-medium text-zinc-300">{change.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}