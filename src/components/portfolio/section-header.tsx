"use client";

import { motion } from "framer-motion";
import { lineDraw, slideInLeft, viewportOnce } from "@/lib/motion";

type Props = {
  number: string;
  label: string;
};

/**
 * Header section dengan transisi kreatif:
 * - Nomor section meluncur dari kiri
 * - Garis emas menggambar sendiri (scaleX 0 → 1)
 * - Label fade in setelah garis
 */
export function SectionHeader({ number, label }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="flex items-center gap-3"
    >
      <motion.span
        variants={slideInLeft}
        className="font-display text-[0.62rem] uppercase tracking-[0.3em] text-gold"
      >
        {number}
      </motion.span>
      <motion.span
        variants={lineDraw}
        className="h-px w-8 origin-left bg-gold/40"
      />
      <motion.span
        variants={{
          hidden: { opacity: 0, x: -12 },
          show: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, delay: 0.3 },
          },
        }}
        className="font-display text-[0.62rem] uppercase tracking-[0.3em] text-white/40"
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
