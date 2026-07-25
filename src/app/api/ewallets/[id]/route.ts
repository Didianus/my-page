import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, requireRole } from '@/lib/auth-helper'
import { db } from '@/lib/db'

// PUT /api/ewallets/[id] — Update e-wallet (admin only)
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

    const existing = await db.eWallet.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'E-wallet tidak ditemukan.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { type, name, number, holderName, qrUrl, isActive } = body

    // Validate type if provided
    if (type !== undefined) {
      const validTypes = ['dana', 'ovo', 'gopay', 'shopeepay', 'qris', 'bank']
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `Type harus salah satu dari: ${validTypes.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // At least one field must be provided for update
    if (type === undefined && name === undefined && number === undefined &&
        holderName === undefined && qrUrl === undefined && isActive === undefined) {
      return NextResponse.json(
        { error: 'Minimal satu field harus diisi untuk update.' },
        { status: 400 }
      )
    }

    const ewallet = await db.eWallet.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(name !== undefined && { name }),
        ...(number !== undefined && { number }),
        ...(holderName !== undefined && { holderName }),
        ...(qrUrl !== undefined && { qrUrl }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ data: ewallet })
  } catch (error) {
    console.error('[EWALLETS_PUT]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate e-wallet.' },
      { status: 500 }
    )
  }
}

// DELETE /api/ewallets/[id] — Delete e-wallet (admin only)
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

    const existing = await db.eWallet.findUnique({
      where: { id },
      include: { payments: { select: { id: true }, take: 1 } },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'E-wallet tidak ditemukan.' },
        { status: 404 }
      )
    }

    // Check if e-wallet has associated payments — soft delete instead
    if (existing.payments.length > 0) {
      const ewallet = await db.eWallet.update({
        where: { id },
        data: { isActive: false },
      })
      return NextResponse.json({
        data: ewallet,
        message: 'E-wallet memiliki riwayat pembayaran. Status diubah menjadi tidak aktif.',
      })
    }

    // No payments — hard delete
    await db.eWallet.delete({ where: { id } })

    return NextResponse.json({
      data: null,
      message: 'E-wallet berhasil dihapus.',
    })
  } catch (error) {
    console.error('[EWALLETS_DELETE]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus e-wallet.' },
      { status: 500 }
    )
  }
}
