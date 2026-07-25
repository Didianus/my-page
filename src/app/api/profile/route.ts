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

    // Get user with member data if applicable
    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        gender: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            id: true,
            memberNumber: true,
            position: true,
            joinDate: true,
            status: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data profil' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, address, gender } = body

    // Validate gender if provided
    if (gender && !['L', 'P'].includes(gender)) {
      return NextResponse.json(
        { error: 'Jenis kelamin tidak valid. Gunakan L atau P' },
        { status: 400 }
      )
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(gender !== undefined && { gender }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        gender: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            id: true,
            memberNumber: true,
            position: true,
            joinDate: true,
            status: true,
          },
        },
      },
    })

    // Also update member record if user is an anggota
    if (user.role === 'anggota' && name) {
      const member = await db.member.findUnique({ where: { userId: user.id } })
      if (member) {
        await db.member.update({
          where: { id: member.id },
          data: {
            ...(name && { name }),
            ...(phone !== undefined && { phone }),
            ...(address !== undefined && { address }),
            ...(gender !== undefined && { gender }),
          },
        })
      }
    }

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      profile: updatedUser,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui profil' },
      { status: 500 }
    )
  }
}
