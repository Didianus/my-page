"use client";

import { motion } from "framer-motion";
import { stats } from "@/lib/portfolio-data";
import { SectionHeader } from "./section-header";
import {
  numberReveal,
  staggerContainer,
  viewportOnce,
  wordStaggerContainer,
  wordStaggerItem,
} from "@/lib/motion";

// Pecah statement jadi kata-kata agar bisa di-stagger.
const statementWords = [
  "Saya", "seorang", "web", "developer", "full", "stack", "dengan",
  "latar", "belakang", "pendidikan", "Teknologi", "Informasi.", "Saya",
  "membangun", "website", "dari", "frontend", "hingga", "backend",
  "menggunakan", "PHP,", "JavaScript,", "dan", "database", "MySQL,",
  "lalu", "mengunggahnya", "ke", "GitHub", "dan", "meng-deploy", "ke",
  "Vercel", "atau", "InfinityFree.", "Fokus", "saya", "sederhana:",
  "website", "yang", "berjalan", "lancar,", "rapi,", "dan", "benar-benar",
  "bisa", "digunakan.",
];

// Kata yang harus di-highlight
const highlightWords = new Set([
  "web", "developer", "full", "stack", "Teknologi", "Informasi.",
]);

const goldWords = new Set([
  "frontend", "backend", "PHP,", "Vercel", "InfinityFree.",
]);

export function About() {
  return (
    <section
      id="tentang"
      className="relative py-28 lg:py-40 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Label */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="lg:col-span-3"
          >
            <SectionHeader number="01" label="Tentang" />
          </motion.div>

          {/* Statement — word stagger reveal */}
          <div className="lg:col-span-9">
            <motion.p
              variants={wordStaggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="font-display text-2xl md:text-3xl lg:text-[2.6rem] leading-[1.25] tracking-[-0.02em] text-white/85 text-balance [perspective:1000px]"
            >
              {statementWords.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
                  <motion.span variants={wordStaggerItem} className="inline-block">
                    {goldWords.has(word) ? (
                      <span className="text-gradient-gold italic font-light">
                        {word}
                      </span>
                    ) : highlightWords.has(word) ? (
                      <span className="text-white">{word}</span>
                    ) : (
                      word
                    )}
                  </motion.span>
                </span>
              ))}
            </motion.p>

            {/* Stats — number reveal dengan stagger */}
            <motion.div
              variants={staggerContainer(0.12, 0.2)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={numberReveal}
                  className="bg-background p-6 lg:p-8"
                >
                  <div className="font-display text-4xl lg:text-5xl font-medium tracking-tight text-gradient-gold">
                    {stat.value}
                  </div>
                  <div className="mt-2 font-display text-[0.66rem] uppercase tracking-[0.22em] text-white/45">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
