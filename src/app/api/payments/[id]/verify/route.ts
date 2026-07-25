import { db } from '@/lib/db'
import { getAuthUser, requireRole } from '@/lib/auth-helper'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    const authError = requireRole(user, ['admin', 'bendahara'])
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }

    const { id } = await params
    const body = await request.json()
    const { action, note } = body

    // Validate action
    if (!action || !['verify', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Aksi harus berupa "verify" atau "reject"' },
        { status: 400 }
      )
    }

    // Find the payment
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ewallet: true,
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Pembayaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if payment is still pending
    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: `Pembayaran sudah ${payment.status === 'verified' ? 'diverifikasi' : 'ditolak'}` },
        { status: 400 }
      )
    }

    const now = new Date()

    if (action === 'verify') {
      // Find or create "Iuran Bulanan" income category
      let incomeCategory = await db.incomeCategory.findUnique({
        where: { name: 'Iuran Bulanan' },
      })

      if (!incomeCategory) {
        incomeCategory = await db.incomeCategory.create({
          data: {
            name: 'Iuran Bulanan',
            description: 'Pemasukan dari iuran bulanan anggota',
          },
        })
      }

      // Find the member by userId
      const member = await db.member.findUnique({
        where: { userId: payment.userId },
      })

      // Auto-generate income transaction number: TRM-YYYYMMDD-XXXX
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

      const todayIncomeCount = await db.income.count({
        where: {
          createdAt: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
      })

      const transactionNumber = `TRM-${dateStr}-${String(todayIncomeCount + 1).padStart(4, '0')}`

      // Build income description
      const incomeDescription = `Pembayaran iuran via ${payment.ewallet.name}${payment.description ? ` - ${payment.description}` : ''}`

      // Create income record
      const income = await db.income.create({
        data: {
          transactionNumber,
          date: payment.createdAt,
          memberId: member?.id || null,
          categoryId: incomeCategory.id,
          amount: payment.amount,
          description: incomeDescription,
          createdBy: user!.id,
        },
      })

      // Update payment status and link to income
      const updatedPayment = await db.payment.update({
        where: { id },
        data: {
          status: 'verified',
          verifiedBy: user!.id,
          verifiedAt: now,
          incomeId: income.id,
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

      // Create notification for the payment user
      await db.notification.create({
        data: {
          userId: payment.userId,
          title: 'Pembayaran Diverifikasi',
          message: `Pembayaran Anda sebesar Rp ${payment.amount.toLocaleString('id-ID')} telah diverifikasi`,
          type: 'success',
        },
      })

      return NextResponse.json({
        message: 'Pembayaran berhasil diverifikasi',
        payment: updatedPayment,
        income,
      })
    }

    if (action === 'reject') {
      // Update payment status
      const updatedPayment = await db.payment.update({
        where: { id },
        data: {
          status: 'rejected',
          verifiedBy: user!.id,
          verifiedAt: now,
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

      // Create notification for the payment user
      await db.notification.create({
        data: {
          userId: payment.userId,
          title: 'Pembayaran Ditolak',
          message: `Pembayaran Anda sebesar Rp ${payment.amount.toLocaleString('id-ID')} ditolak${note ? `: ${note}` : ''}`,
          type: 'error',
        },
      })

      return NextResponse.json({
        message: 'Pembayaran ditolak',
        payment: updatedPayment,
      })
    }

    return NextResponse.json(
      { error: 'Aksi tidak valid' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memverifikasi pembayaran' },
      { status: 500 }
    )
  }
}
