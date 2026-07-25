import { db } from '@/lib/db'
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

    // Anggota can only see their own payments
    if (user!.role === 'anggota') {
      where.userId = user!.id
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { paymentNumber: { contains: search } },
        { description: { contains: search } },
        { user: { name: { contains: search } } },
      ]
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ewallet: true,
          verifiedUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      db.payment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List payments error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data pembayaran' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const authError = requireRole(user, ['admin', 'bendahara', 'anggota'])
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }

    const body = await request.json()
    const { ewalletId, amount, description } = body

    // Validate required fields
    if (!ewalletId || !amount) {
      return NextResponse.json(
        { error: 'E-wallet dan jumlah wajib diisi' },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Jumlah harus lebih dari 0' },
        { status: 400 }
      )
    }

    // Validate e-wallet exists
    const ewallet = await db.eWallet.findUnique({ where: { id: ewalletId } })
    if (!ewallet) {
      return NextResponse.json(
        { error: 'E-wallet tidak ditemukan' },
        { status: 404 }
      )
    }

    // Auto-generate payment number: PAY-YYYYMMDD-XXXX
    const today = new Date()
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const todayCount = await db.payment.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    })

    const paymentNumber = `PAY-${dateStr}-${String(todayCount + 1).padStart(4, '0')}`

    // Create payment
    const payment = await db.payment.create({
      data: {
        paymentNumber,
        userId: user!.id,
        ewalletId,
        amount: parseFloat(amount),
        description: description || null,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ewallet: true,
        verifiedUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Send notification to all admin/bendahara users
    const admins = await db.user.findMany({
      where: { role: { in: ['admin', 'bendahara'] }, isActive: true },
      select: { id: true },
    })

    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map(a => ({
          userId: a.id,
          title: 'Pembayaran Baru',
          message: `${payment.user.name} membuat pembayaran sebesar Rp ${payment.amount.toLocaleString('id-ID')} via ${payment.ewallet.name}`,
          type: 'info',
        })),
      })
    }

    return NextResponse.json({
      message: 'Pembayaran berhasil dibuat',
      payment,
    }, { status: 201 })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat pembayaran' },
      { status: 500 }
    )
  }
}
