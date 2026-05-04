"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    // Menggunakan bg-black murni agar pixel OLED mati total (hemat baterai & super smooth)
    <div className="relative min-h-screen overflow-hidden bg-black selection:bg-white selection:text-black">

      {/* 
        Elemen dekoratif di bawah ini telah disederhanakan:
        - Blur dihapus karena menyebabkan lag GPU di mobile.
        - Menggunakan opacity statis atau animasi transform-gpu yang sangat ringan.
      */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-900/5 transform-gpu"
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-zinc-900/10 transform-gpu"
            animate={{ opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full flex justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}