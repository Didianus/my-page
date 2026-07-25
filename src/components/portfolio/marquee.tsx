"use client";

import { techStack } from "@/lib/portfolio-data";

export function Marquee() {
  const row = [...techStack, ...techStack];
  return (
    <section
      aria-label="Teknologi yang dikuasai"
      className="relative border-y border-white/[0.06] py-8 overflow-hidden bg-background"
    >
      <div className="flex items-center gap-4 mb-6 px-6 lg:px-10 max-w-7xl mx-auto">
        <span className="h-px w-8 bg-gold/50" />
        <span className="font-display text-[0.62rem] uppercase tracking-[0.3em] text-white/40">
          Teknologi yang dikuasai
        </span>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-marquee">
          {row.map((tech, i) => (
            <div
              key={`${tech}-${i}`}
              className="flex items-center gap-12 px-6"
            >
              <span className="font-display text-lg sm:text-xl uppercase tracking-[0.18em] text-white/30 hover:text-gold/70 transition-colors duration-300 whitespace-nowrap">
                {tech}
              </span>
              <span className="text-gold/40">✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
