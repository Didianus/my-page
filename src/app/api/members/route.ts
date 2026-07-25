import { db } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { getAuthUser, requireRole } from '@/lib/auth-helper'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const authError = requireRole(user, ['admin', 'bendahara', 'anggota'])
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { memberNumber: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [members, total] = await Promise.all([
      db.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      db.member.count({ where }),
    ])

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List members error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data anggota' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const authError = requireRole(user, ['admin', 'bendahara'])
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }

    const body = await request.json()
    const { name, email, password, phone, address, gender, position, status, role } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Check email uniqueness
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      )
    }

    // Check member email uniqueness
    const existingMember = await db.member.findUnique({ where: { email } })
    if (existingMember) {
      return NextResponse.json(
        { error: 'Email anggota sudah terdaftar' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Auto-generate member number
    const memberCount = await db.member.count()
    const memberNumber = `MBR-${String(memberCount + 1).padStart(4, '0')}`

    // Create both User and Member records in a transaction
    const result = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'anggota',
          phone: phone || null,
          address: address || null,
          gender: gender || null,
        },
      })

      const newMember = await tx.member.create({
        data: {
          memberNumber,
          name,
          email,
          phone: phone || null,
          address: address || null,
          gender: gender || null,
          position: position || null,
          status: status || 'aktif',
          userId: newUser.id,
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

      return newMember
    })

    return NextResponse.json({
      message: 'Anggota berhasil ditambahkan',
      member: result,
    }, { status: 201 })
  } catch (error) {
    console.error('Create member error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambahkan anggota' },
      { status: 500 }
    )
  }
}
