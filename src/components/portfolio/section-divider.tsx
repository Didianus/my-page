"use client";

import { motion } from "framer-motion";
import { viewportOnce } from "@/lib/motion";

/**
 * Pembatas section kreatif: garis emas tipis yang menggambar
 * sendiri (scaleX 0 → 1) saat masuk viewport, dengan titik
 * emas di tengah.
 */
export function SectionDivider() {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="relative mx-auto max-w-7xl px-6 lg:px-10"
      aria-hidden="true"
    >
      <div className="relative h-px w-full bg-white/[0.06]">
        {/* Garis emas yang menggambar dari kiri ke kanan */}
        <motion.div
          variants={{
            hidden: { scaleX: 0 },
            show: {
              scaleX: 1,
              transition: { duration: 1.2, ease: [0.85, 0, 0.15, 1] as const },
            },
          }}
          className="absolute inset-0 origin-left bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        />
        {/* Titik emas di tengah */}
        <motion.span
          variants={{
            hidden: { opacity: 0, scale: 0 },
            show: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.5, delay: 0.6 },
            },
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_12px_2px_rgba(201,169,98,0.6)]"
        />
      </div>
    </motion.div>
  );
}
