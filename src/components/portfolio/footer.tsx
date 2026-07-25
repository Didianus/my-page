"use client";

import { ArrowUp } from "lucide-react";
import { navLinks, socials } from "@/lib/portfolio-data";

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/[0.06] bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Top band */}
        <div className="py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <a href="#beranda" className="inline-flex items-center gap-2.5">
              <span className="grid place-items-center h-9 w-9 rounded-full border border-white/20">
                <span className="font-display text-sm font-semibold text-gold">
                  D
                </span>
              </span>
              <span className="font-display text-[0.7rem] uppercase tracking-[0.28em] text-white/70">
                Didi
              </span>
            </a>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/45">
              Web developer full stack dengan latar belakang Teknologi
              Informasi. Membangun website modern dari frontend hingga
              backend, di-deploy ke Vercel & InfinityFree, dari Indonesia untuk
              siapa saja.
            </p>
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <span className="font-display text-[0.62rem] uppercase tracking-[0.26em] text-white/35">
              Navigasi
            </span>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <span className="font-display text-[0.62rem] uppercase tracking-[0.26em] text-white/35">
              Hubungi & ikuti
            </span>
            <ul className="mt-4 space-y-2.5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-gold"
                  >
                    <s.icon className="h-3.5 w-3.5 text-white/40 group-hover:text-gold transition-colors" strokeWidth={1.6} />
                    {s.label}
                    <ArrowUp className="h-3 w-3 -rotate-45 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Oversized wordmark */}
        <div className="relative overflow-hidden border-t border-white/[0.06]">
          <div
            aria-hidden
            className="select-none py-10 lg:py-14 text-center font-display font-medium tracking-[-0.04em] leading-none text-[clamp(3.5rem,16vw,16rem)] text-white/[0.04]"
          >
            DIDI
          </div>
        </div>

        {/* Bottom row */}
        <div className="py-7 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06]">
          <p className="font-display text-[0.62rem] uppercase tracking-[0.2em] text-white/35">
            © {new Date().getFullYear()} Didi — Web Developer. Semua hak dilindungi.
          </p>
          <div className="flex items-center gap-6">
            <span className="font-display text-[0.62rem] uppercase tracking-[0.2em] text-white/35">
              Dibangun dengan PHP & Next.js
            </span>
            <a
              href="#beranda"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-display text-[0.6rem] uppercase tracking-[0.2em] text-white/55 transition-colors hover:border-gold/50 hover:text-gold"
            >
              Kembali ke atas
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
