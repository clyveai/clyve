"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#121110]">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-[130px]"
        animate={shouldReduceMotion ? undefined : { opacity: [0.3, 0.6, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-amber-400/10 blur-[140px]"
        animate={shouldReduceMotion ? undefined : { opacity: [0.2, 0.45, 0.25], scale: [1, 1.05, 1] }}
        transition={{ duration: 11, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-20 sm:px-6 sm:py-24">
        {children}
      </div>
    </div>
  );
}
