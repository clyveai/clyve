"use client"

import { useState } from "react"
import { AnimatePresence, motion, type Variants } from "framer-motion"
import { Check, Copy } from "lucide-react"
import { type ExclusiveCategory, UNIVERSAL_PREFERENCE_PROMPT } from "@/constants/blog-data"

interface ExclusiveBlogClientProps {
  categories: Record<string, ExclusiveCategory>
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

// Komponen Tombol Copy
function CopyButton({
  text,
  id,
  copiedKey,
  onCopy,
}: {
  text: string
  id: string
  copiedKey: string | null
  onCopy: (text: string, id: string) => void
}) {
  const isCopied = copiedKey === id

  return (
    <button
      type="button"
      onClick={() => onCopy(text, id)}
      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 text-xs text-zinc-400 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
      aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
    >
      {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {isCopied ? "Copied" : "Copy"}
    </button>
  )
}

// Komponen Kotak Prompt (Clean Minimalist)
function PromptBlock({
  label,
  content,
  blockId,
  copiedKey,
  handleCopy,
}: {
  label: string
  content: string
  blockId: string
  copiedKey: string | null
  handleCopy: (text: string, id: string) => void
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-400">{label}</h3>
      
      <div className="group relative rounded-xl border border-white/10 bg-[#0a0a0a] p-4 md:p-5 transition-colors hover:border-white/20">
        <div className="absolute right-3 top-3">
          <CopyButton
            text={content}
            id={blockId}
            copiedKey={copiedKey}
            onCopy={handleCopy}
          />
        </div>
        
        {/* pr-20 agar teks tidak tertimpa tombol copy */}
        <p className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-zinc-300 selection:bg-zinc-800 selection:text-white pr-20 mt-6 md:mt-0">
          {content}
        </p>
      </div>
    </div>
  )
}

export default function ExclusiveBlogClient({ categories }: ExclusiveBlogClientProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const categoryKeys = Object.keys(categories)
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>(categoryKeys[0] ?? "current")
  const [switchPulse, setSwitchPulse] = useState(0)
  const category = categories[activeCategoryKey] ?? categories[categoryKeys[0]]
  const hasMultiAccess = categoryKeys.length > 1

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(id)
      setTimeout(() => {
        setCopiedKey((current) => (current === id ? null : current))
      }, 2000)
    } catch {
      setCopiedKey(null)
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-6 pb-24 pt-32 md:pt-40 font-sans selection:bg-white/20">
      {hasMultiAccess && (
        <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-center md:justify-between">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-zinc-500 md:text-left">
            Professional Access Scope
          </p>
          <div className="relative w-full md:w-auto">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={switchPulse}
                  initial={{ opacity: 0.9, scale: 0.72 }}
                  animate={{ opacity: 0, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-2xl"
                />
              </AnimatePresence>

              {[
                { x: -48, y: -8, delay: 0.02, size: "h-2.5 w-2.5" },
                { x: 0, y: -20, delay: 0.06, size: "h-2 w-2" },
                { x: 44, y: -4, delay: 0.1, size: "h-3 w-3" },
                { x: -30, y: 16, delay: 0.12, size: "h-1.5 w-1.5" },
                { x: 34, y: 14, delay: 0.16, size: "h-2 w-2" },
              ].map((bubble, index) => (
                <motion.span
                  key={`${switchPulse}-${index}`}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                  animate={{
                    opacity: [0, 0.9, 0],
                    x: bubble.x,
                    y: bubble.y,
                    scale: [0.4, 1, 0.7],
                  }}
                  transition={{
                    duration: 0.65,
                    delay: bubble.delay,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/45 ${bubble.size}`}
                />
              ))}
            </div>

            <div className="glass-dark hide-scrollbar relative flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-[var(--border-color)] p-1 md:w-auto md:rounded-full">
            {categoryKeys.map((key) => {
              const item = categories[key]
              const isActive = key === activeCategoryKey

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key !== activeCategoryKey) {
                      setActiveCategoryKey(key)
                      setSwitchPulse((current) => current + 1)
                    }
                  }}
                  className={`relative min-w-[112px] rounded-xl px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition md:min-w-[124px] md:rounded-full ${
                    isActive ? "text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-category-bubble"
                      transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.7 }}
                      className="absolute inset-0 rounded-xl bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)] md:rounded-full"
                    />
                  )}
                  <span className="relative z-10">{item.title}</span>
                </button>
              )
            })}
            </div>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="mb-12 border-b border-white/10 pb-8 text-center md:text-left">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
          Welcome to
        </p>
        <h1 className="text-4xl font-bold tracking-tighter text-white md:text-6xl">
          {category.title} <span className="text-zinc-600 font-light italic">Portal.</span>
        </h1>
      </div>

      {/* Setup Guide Section */}
      <div className="mb-16 rounded-3xl border border-white/5 bg-white/[0.01] p-6 md:p-10 space-y-12">
        <div className="mb-8">
          <h2 className="text-lg uppercase tracking-widest font-bold text-white">How to Set Up:</h2>
        </div>

        {/* Settings 1 */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-4 border-b border-white/5 pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-mono text-zinc-400">01</span>
            Settings 1
          </h3>
          <div className="space-y-8 pl-0 md:pl-12">
            <p className="text-sm text-zinc-400">
              Bagian di bawah ini ada di: <span className="font-bold text-zinc-300 bg-white/5 px-2 py-1 rounded">account → settings → general</span>
            </p>
            
            <div className="space-y-3">
              <p className="text-base font-medium text-white">What best describes your work?</p>
              <p className="text-sm text-zinc-400">
                Pilih <strong className="text-white">Other</strong> atau sesuaikan dengan <strong className="text-white">Profesi</strong> kalian.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-base font-medium text-white">What personal preferences should Claude consider in responses?</p>
              <PromptBlock 
                label="Use this smart prompt"
                content={UNIVERSAL_PREFERENCE_PROMPT}
                blockId="universal-prompt"
                copiedKey={copiedKey}
                handleCopy={handleCopy}
              />
            </div>
          </div>
        </div>

        {/* Settings 2 */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-4 border-b border-white/5 pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-mono text-zinc-400">02</span>
            Settings 2
          </h3>
          <div className="space-y-4 pl-0 md:pl-12">
            <p className="text-sm text-zinc-400 leading-relaxed">
              Masuk ke → <span className="font-bold text-zinc-300 bg-white/5 px-2 py-1 rounded">settings → capabilities</span> → scroll paling bawah lalu pilih → <span className="font-bold text-zinc-300 bg-white/5 px-2 py-1 rounded">skills → go to customize.</span>
            </p>

            <p className="text-sm text-zinc-400 leading-relaxed flex flex-wrap items-center gap-2"> Setelah itu pilih icon <span className="flex h-6 w-6 items-center justify-center rounded border border-white/20 bg-white/5 text-white font-bold">+</span> 
            <span>→</span> <span className="font-medium text-zinc-200">Create skill</span> 
            <span>→</span> <span className="font-medium text-zinc-200">Write skill instructions</span>
            </p>

            <p className="text-sm text-zinc-500 italic">
              *Copy dan paste masing-masing bagian Skill di bawah ini ke form yang tersedia.
            </p>
          </div>
        </div>
      </div>

      {/* Skills Mapping List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-16 md:space-y-24"
      >
        {category.skills.map((skill, index) => {
          const number = (index + 1).toString().padStart(2, "0")

          return (
            <motion.article
              key={skill.id}
              variants={itemVariants}
              className="relative"
            >
              {/* Skill Module Identifier */}
              <div className="mb-8 flex items-start md:items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-500 font-mono text-sm font-bold">
                  {number}
                </span>
                <h2 className="text-xl font-semibold tracking-widest uppercase text-white opacity-80">
                  Skill Module
                </h2>
              </div>

              {/* Grid 3 Kotak (Name, Desc, Inst) */}
              <div className="grid grid-cols-1 gap-8 md:gap-10 pl-0 md:pl-14">
                <PromptBlock
                  label="Skill Name"
                  content={skill.name}
                  blockId={`${skill.id}-name`}
                  copiedKey={copiedKey}
                  handleCopy={handleCopy}
                />

                <PromptBlock
                  label="Description"
                  content={skill.description}
                  blockId={`${skill.id}-desc`}
                  copiedKey={copiedKey}
                  handleCopy={handleCopy}
                />

                <PromptBlock
                  label="Instructions"
                  content={skill.instructions}
                  blockId={`${skill.id}-inst`}
                  copiedKey={copiedKey}
                  handleCopy={handleCopy}
                />
              </div>
            </motion.article>
          )
        })}
      </motion.div>
    </section>
  )
}