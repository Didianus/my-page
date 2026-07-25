import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-helper'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.notification.count({ where: { userId: user.id } }),
    ])

    const unreadCount = await db.notification.count({
      where: { userId: user.id, isRead: false },
    })

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List notifications error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil notifikasi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, title, message, type } = body

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Judul dan pesan wajib diisi' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['info', 'success', 'warning', 'error']
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipe notifikasi tidak valid' },
        { status: 400 }
      )
    }

    // Target user: if userId provided, send to that user; otherwise send to self
    const targetUserId = userId || user.id

    // Verify target user exists
    if (userId) {
      const targetUser = await db.user.findUnique({ where: { id: userId } })
      if (!targetUser) {
        return NextResponse.json(
          { error: 'User tujuan tidak ditemukan' },
          { status: 404 }
        )
      }
    }

    const notification = await db.notification.create({
      data: {
        userId: targetUserId,
        title,
        message,
        type: type || 'info',
      },
    })

    return NextResponse.json({
      message: 'Notifikasi berhasil dibuat',
      notification,
    }, { status: 201 })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat notifikasi' },
      { status: 500 }
    )
  }
}
