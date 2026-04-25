"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const mockPrompts = [
  "Generate a high-converting product launch hook for an AI SaaS in 2 sentences.",
  "Create a persuasive carousel script for Instagram with a premium brand tone.",
  "Rewrite this sales copy to feel more cinematic and authoritative.",
];

export default function DashboardPage() {
  const [promptInput, setPromptInput] = useState("");
  const [outputs, setOutputs] = useState<string[]>([]);

  const glowClass = useMemo(
    () =>
      promptInput.length > 0
        ? "shadow-[0_0_40px_rgba(59,130,246,0.28)] ring-2 ring-blue-400/40"
        : "shadow-[0_0_20px_rgba(59,130,246,0.12)] ring-1 ring-white/10",
    [promptInput.length],
  );

  const handleGenerate = () => {
    if (!promptInput.trim()) return;
    setOutputs((current) => [promptInput.trim(), ...current].slice(0, 8));
    setPromptInput("");
  };

  return (
    <div className="min-h-screen bg-[#121110] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 gap-6 px-4 pb-8 pt-28 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Workspace</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Sidebar dibuat modular supaya section seperti history, collections, dan templates bisa ditambah cepat.
          </p>
          <div className="mt-5 space-y-2">
            {["All Prompts", "Favorites", "Team Library"].map((item) => (
              <button
                key={item}
                className="w-full rounded-lg border border-transparent px-3 py-2 text-left text-sm text-zinc-300 transition hover:border-white/10 hover:bg-white/[0.04]"
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[70vh] flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 sm:p-6">
          <header className="mb-5">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Smart Prompt Generator</h1>
            <p className="mt-2 text-sm text-zinc-400">Build premium sales prompts with cinematic tone and clearer conversion intent.</p>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            <AnimatePresence>
              {(outputs.length ? outputs : mockPrompts).map((entry, index) => (
                <motion.article
                  key={`${entry}-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-[0_8px_30px_rgba(59,130,246,0.16),0_6px_24px_rgba(234,179,8,0.12)] backdrop-blur-lg"
                >
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Output
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-100">{entry}</p>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            animate={promptInput ? { boxShadow: "0 0 0 1px rgba(96,165,250,0.4), 0 0 45px rgba(96,165,250,0.25)" } : {}}
            transition={{ duration: 1.2, repeat: promptInput ? Number.POSITIVE_INFINITY : 0, repeatType: "mirror" }}
            className={`mt-6 rounded-2xl bg-[#151413] p-[1px] ${glowClass}`}
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(255,255,255,0.25), rgba(59,130,246,0.35), rgba(251,191,36,0.35), rgba(255,255,255,0.2))",
            }}
          >
            <div className="rounded-2xl bg-[#121110] p-3">
              <textarea
                value={promptInput}
                onChange={(event) => setPromptInput(event.target.value)}
                placeholder="Describe your product, audience, and desired sales outcome..."
                className="min-h-28 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Generate Prompt
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
