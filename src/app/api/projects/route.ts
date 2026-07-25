import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Admin PIN (sederhana, bisa diganti via env)
const ADMIN_PIN = process.env.ADMIN_PIN || "didisecret";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("x-admin-pin");
  return auth === ADMIN_PIN;
}

// GET semua proyek (publik)
export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    const data = projects.map((p) => ({
      ...p,
      tags: p.tags ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    }));
    return NextResponse.json({ data });
  } catch (e) {
    console.error("GET projects error:", e);
    return NextResponse.json(
      { error: "Gagal memuat proyek" },
      { status: 500 }
    );
  }
}

// POST buat proyek baru (admin)
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: "Tidak diizinkan. Masukkan PIN admin yang benar." },
      { status: 401 }
    );
  }
  try {
    const body = await req.json();
    const { title, category, description, image, deployUrl, tags, featured } =
      body;

    if (!title || !category || !description || !image || !deployUrl) {
      return NextResponse.json(
        { error: "Judul, kategori, deskripsi, gambar, dan link deploy wajib diisi." },
        { status: 400 }
      );
    }

    const tagString = Array.isArray(tags)
      ? tags.join(",")
      : typeof tags === "string"
      ? tags
      : "";

    const order = (await db.project.count()) + 1;

    const project = await db.project.create({
      data: {
        title,
        category,
        description,
        image,
        deployUrl: normalizeUrl(deployUrl),
        tags: tagString,
        featured: Boolean(featured),
        order,
      },
    });

    return NextResponse.json({
      data: { ...project, tags: tagString.split(",").map((t) => t.trim()).filter(Boolean) },
    });
  } catch (e) {
    console.error("POST project error:", e);
    return NextResponse.json(
      { error: "Gagal membuat proyek" },
      { status: 500 }
    );
  }
}

function normalizeUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}
