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
    const expense = await db.expense.findUnique({
      where: { id },
      include: {
        category: true,
        createdUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Pengeluaran tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Get expense error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data pengeluaran' },
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
    const { date, categoryId, amount, description, recipient, proofUrl } = body

    // Check if expense exists
    const existingExpense = await db.expense.findUnique({ where: { id } })
    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Pengeluaran tidak ditemukan' },
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
      const category = await db.expenseCategory.findUnique({ where: { id: categoryId } })
      if (!category) {
        return NextResponse.json(
          { error: 'Kategori pengeluaran tidak ditemukan' },
          { status: 404 }
        )
      }
    }

    // Update expense
    const expense = await db.expense.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(categoryId && { categoryId }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(recipient !== undefined && { recipient }),
        ...(proofUrl !== undefined && { proofUrl }),
      },
      include: {
        category: true,
        createdUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Pengeluaran berhasil diperbarui',
      expense,
    })
  } catch (error) {
    console.error('Update expense error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui pengeluaran' },
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

    // Check if expense exists
    const existingExpense = await db.expense.findUnique({ where: { id } })
    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Pengeluaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete expense
    await db.expense.delete({ where: { id } })

    return NextResponse.json({
      message: 'Pengeluaran berhasil dihapus',
    })
  } catch (error) {
    console.error('Delete expense error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus pengeluaran' },
      { status: 500 }
    )
  }
}
