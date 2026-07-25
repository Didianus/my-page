import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, requireRole } from '@/lib/auth-helper'
import { db } from '@/lib/db'

// GET /api/ewallets — List all active e-wallets (all authenticated users)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const authError = requireRole(user, ['admin', 'bendahara', 'anggota'])
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }

    const ewallets = await db.eWallet.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ewallets })
  } catch (error) {
    console.error('[EWALLETS_GET]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data e-wallet.' },
      { status: 500 }
    )
  }
}

// POST /api/ewallets — Create e-wallet (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const authError = requireRole(user, ['admin'])
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }

    const body = await request.json()
    const { type, name, number, holderName, qrUrl, isActive } = body

    // Validate required fields
    if (!type || !name || !number || !holderName) {
      return NextResponse.json(
        { error: 'Field type, name, number, dan holderName wajib diisi.' },
        { status: 400 }
      )
    }

    // Validate type value
    const validTypes = ['dana', 'ovo', 'gopay', 'shopeepay', 'qris', 'bank']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type harus salah satu dari: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const ewallet = await db.eWallet.create({
      data: {
        type,
        name,
        number,
        holderName,
        qrUrl: qrUrl || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ data: ewallet }, { status: 201 })
  } catch (error) {
    console.error('[EWALLETS_POST]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat e-wallet.' },
      { status: 500 }
    )
  }
}
