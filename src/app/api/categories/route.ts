import { db } from '@/lib/db'
import { getAuthUser, requireRole } from '@/lib/auth-helper'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/constants'
import { NextRequest, NextResponse } from 'next/server'

async function seedDefaultCategories() {
  const incomeCount = await db.incomeCategory.count()
  const expenseCount = await db.expenseCategory.count()

  if (incomeCount === 0) {
    await db.incomeCategory.createMany({
      data: INCOME_CATEGORIES.map((name) => ({
        name,
        description: `Kategori pemasukan: ${name}`,
      })),
    })
  }

  if (expenseCount === 0) {
    await db.expenseCategory.createMany({
      data: EXPENSE_CATEGORIES.map((name) => ({
        name,
        description: `Kategori pengeluaran: ${name}`,
      })),
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      )
    }

    // Seed default categories if none exist
    await seedDefaultCategories()

    // Fetch all categories
    const incomeCategories = await db.incomeCategory.findMany({
      orderBy: { name: 'asc' },
    })

    const expenseCategories = await db.expenseCategory.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      incomeCategories,
      expenseCategories,
    })
  } catch (error) {
    console.error('List categories error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data kategori' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const authError = requireRole(user, ['admin'])
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status })
    }

    const body = await request.json()
    const { name, type, description } = body

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nama dan tipe kategori wajib diisi' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipe kategori tidak valid. Gunakan income atau expense' },
        { status: 400 }
      )
    }

    // Check name uniqueness in the appropriate category table
    if (type === 'income') {
      const existing = await db.incomeCategory.findUnique({ where: { name } })
      if (existing) {
        return NextResponse.json(
          { error: 'Kategori pemasukan dengan nama ini sudah ada' },
          { status: 409 }
        )
      }

      const category = await db.incomeCategory.create({
        data: {
          name,
          description: description || null,
        },
      })

      return NextResponse.json({
        message: 'Kategori pemasukan berhasil ditambahkan',
        category,
      }, { status: 201 })
    } else {
      const existing = await db.expenseCategory.findUnique({ where: { name } })
      if (existing) {
        return NextResponse.json(
          { error: 'Kategori pengeluaran dengan nama ini sudah ada' },
          { status: 409 }
        )
      }

      const category = await db.expenseCategory.create({
        data: {
          name,
          description: description || null,
        },
      })

      return NextResponse.json({
        message: 'Kategori pengeluaran berhasil ditambahkan',
        category,
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambahkan kategori' },
      { status: 500 }
    )
  }
}
