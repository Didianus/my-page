"use client";

import { motion } from "framer-motion";
import { expertise } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./section-header";
import {
  blurReveal,
  clipReveal,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion";

export function Expertise() {
  return (
    <section
      id="keahlian"
      className="relative py-28 lg:py-40 border-t border-white/[0.06]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 lg:mb-20 items-end">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="lg:col-span-3"
          >
            <SectionHeader number="02" label="Keahlian" />
          </motion.div>
          <div className="lg:col-span-9">
            <motion.h2
              variants={blurReveal}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.03em] text-white leading-[1.02]"
            >
              Developer full stack,
              <br />
              <span className="text-white/40">menguasai berbagai teknologi.</span>
            </motion.h2>
          </div>
        </div>

        {/* Cards — clip-path diagonal reveal dengan stagger */}
        <motion.div
          variants={staggerContainer(0.12, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {expertise.map((item) => (
            <motion.article
              key={item.index}
              variants={clipReveal}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-7 lg:p-9 transition-all duration-500",
                "glass hover:border-gold/30"
              )}
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gold/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative flex items-start justify-between mb-8">
                <span className="grid place-items-center h-12 w-12 rounded-xl border border-white/10 text-gold transition-colors group-hover:border-gold/50 group-hover:bg-gold/10">
                  <item.icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span className="font-display text-[0.7rem] tabular-nums tracking-[0.2em] text-white/30">
                  {item.index}
                </span>
              </div>

              <h3 className="font-display text-2xl font-medium tracking-tight text-white mb-3">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/55 max-w-md">
                {item.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {item.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-display text-[0.62rem] uppercase tracking-[0.16em] text-white/50 transition-colors group-hover:border-white/15 group-hover:text-white/70"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
