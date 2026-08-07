"use client";

import { motion } from "framer-motion";

export default function AmbientGlow() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-[-18%] w-[60vw] max-w-[760px]"
      initial={{ opacity: 0.55 }}
      animate={{ opacity: [0.5, 0.75, 0.58], scale: [1, 1.04, 1] }}
      transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      style={{
        background:
          "radial-gradient(45% 52% at 70% 50%, rgba(255, 170, 0, 0.15) 0%, rgba(255, 170, 0, 0.08) 42%, rgba(255, 170, 0, 0.00) 82%)",
      }}
    />
  );
}
