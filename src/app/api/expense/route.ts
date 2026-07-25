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
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { transactionNumber: { contains: search } },
        { description: { contains: search } },
        { recipient: { contains: search } },
      ]
    }

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {}
      if (dateFrom) dateFilter.gte = new Date(dateFrom)
      if (dateTo) dateFilter.lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999))
      where.date = dateFilter
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const [expenses, total] = await Promise.all([
      db.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          category: true,
          createdUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      db.expense.count({ where }),
    ])

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List expenses error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data pengeluaran' },
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
    const { date, categoryId, amount, description, recipient, proofUrl } = body

    // Validate required fields
    if (!date || !categoryId || !amount) {
      return NextResponse.json(
        { error: 'Tanggal, kategori, dan jumlah wajib diisi' },
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

    // Validate category exists
    const category = await db.expenseCategory.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json(
        { error: 'Kategori pengeluaran tidak ditemukan' },
        { status: 404 }
      )
    }

    // Auto-generate transaction number
    const today = new Date(date)
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const todayCount = await db.expense.count({
      where: {
        date: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    })

    const transactionNumber = `TRK-${dateStr}-${String(todayCount + 1).padStart(4, '0')}`

    // Create expense
    const expense = await db.expense.create({
      data: {
        transactionNumber,
        date: new Date(date),
        categoryId,
        amount: parseFloat(amount),
        description: description || null,
        recipient: recipient || null,
        proofUrl: proofUrl || null,
        createdBy: user!.id,
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
      message: 'Pengeluaran berhasil ditambahkan',
      expense,
    }, { status: 201 })
  } catch (error) {
    console.error('Create expense error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambahkan pengeluaran' },
      { status: 500 }
    )
  }
}
