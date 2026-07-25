import { db } from '@/lib/db'
import { getAuthUser, requireRole } from '@/lib/auth-helper'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    const authError = requireRole(user, ['admin', 'bendahara', 'anggota'])
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }

    const { id } = await params
    const member = await db.member.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            isActive: true,
            avatar: true,
          },
        },
        incomes: {
          orderBy: { date: 'desc' },
          take: 10,
          include: {
            category: true,
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Anggota tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Get member error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data anggota' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    const authError = requireRole(user, ['admin'])
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, phone, address, gender, position, status, role } = body

    // Check if member exists
    const existingMember = await db.member.findUnique({ where: { id } })
    if (!existingMember) {
      return NextResponse.json(
        { error: 'Anggota tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check email uniqueness if email is being changed
    if (email && email !== existingMember.email) {
      const emailExists = await db.member.findFirst({
        where: { email, NOT: { id } },
      })
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email sudah digunakan oleh anggota lain' },
          { status: 409 }
        )
      }
    }

    // Update member and user in transaction
    const updatedMember = await db.$transaction(async (tx) => {
      // Update user record
      if (name || email || phone || address || gender || role) {
        await tx.user.update({
          where: { id: existingMember.userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(phone !== undefined && { phone }),
            ...(address !== undefined && { address }),
            ...(gender !== undefined && { gender }),
            ...(role && { role }),
          },
        })
      }

      // Update member record
      const member = await tx.member.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(gender !== undefined && { gender }),
          ...(position !== undefined && { position }),
          ...(status && { status }),
        },
        include: {
          user: {
            select: {
              id: true,
              role: true,
              isActive: true,
              avatar: true,
            },
          },
        },
      })

      return member
    })

    return NextResponse.json({
      message: 'Data anggota berhasil diperbarui',
      member: updatedMember,
    })
  } catch (error) {
    console.error('Update member error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui data anggota' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    const authError = requireRole(user, ['admin'])
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }

    const { id } = await params

    // Check if member exists
    const existingMember = await db.member.findUnique({ where: { id } })
    if (!existingMember) {
      return NextResponse.json(
        { error: 'Anggota tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete member (cascade will delete user too)
    await db.member.delete({ where: { id } })

    return NextResponse.json({
      message: 'Anggota berhasil dihapus',
    })
  } catch (error) {
    console.error('Delete member error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus anggota' },
      { status: 500 }
    )
  }
}
