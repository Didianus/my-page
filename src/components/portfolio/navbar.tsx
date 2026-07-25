"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? "py-3 backdrop-blur-xl bg-background/70 border-b border-white/[0.06]"
            : "py-5 bg-transparent"
        )}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#beranda"
            className="group flex items-center gap-2.5"
            aria-label="Didi — beranda"
          >
            <span className="relative grid place-items-center h-9 w-9 rounded-full border border-white/20 transition-colors group-hover:border-gold/60">
              <span className="font-display text-sm font-semibold tracking-tight text-gold">
                D
              </span>
              <span className="absolute inset-0 rounded-full bg-gold/0 blur-md transition-all duration-500 group-hover:bg-gold/20" />
            </span>
            <span className="hidden sm:block font-display text-[0.7rem] uppercase tracking-[0.28em] text-white/70">
              Didi
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative font-display text-[0.72rem] uppercase tracking-[0.22em] text-white/60 transition-colors hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <a
              href="#kontak"
              className="hidden xl:inline-flex items-center rounded-full border border-white/20 px-5 py-2 font-display text-[0.7rem] uppercase tracking-[0.2em] text-white/80 transition-all duration-300 hover:border-gold/60 hover:bg-gold hover:text-ink"
            >
              Mari bicara
            </a>
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden grid place-items-center h-10 w-10 rounded-full border border-white/15 text-white"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <span className="font-display text-sm uppercase tracking-[0.28em] text-gold">
                Menu
              </span>
              <button
                onClick={() => setOpen(false)}
                className="grid place-items-center h-10 w-10 rounded-full border border-white/15 text-white"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col px-6 pt-8">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i + 0.1 }}
                  className="border-b border-white/[0.06] py-5 font-display text-3xl font-medium tracking-tight text-white/80 transition-colors hover:text-gold"
                >
                  <span className="mr-3 text-sm text-gold/60">
                    0{i + 1}
                  </span>
                  {link.label}
                </motion.a>
              ))}
              <a
                href="#kontak"
                onClick={() => setOpen(false)}
                className="mt-10 inline-flex items-center justify-center rounded-full bg-gold px-6 py-4 font-display text-sm uppercase tracking-[0.2em] text-ink"
              >
                Mulai proyek
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
