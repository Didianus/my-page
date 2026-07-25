"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";

const headline = ["Membangun", "website", "modern", "yang", "fungsional"];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const word = {
  hidden: { y: "110%", opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// Cuplikan kode untuk latar belakang (hanya terlihat samar).
// Campuran PHP, Laravel, React, Next.js, SQL — mencerminkan keahlian.
const CODE_SNIPPET = `<?php
// routes/web.php — Sistem Informasi Akademik
use App\\Http\\Controllers\\{MahasiswaController, KRSController};

Route::resource('mahasiswa', MahasiswaController::class);
Route::post('/krs/simpan', [KRSController::class, 'simpan'])->name('krs.simpan');

class MahasiswaController extends Controller {
    public function index(Request $request) {
        $query = Mahasiswa::with(['prodi', 'krs.matakuliah']);
        if ($q = $request->get('q')) {
            $query->where('nama', 'like', "%{$q}%")
                  ->orWhere('nim', 'like', "%{$q}%");
        }
        return view('mahasiswa.index', ['data' => $query->paginate(15)]);
    }
}

// app/Models/Mahasiswa.php
class Mahasiswa extends Model {
    protected $fillable = ['nim', 'nama', 'prodi_id', 'angkatan'];

    public function krs(): HasMany {
        return $this->hasMany(KRS::class);
    }

    public function getIpkAttribute(): float {
        return $this->krs->flatMap->nilai->avg('bobot') ?? 0.0;
    }
}

'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '@/lib/project-types';

export default function Portfolio({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<string>('all');
  const filtered = projects.filter((p) =>
    filter === 'all' ? true : p.category === filter
  );

  return (
    <motion.section layout className="grid gap-6 md:grid-cols-2">
      {filtered.map((project) => (
        <ProjectCard key={project.id} {...project} />
      ))}
    </motion.section>
  );
}

// next.config.ts
import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
};
export default nextConfig;

-- database/migrations/create_krs_table.sql
CREATE TABLE krs (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nim         VARCHAR(15)  NOT NULL,
  kode_mk     VARCHAR(12)  NOT NULL,
  semester    TINYINT      NOT NULL,
  nilai       ENUM('A','B','C','D','E') NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nim)     REFERENCES mahasiswa(nim),
  FOREIGN KEY (kode_mk) REFERENCES matakuliah(kode_mk)
);

# Deploy
git add . && git commit -m "feat: tambah modul KRS"
git push origin main
vercel --prod               # deploy frontend
# upload ke InfinityFree via cPanel  # deploy PHP backend
`;

export function Hero() {
  return (
    <section
      id="beranda"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden noise pt-28 pb-16 isolate"
    >
      {/* ===== Layer 1: Latar belakang kode (paling belakang) ===== */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <pre className="absolute -top-6 left-0 w-[115%] font-mono text-[0.62rem] leading-[1.75] text-cyan-200/25 whitespace-pre select-none md:text-[0.7rem]">
          {CODE_SNIPPET}
          {CODE_SNIPPET}
        </pre>
      </div>

      {/* ===== Layer 2: Overlay biru laut dalam (menjaga tema air) ===== */}
      <div
        className="pointer-events-none absolute inset-0 bg-[oklch(0.12_0.06_235)]/45"
        aria-hidden="true"
      />

      {/* ===== Layer 3: Vignet lembut (tepi sedikit lebih biru gelap) ===== */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 45%, transparent 15%, rgba(10,30,55,0.2) 55%, rgba(5,20,40,0.55) 100%)",
        }}
      />

      {/* ===== Layer 4: Aurora emas + kilau aqua air + grid halus ===== */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-[42rem] w-[42rem] rounded-full bg-gold/[0.08] blur-[120px] animate-aurora" />
        <div
          className="absolute bottom-0 right-1/4 h-[32rem] w-[32rem] rounded-full bg-aqua/[0.1] blur-[120px] animate-aurora"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="absolute top-1/3 right-10 h-[24rem] w-[24rem] rounded-full bg-aqua/[0.06] blur-[100px] animate-aurora"
          style={{ animationDelay: "-8s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_55%)]" />
        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 w-full">
        {/* ===== Layout 2-kolom: kiri = perkenalan + headline, kanan = foto ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* ===== KIRI: Perkenalan & headline ===== */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3 mb-7"
            >
              <span className="h-px w-10 bg-gold/60" />
              <span className="font-display text-[0.7rem] uppercase tracking-[0.32em] text-gold/90">
                Web Developer · Full Stack · Mahasiswa TI
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={container}
              initial="hidden"
              animate="show"
              className="font-display font-medium tracking-[-0.03em] leading-[1.06] text-[clamp(2.6rem,7vw,6rem)] text-white"
            >
              {headline.map((w, i) => (
                <span
                  key={i}
                  className="block overflow-hidden pb-[0.18em] -mb-[0.18em]"
                >
                  <motion.span variants={word} className="inline-block">
                    {w === "website" ? (
                      <span className="text-gradient-gold italic font-light">
                        {w}
                      </span>
                    ) : (
                      w
                    )}
                  </motion.span>
                </span>
              ))}
            </motion.h1>

            {/* Paragraf perkenalan */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-8 text-base md:text-lg leading-relaxed text-white/60 max-w-xl"
            >
              Halo, saya{" "}
              <span className="text-white">Didi</span> — seorang web
              developer full stack dengan latar belakang pendidikan{" "}
              <span className="text-white/80">Teknologi Informasi</span>. Saya
              membangun website dari frontend hingga backend menggunakan PHP,
              JavaScript, dan framework modern, lalu meng-deploy-nya ke Vercel
              atau InfinityFree dengan repository rapi di GitHub.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <a
                href="#proyek"
                className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-6 py-3.5 font-display text-[0.72rem] uppercase tracking-[0.2em] text-ink transition-transform duration-300 hover:scale-[1.03]"
              >
                Lihat proyek pilihan
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="#kontak"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 font-display text-[0.72rem] uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                Mulai proyek
              </a>
            </motion.div>

            {/* Meta row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              <div>
                <dt className="font-display text-[0.62rem] uppercase tracking-[0.28em] text-white/35">
                  Berbasis di
                </dt>
                <dd className="mt-1 text-sm text-white/80">
                  Indonesia · Bekerja remote
                </dd>
              </div>
              <div className="hidden sm:block h-8 w-px bg-white/10" />
              <div>
                <dt className="font-display text-[0.62rem] uppercase tracking-[0.28em] text-white/35">
                  Ketersediaan
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-white/80">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Terbuka untuk proyek freelance
                </dd>
              </div>
            </motion.div>
          </div>

          {/* ===== KANAN: Foto profil (bulatan, rapi di tengah vertikal) ===== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 order-1 lg:order-2 relative flex justify-center lg:justify-end"
          >
            <div className="relative aspect-square w-[240px] sm:w-[290px] lg:w-[340px] xl:w-[380px]">
              {/* Glow emas di belakang */}
              <div className="absolute -inset-6 rounded-full bg-gold/15 blur-3xl" />

              {/* Cincin dekoratif putus-putus yang berputar lambat */}
              <div
                className="absolute -inset-3 rounded-full border border-dashed border-gold/25 animate-slow-spin"
              />

              {/* Cincin luar tipis */}
              <div className="absolute -inset-1 rounded-full border border-gold/20" />

              {/* Foto bulatan */}
              <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-gold/40 ring-1 ring-white/10 shadow-[0_0_50px_-10px_rgba(201,169,98,0.4)]">
                <img
                  src="/portfolio/portrait.png"
                  alt="Foto Didi — Web Developer Full Stack"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                {/* Gradien bawah untuk kedalaman (biru laut) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-[oklch(0.12_0.06_235)]/50 via-transparent to-transparent" />
                {/* Sheen emas halus */}
                <div className="absolute inset-0 rounded-full bg-gold/[0.06] mix-blend-overlay" />
              </div>

              {/* Badge status di bawah */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 flex items-center gap-2 whitespace-nowrap shadow-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="font-display text-[0.62rem] uppercase tracking-[0.22em] text-white/70">
                  Mahasiswa TI · Full Stack Dev
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.a
          href="#tentang"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-14 lg:mt-16 inline-flex items-center gap-2 font-display text-[0.62rem] uppercase tracking-[0.3em] text-white/35 hover:text-gold transition-colors"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" />
          Gulir untuk menjelajah
        </motion.a>
      </div>
    </section>
  );
}
