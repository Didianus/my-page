"use client";

import { motion } from "framer-motion";
import { socials } from "@/lib/portfolio-data";

export function SocialRail() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-6"
      aria-label="Hubungi cepat"
    >
      <span className="h-12 w-px bg-gradient-to-b from-transparent to-white/20" />
      {socials.map(({ icon: Icon, label, href }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="group relative flex flex-col items-center gap-1.5"
          aria-label={label}
        >
          <span className="grid place-items-center h-10 w-10 rounded-full border border-white/10 text-white/50 transition-all duration-300 group-hover:border-gold/60 group-hover:text-gold group-hover:-translate-y-0.5 group-hover:bg-gold/[0.06]">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </span>
          {/* Tooltip label */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-background/90 px-3 py-1 font-display text-[0.6rem] uppercase tracking-[0.18em] text-white/70 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
            {label}
          </span>
        </a>
      ))}
      <span className="h-12 w-px bg-gradient-to-b from-white/20 to-transparent" />
      <span
        className="font-display text-[0.62rem] uppercase tracking-[0.3em] text-white/30"
        style={{ writingMode: "vertical-rl" }}
      >
        Hubungi Saya
      </span>
    </motion.aside>
  );
}
