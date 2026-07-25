"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Settings2,
  Lock,
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
  LogOut,
} from "lucide-react";
import type { Project } from "@/lib/project-types";
import { ADMIN_PIN_STORAGE } from "@/lib/project-types";
import { cn } from "@/lib/utils";

const PIN_DEFAULT = "didisecret";

/** Dispatch a global event so the public Works section refreshes. */
function notifyProjectsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("projects-changed"));
  }
}

export function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // Restore auth from localStorage (session convenience)
  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_PIN_STORAGE);
    if (saved === PIN_DEFAULT) setAuthed(true);
  }, []);

  const login = () => {
    if (pinInput.trim() === PIN_DEFAULT) {
      setAuthed(true);
      sessionStorage.setItem(ADMIN_PIN_STORAGE, PIN_DEFAULT);
      setPinError("");
      setPinInput("");
      loadProjects();
    } else {
      setPinError("PIN salah. Coba lagi.");
    }
  };

  const logout = () => {
    setAuthed(false);
    sessionStorage.removeItem(ADMIN_PIN_STORAGE);
    setOpen(false);
  };

  const loadProjects = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const json = await res.json();
      setProjects(json.data || []);
    } catch {
      toast.error("Gagal memuat daftar proyek");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (open && authed) loadProjects();
  }, [open, authed, loadProjects]);

  const handleDelete = async (p: Project) => {
    if (!confirm(`Hapus proyek "${p.title}"? Tindakan ini tidak bisa dibatalkan.`))
      return;
    try {
      const res = await fetch(`/api/projects/${p.id}`, {
        method: "DELETE",
        headers: { "x-admin-pin": PIN_DEFAULT },
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Gagal menghapus");
      }
      toast.success("Proyek dihapus");
      loadProjects();
      notifyProjectsChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setFormOpen(true);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 grid place-items-center h-12 w-12 rounded-full glass-gold text-gold shadow-lg hover:scale-105 transition-transform"
        aria-label="Kelola Proyek"
        title="Kelola Proyek"
      >
        <Settings2 className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-background/95 backdrop-blur-2xl border-white/10 p-0 flex flex-col"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="font-display text-lg text-white flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-gold" />
                  Kelola Proyek
                </SheetTitle>
                <SheetDescription className="text-white/45 text-xs mt-1">
                  {authed
                    ? "Tambah, edit, atau hapus proyek Anda."
                    : "Masuk dengan PIN admin untuk mengelola proyek."}
                </SheetDescription>
              </div>
              {authed && (
                <button
                  onClick={logout}
                  className="grid place-items-center h-8 w-8 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors"
                  aria-label="Keluar"
                  title="Keluar"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </SheetHeader>

          {!authed ? (
            <div className="flex-1 grid place-items-center px-6 py-12">
              <div className="w-full max-w-xs">
                <div className="mx-auto grid place-items-center h-14 w-14 rounded-full border border-gold/30 text-gold mb-5">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-center font-display text-lg text-white/90">
                  Akses Admin
                </h3>
                <p className="text-center text-xs text-white/45 mt-1 mb-6">
                  Masukkan PIN untuk mengelola proyek.
                </p>
                <Input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  placeholder="PIN admin"
                  className="bg-white/[0.04] border-white/10 text-white text-center tracking-[0.3em]"
                />
                {pinError && (
                  <p className="mt-2 text-xs text-red-400 text-center">
                    {pinError}
                  </p>
                )}
                <Button
                  onClick={login}
                  className="w-full mt-4 bg-gold text-ink hover:bg-gold/90 font-display text-xs uppercase tracking-[0.2em]"
                >
                  Masuk
                </Button>
                <p className="mt-4 text-[0.62rem] text-white/30 text-center">
                  PIN default: <code className="text-gold/70">didisecret</code>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <Button
                  onClick={openCreate}
                  className="w-full bg-gold text-ink hover:bg-gold/90 font-display text-xs uppercase tracking-[0.2em] gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Proyek
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {loadingList ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                  </div>
                ) : projects.length === 0 ? (
                  <p className="text-center text-sm text-white/40 py-10">
                    Belum ada proyek.
                  </p>
                ) : (
                  projects.map((p) => (
                    <div
                      key={p.id}
                      className="group rounded-xl border border-white/[0.06] bg-card/40 p-3 flex gap-3 items-center hover:border-white/15 transition-colors"
                    >
                      <div className="h-14 w-20 shrink-0 rounded-md overflow-hidden bg-muted/20 border border-white/[0.06]">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-white/20">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-display text-sm text-white truncate">
                            {p.title}
                          </p>
                          {p.featured && (
                            <span className="text-[0.5rem] uppercase tracking-wider text-gold border border-gold/30 rounded px-1">
                              Unggulan
                            </span>
                          )}
                        </div>
                        <p className="text-[0.62rem] text-white/40 truncate">
                          {p.category}
                        </p>
                        <a
                          href={p.deployUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[0.62rem] text-gold/70 hover:text-gold mt-0.5"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">
                            {p.deployUrl.replace(/^https?:\/\//, "")}
                          </span>
                        </a>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(p)}
                          className="grid place-items-center h-7 w-7 rounded-md border border-white/10 text-white/60 hover:text-gold hover:border-gold/50 transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="grid place-items-center h-7 w-7 rounded-md border border-white/10 text-white/60 hover:text-red-400 hover:border-red-400/50 transition-colors"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        pin={PIN_DEFAULT}
        onSaved={loadProjects}
      />
    </>
  );
}

/* ---------------- Project Form Dialog ---------------- */

function ProjectFormDialog({
  open,
  onOpenChange,
  editing,
  pin,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Project | null;
  pin: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    image: "",
    deployUrl: "",
    tags: "",
    featured: false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          title: editing.title,
          category: editing.category,
          description: editing.description,
          image: editing.image,
          deployUrl: editing.deployUrl,
          tags: (editing.tags || []).join(", "),
          featured: Boolean(editing.featured),
        });
      } else {
        setForm({
          title: "",
          category: "",
          description: "",
          image: "",
          deployUrl: "",
          tags: "",
          featured: false,
        });
      }
    }
  }, [open, editing]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/projects/upload", {
        method: "POST",
        headers: { "x-admin-pin": pin },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal upload");
      setForm((f) => ({ ...f, image: json.url }));
      toast.success("Gambar terunggah");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.description.trim() ||
      !form.image.trim() ||
      !form.deployUrl.trim()
    ) {
      toast.error("Semua field wajib diisi (kecuali tag & unggulan)");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        deployUrl: form.deployUrl.trim(),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured: form.featured,
      };
      const url = editing ? `/api/projects/${editing.id}` : "/api/projects";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
      toast.success(editing ? "Proyek diperbarui" : "Proyek ditambahkan");
      onOpenChange(false);
      onSaved();
      notifyProjectsChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan proyek");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-2xl border-white/10 max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-white flex items-center gap-2">
            {editing ? (
              <Pencil className="h-4 w-4 text-gold" />
            ) : (
              <Plus className="h-4 w-4 text-gold" />
            )}
            {editing ? "Edit Proyek" : "Tambah Proyek Baru"}
          </DialogTitle>
          <DialogDescription className="text-white/45">
            {editing
              ? "Perbarui detail proyek dan link demo website."
              : "Isi detail proyek beserta link website yang sudah di-deploy. Saat dibuka, proyek akan menampilkan demo langsung."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Image upload */}
          <div className="grid gap-2">
            <Label className="text-white/70 text-xs uppercase tracking-wider font-display">
              Tampilan Website
            </Label>
            <div className="flex gap-3 items-start">
              <div className="h-24 w-40 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-muted/20 grid place-items-center">
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-white/20" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full bg-white/[0.03] border-white/10 text-white/80 hover:text-white hover:border-gold/40 font-display text-xs uppercase tracking-wider gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? "Mengunggah…" : "Upload Gambar"}
                </Button>
                <Input
                  value={form.image}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image: e.target.value }))
                  }
                  placeholder="atau tempel URL gambar"
                  className="bg-white/[0.03] border-white/10 text-white/80 text-xs"
                />
                <p className="text-[0.6rem] text-white/35">
                  PNG/JPG/WEBP, maks 5MB. Rekomendasi landscape 1344×768.
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="grid gap-2">
            <Label className="text-white/70 text-xs uppercase tracking-wider font-display">
              Judul Proyek
            </Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="contoh: Toko Kopi Senja"
              className="bg-white/[0.03] border-white/10 text-white"
            />
          </div>

          {/* Category + tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider font-display">
                Kategori
              </Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="contoh: E-commerce · Web App"
                className="bg-white/[0.03] border-white/10 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider font-display">
                Tag (pisah koma)
              </Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="React, Next.js, UI"
                className="bg-white/[0.03] border-white/10 text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label className="text-white/70 text-xs uppercase tracking-wider font-display">
              Deskripsi
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Deskripsi singkat proyek…"
              rows={3}
              className="bg-white/[0.03] border-white/10 text-white resize-none"
            />
          </div>

          {/* Deploy URL */}
          <div className="grid gap-2">
            <Label className="text-white/70 text-xs uppercase tracking-wider font-display">
              Link Website yang Sudah Deploy
            </Label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input
                value={form.deployUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deployUrl: e.target.value }))
                }
                placeholder="https://proyek-anda.vercel.app"
                className="bg-white/[0.03] border-white/10 text-white pl-9"
              />
            </div>
            <p className="text-[0.6rem] text-gold/60">
              ✦ Saat proyek dibuka, website ini akan ditampilkan sebagai demo live.
            </p>
          </div>

          {/* Featured */}
          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div>
              <p className="text-sm text-white/80 font-display">Proyek Unggulan</p>
              <p className="text-[0.62rem] text-white/40">
                Tampil sebagai kartu besar di bagian atas.
              </p>
            </div>
            <Switch
              checked={form.featured}
              onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/30 font-display text-xs uppercase tracking-wider gap-2"
          >
            <X className="h-4 w-4" />
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gold text-ink hover:bg-gold/90 font-display text-xs uppercase tracking-wider gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {editing ? "Simpan Perubahan" : "Tambah Proyek"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
