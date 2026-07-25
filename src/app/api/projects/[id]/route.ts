import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ADMIN_PIN = process.env.ADMIN_PIN || "didisecret";

function isAuthorized(req: NextRequest) {
  return req.headers.get("x-admin-pin") === ADMIN_PIN;
}

// PUT update proyek (admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: "Tidak diizinkan" },
      { status: 401 }
    );
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, category, description, image, deployUrl, tags, featured } =
      body;

    const tagString = Array.isArray(tags)
      ? tags.join(",")
      : typeof tags === "string"
      ? tags
      : "";

    let normalizedUrl = deployUrl;
    if (deployUrl) {
      normalizedUrl = /^https?:\/\//i.test(deployUrl.trim())
        ? deployUrl.trim()
        : `https://${deployUrl.trim()}`;
    }

    const project = await db.project.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(normalizedUrl !== undefined && { deployUrl: normalizedUrl }),
        ...(tagString !== undefined && { tags: tagString }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
      },
    });

    return NextResponse.json({
      data: {
        ...project,
        tags: project.tags
          ? project.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      },
    });
  } catch (e) {
    console.error("PUT project error:", e);
    return NextResponse.json({ error: "Gagal memperbarui proyek" }, { status: 500 });
  }
}

// DELETE proyek (admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await db.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE project error:", e);
    return NextResponse.json({ error: "Gagal menghapus proyek" }, { status: 500 });
  }
}
