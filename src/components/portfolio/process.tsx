"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/lib/portfolio-data";
import { SectionHeader } from "./section-header";
import {
  blurReveal,
  numberReveal,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion";

export function Process() {
  return (
    <section
      id="proses"
      className="relative py-28 lg:py-40 border-t border-white/[0.06] overflow-hidden"
    >
      {/* Soft glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[36rem] w-[36rem] rounded-full bg-gold/[0.04] blur-[140px]" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 relative">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 lg:mb-20 items-end">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="lg:col-span-3"
          >
            <SectionHeader number="04" label="Proses" />
          </motion.div>
          <div className="lg:col-span-9">
            <motion.h2
              variants={blurReveal}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.03em] text-white leading-[1.02]"
            >
              Dari ide hingga online, ujung ke ujung.
            </motion.h2>
          </div>
        </div>

        {/* Steps — number blur reveal dengan stagger */}
        <motion.div
          variants={staggerContainer(0.12, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]"
        >
          {processSteps.map((step) => (
            <motion.div
              key={step.index}
              variants={numberReveal}
              className="group relative bg-background p-7 lg:p-8 transition-colors duration-500 hover:bg-card"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-5xl lg:text-6xl font-light tabular-nums text-white/15 group-hover:text-gradient-gold transition-colors">
                  {step.index}
                </span>
                <span className="h-2 w-2 rounded-full bg-white/20 group-hover:bg-gold transition-colors" />
              </div>
              <h3 className="font-display text-xl font-medium tracking-tight text-white mb-3">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/55">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
