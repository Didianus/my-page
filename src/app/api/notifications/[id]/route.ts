import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-helper'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if notification exists and belongs to the user
    const notification = await db.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notifikasi tidak ditemukan' },
        { status: 404 }
      )
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke notifikasi ini' },
        { status: 403 }
      )
    }

    // Mark as read
    const updatedNotification = await db.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({
      message: 'Notifikasi berhasil ditandai sebagai dibaca',
      notification: updatedNotification,
    })
  } catch (error) {
    console.error('Mark notification error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui notifikasi' },
      { status: 500 }
    )
  }
}
