import { db } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, phone, address, gender } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Nama, email, password, dan role wajib diisi' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'bendahara', 'anggota']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid. Pilih: admin, bendahara, atau anggota' },
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
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

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone: phone || null,
        address: address || null,
        gender: gender || null,
      },
    })

    // If role is anggota, also create Member record
    if (role === 'anggota') {
      const memberCount = await db.member.count()
      const memberNumber = `MBR-${String(memberCount + 1).padStart(4, '0')}`

      await db.member.create({
        data: {
          memberNumber,
          name,
          email,
          phone: phone || null,
          address: address || null,
          gender: gender || null,
          userId: user.id,
        },
      })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: userWithoutPassword,
      token,
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}
