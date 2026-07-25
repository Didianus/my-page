"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Plus, ImageOff } from "lucide-react";
import type { Project } from "@/lib/project-types";
import { cn } from "@/lib/utils";
import { ProjectDialog } from "./project-dialog";
import { SectionHeader } from "./section-header";
import { toast } from "sonner";
import {
  blurReveal,
  maskReveal,
  scaleReveal,
  slideInRight,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion";

export function Works() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat");
      const json = await res.json();
      setProjects(json.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat proyek");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Refresh when admin panel modifies projects
  useEffect(() => {
    const handler = () => loadProjects();
    window.addEventListener("projects-changed", handler);
    return () => window.removeEventListener("projects-changed", handler);
  }, [loadProjects]);

  const openProject = (p: Project) => {
    setSelected(p);
    setDialogOpen(true);
  };

  return (
    <section
      id="proyek"
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
            <SectionHeader number="03" label="Proyek Pilihan" />
          </motion.div>
          <div className="lg:col-span-9 flex items-end justify-between gap-6">
            <motion.h2
              variants={blurReveal}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.03em] text-white leading-[1.02]"
            >
              Hasil karya
              <span className="text-gradient-gold italic font-light"> terbaru</span>
            </motion.h2>
            <motion.span
              variants={slideInRight}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="hidden sm:inline-flex items-center gap-2 font-display text-[0.7rem] uppercase tracking-[0.2em] text-white/40"
            >
              Klik untuk demo langsung
              <ArrowUpRight className="h-4 w-4 text-gold" />
            </motion.span>
          </div>
        </div>

        {/* Works grid / loading / empty */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[16/11] rounded-3xl border border-white/[0.07] bg-card animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            variants={staggerContainer(0.14, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
          >
            {projects.map((work, i) => (
              <motion.button
                key={work.id}
                onClick={() => openProject(work)}
                variants={maskReveal}
                className={cn(
                  "group relative block w-full overflow-hidden rounded-3xl border border-white/[0.07] bg-card text-left",
                  work.featured && i === 0 && "lg:col-span-2"
                )}
              >
                {/* Image with mask reveal */}
                <div
                  className={cn(
                    "relative overflow-hidden",
                    work.featured && i === 0
                      ? "aspect-[16/9] lg:aspect-[2.4/1]"
                      : "aspect-[16/11]"
                  )}
                >
                  {work.image ? (
                    <img
                      src={work.image}
                      alt={work.title}
                      className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center bg-muted/20 text-white/20">
                      <ImageOff className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute inset-0 bg-gold/5 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* "Demo" badge — scale reveal */}
                  <motion.span
                    variants={scaleReveal}
                    className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full glass-gold px-3 py-1.5 font-display text-[0.58rem] uppercase tracking-[0.2em] text-gold"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Demo Live
                  </motion.span>

                  {/* Arrow — scale reveal */}
                  <motion.span
                    variants={scaleReveal}
                    className="absolute top-5 left-5 grid place-items-center h-11 w-11 rounded-full glass-gold text-gold translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </motion.span>
                </div>

                {/* Caption */}
                <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-display text-[0.62rem] uppercase tracking-[0.24em] text-gold/80">
                        {work.category}
                      </span>
                      <h3 className="mt-2 font-display text-2xl lg:text-3xl font-medium tracking-tight text-white">
                        {work.title}
                      </h3>
                      <p className="mt-2 max-w-md text-sm text-white/55 line-clamp-2">
                        {work.description}
                      </p>
                    </div>
                    <div className="hidden sm:flex shrink-0 flex-wrap gap-1.5 justify-end max-w-[40%]">
                      {work.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-display text-[0.58rem] uppercase tracking-[0.14em] text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      <ProjectDialog
        project={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-card/40 py-20 text-center">
      <div className="mx-auto grid place-items-center h-14 w-14 rounded-full border border-gold/30 text-gold mb-5">
        <Plus className="h-6 w-6" />
      </div>
      <h3 className="font-display text-xl text-white/80">
        Belum ada proyek
      </h3>
      <p className="mt-2 text-sm text-white/45 max-w-sm mx-auto">
        Tambahkan proyek pertama Anda melalui panel{" "}
        <span className="text-gold">Kelola Proyek</span> di pojok kanan bawah.
      </p>
    </div>
  );
}
