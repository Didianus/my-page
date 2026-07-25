"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Sparkles, MessageCircle } from "lucide-react";
import { contactMethods, socials } from "@/lib/portfolio-data";
import { SectionHeader } from "./section-header";
import {
  blurReveal,
  clipReveal,
  scaleReveal,
  slideInRight,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion";

const headingLines = ["Mari membangun", "website", "impian Anda."];

export function Contact() {
  return (
    <section
      id="kontak"
      className="relative py-28 lg:py-40 border-t border-white/[0.06] overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[40rem] w-[60rem] rounded-full bg-gold/[0.06] blur-[150px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left — invitation */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="lg:col-span-7"
          >
            <SectionHeader number="05" label="Mari Berbicara" />

            {/* Heading dengan split reveal per baris */}
            <h2 className="mt-8 font-display text-5xl md:text-6xl lg:text-7xl font-medium tracking-[-0.03em] text-white leading-[1.02]">
              {headingLines.map((line, i) => (
                <span key={i} className="block overflow-hidden">
                  <motion.span
                    variants={{
                      hidden: { y: "110%" },
                      show: {
                        y: "0%",
                        transition: {
                          duration: 0.85,
                          ease: [0.22, 1, 0.36, 1] as const,
                          delay: 0.15 + i * 0.12,
                        },
                      },
                    }}
                    className="inline-block"
                  >
                    {line === "website" ? (
                      <span className="text-gradient-gold italic font-light">
                        {line}
                      </span>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </h2>

            <motion.p
              variants={blurReveal}
              className="mt-8 max-w-md text-base leading-relaxed text-white/55"
            >
              Punya ide proyek atau butuh bantuan mengembangkan website?
              Mari berbicara. Saya siap membantu dari analisis kebutuhan,
              pengembangan, hingga deployment ke hosting pilihan Anda.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, delay: 0.6 },
                },
              }}
              className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              <a
                href={contactMethods[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-gold px-7 py-4 font-display text-[0.72rem] uppercase tracking-[0.2em] text-ink transition-transform duration-300 hover:scale-[1.03]"
              >
                <MessageCircle className="h-4 w-4" />
                Chat via WhatsApp
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <MapPin className="h-4 w-4 text-gold/70" />
                Indonesia · Remote ke seluruh dunia
              </div>
            </motion.div>
          </motion.div>

          {/* Right — meta card dengan slide-in */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="lg:col-span-5"
          >
            <div className="glass rounded-2xl p-7 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-[0.62rem] uppercase tracking-[0.26em] text-white/40">
                  Pengerjaan
                </span>
                <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-display text-[0.6rem] uppercase tracking-[0.18em] text-emerald-300/90">
                    Terbuka
                  </span>
                </span>
              </div>

              <dl className="space-y-5 pb-6 border-b border-white/[0.06]">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-display text-[0.66rem] uppercase tracking-[0.2em] text-white/40">
                    Ketersediaan
                  </dt>
                  <dd className="text-sm text-white/80 text-right">
                    Terbuka untuk proyek freelance
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-display text-[0.66rem] uppercase tracking-[0.2em] text-white/40">
                    Estimasi
                  </dt>
                  <dd className="text-sm text-white/80 text-right">
                    1–4 minggu per proyek
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-display text-[0.66rem] uppercase tracking-[0.2em] text-white/40">
                    Mulai dari
                  </dt>
                  <dd className="text-sm text-white/80 text-right">
                    Rp 500rb / proyek
                  </dd>
                </div>
              </dl>

              {/* Contact methods grid — clip reveal dengan stagger */}
              <motion.div
                variants={staggerContainer(0.08, 0.3)}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="pt-6"
              >
                <span className="font-display text-[0.62rem] uppercase tracking-[0.26em] text-white/40">
                  Hubungi saya
                </span>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {contactMethods.map((method) => (
                    <motion.a
                      key={method.label}
                      href={method.href}
                      target={method.href.startsWith("http") ? "_blank" : undefined}
                      rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      variants={clipReveal}
                      className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-all duration-300 hover:border-gold/40 hover:bg-gold/[0.04]"
                    >
                      <div className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gold/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="relative grid place-items-center h-9 w-9 rounded-lg border border-white/10 text-white/70 transition-colors group-hover:border-gold/50 group-hover:text-gold">
                        <method.icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                      </span>
                      <span className="relative mt-3 block font-display text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                        {method.label}
                      </span>
                      <span className="relative mt-1 block text-xs text-white/75 group-hover:text-white transition-colors truncate">
                        {method.value}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Other socials */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { duration: 0.6, delay: 0.7 },
                  },
                }}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="pt-6 mt-6 border-t border-white/[0.06]"
              >
                <span className="font-display text-[0.62rem] uppercase tracking-[0.26em] text-white/40">
                  Lihat karya saya di
                </span>
                <div className="mt-4 flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 font-display text-[0.64rem] uppercase tracking-[0.18em] text-white/55 transition-all duration-300 hover:border-gold/50 hover:text-gold"
                    >
                      <s.icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                      {s.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom note — scale reveal */}
        <motion.div
          variants={scaleReveal}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-16 lg:mt-20 flex items-center justify-center gap-2 text-center"
        >
          <Sparkles className="h-4 w-4 text-gold/60" />
          <p className="font-display text-[0.7rem] uppercase tracking-[0.24em] text-white/35">
            Biasanya membalas dalam 24 jam · Respons cepat di WhatsApp
          </p>
        </motion.div>
      </div>
    </section>
  );
}
