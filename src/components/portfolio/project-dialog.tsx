"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import type { Project } from "@/lib/project-types";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "mobile";

const deviceSizes: Record<Device, { max: string }> = {
  desktop: { max: "100%" },
  tablet: { max: "820px" },
  mobile: { max: "390px" },
};

export function ProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-[1200px] h-[92vh] p-0 gap-0 bg-background/95 backdrop-blur-2xl border-white/10 overflow-hidden rounded-2xl">
        {project && (
          <DialogInner
            key={project.id}
            project={project}
          />
        )}
        <DialogHeader className="sr-only">
          <DialogTitle>{project?.title ?? "Proyek"}</DialogTitle>
          <DialogDescription>
            Demo langsung website {project?.title ?? ""} —{" "}
            {project?.category ?? ""}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function DialogInner({ project }: { project: Project }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  const size = deviceSizes[device];

  return (
    <>
      {/* Browser-style chrome bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.06] bg-card/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="h-3 w-3 rounded-full bg-red-400/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-background/60 border border-white/[0.08] px-3 py-1.5 min-w-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[0.7rem] text-white/50 truncate font-mono">
              {project.deployUrl}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Device toggle */}
          <div className="hidden sm:flex items-center gap-0.5 rounded-full border border-white/10 p-0.5 mr-1">
            {(
              [
                ["desktop", Monitor],
                ["tablet", Tablet],
                ["mobile", Smartphone],
              ] as const
            ).map(([d, Icon]) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={cn(
                  "grid place-items-center h-7 w-7 rounded-full transition-colors",
                  device === d
                    ? "bg-gold text-ink"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
                aria-label={`Tampilan ${d}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="grid place-items-center h-8 w-8 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-gold/50 transition-colors"
            aria-label="Muat ulang"
            title="Muat ulang demo"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <a
            href={project.deployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="grid place-items-center h-8 w-8 rounded-full border border-white/10 text-white/60 hover:text-gold hover:border-gold/50 transition-colors"
            aria-label="Buka di tab baru"
            title="Buka website asli"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Iframe area */}
      <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden flex items-start justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={device}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full transition-all duration-300 ease-out"
            style={{
              maxWidth: size.max,
              margin: device === "desktop" ? "0" : "16px auto",
              height: device === "desktop" ? "100%" : "calc(100% - 32px)",
              marginTop: device === "desktop" ? "0" : "16px",
              borderRadius: device === "desktop" ? "0" : "12px",
              overflow: "hidden",
              border:
                device === "desktop"
                  ? "none"
                  : "1px solid rgba(255,255,255,0.1)",
              boxShadow:
                device !== "desktop" ? "0 20px 60px rgba(0,0,0,0.5)" : "none",
            }}
          >
            <iframe
              key={iframeKey}
              src={project.deployUrl}
              title={`Demo ${project.title}`}
              className="w-full h-full bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        {/* Loading hint (covered by iframe once loaded) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
          <div className="flex flex-col items-center gap-3 text-white/40">
            <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-gold animate-spin" />
            <span className="font-display text-[0.66rem] uppercase tracking-[0.24em]">
              Memuat demo…
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
