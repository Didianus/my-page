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
    const income = await db.income.findUnique({
      where: { id },
      include: {
        category: true,
        member: {
          select: {
            id: true,
            name: true,
            memberNumber: true,
          },
        },
        createdUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!income) {
      return NextResponse.json(
        { error: 'Pemasukan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ income })
  } catch (error) {
    console.error('Get income error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data pemasukan' },
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
    const authError = requireRole(user, ['admin', 'bendahara'])
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }

    const { id } = await params
    const body = await request.json()
    const { date, memberId, categoryId, amount, description, proofUrl } = body

    // Check if income exists
    const existingIncome = await db.income.findUnique({ where: { id } })
    if (!existingIncome) {
      return NextResponse.json(
        { error: 'Pemasukan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { error: 'Jumlah harus lebih dari 0' },
        { status: 400 }
      )
    }

    // Validate category if provided
    if (categoryId) {
      const category = await db.incomeCategory.findUnique({ where: { id: categoryId } })
      if (!category) {
        return NextResponse.json(
          { error: 'Kategori pemasukan tidak ditemukan' },
          { status: 404 }
        )
      }
    }

    // Validate member if provided
    if (memberId) {
      const member = await db.member.findUnique({ where: { id: memberId } })
      if (!member) {
        return NextResponse.json(
          { error: 'Anggota tidak ditemukan' },
          { status: 404 }
        )
      }
    }

    // Update income
    const income = await db.income.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(memberId !== undefined && { memberId: memberId || null }),
        ...(categoryId && { categoryId }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(proofUrl !== undefined && { proofUrl }),
      },
      include: {
        category: true,
        member: {
          select: {
            id: true,
            name: true,
            memberNumber: true,
          },
        },
        createdUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Pemasukan berhasil diperbarui',
      income,
    })
  } catch (error) {
    console.error('Update income error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui pemasukan' },
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

    // Check if income exists
    const existingIncome = await db.income.findUnique({ where: { id } })
    if (!existingIncome) {
      return NextResponse.json(
        { error: 'Pemasukan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete income
    await db.income.delete({ where: { id } })

    return NextResponse.json({
      message: 'Pemasukan berhasil dihapus',
    })
  } catch (error) {
    console.error('Delete income error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus pemasukan' },
      { status: 500 }
    )
  }
}
