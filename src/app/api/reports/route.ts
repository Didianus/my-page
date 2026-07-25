import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-helper'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'monthly' // daily, weekly, monthly, yearly
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const categoryId = searchParams.get('categoryId') || ''

    // Build date filters
    let startDate: Date
    let endDate: Date = new Date()

    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom)
      endDate = new Date(new Date(dateTo).setHours(23, 59, 59, 999))
    } else {
      // Default to current month if no dates provided
      const now = new Date()
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    }

    // Build where clauses
    const incomeWhere: Record<string, unknown> = {
      date: { gte: startDate, lte: endDate },
    }
    const expenseWhere: Record<string, unknown> = {
      date: { gte: startDate, lte: endDate },
    }

    if (categoryId) {
      // Determine if it's an income or expense category
      const incomeCat = await db.incomeCategory.findUnique({ where: { id: categoryId } })
      const expenseCat = await db.expenseCategory.findUnique({ where: { id: categoryId } })

      if (incomeCat) {
        incomeWhere.categoryId = categoryId
      } else if (expenseCat) {
        expenseWhere.categoryId = categoryId
      }
    }

    // Fetch data
    const incomes = await db.income.findMany({
      where: incomeWhere,
      orderBy: { date: 'asc' },
      include: {
        category: true,
        member: {
          select: { id: true, name: true, memberNumber: true },
        },
        createdUser: {
          select: { id: true, name: true },
        },
      },
    })

    const expenses = await db.expense.findMany({
      where: expenseWhere,
      orderBy: { date: 'asc' },
      include: {
        category: true,
        createdUser: {
          select: { id: true, name: true },
        },
      },
    })

    // Calculate totals
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)
    const saldo = totalIncome - totalExpense

    // Group data based on report type
    const groupedData: Record<string, { income: number; expense: number; items: unknown[] }> = {}

    const formatKey = (date: Date): string => {
      switch (type) {
        case 'daily': {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        }
        case 'weekly': {
          const startOfWeek = new Date(date)
          const day = startOfWeek.getDay()
          const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
          const weekStart = new Date(startOfWeek.setDate(diff))
          return `Minggu ${weekStart.toISOString().split('T')[0]}`
        }
        case 'yearly': {
          return `${date.getFullYear()}`
        }
        case 'monthly':
        default: {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        }
      }
    }

    // Process incomes
    for (const income of incomes) {
      const key = formatKey(new Date(income.date))
      if (!groupedData[key]) {
        groupedData[key] = { income: 0, expense: 0, items: [] }
      }
      groupedData[key].income += income.amount
      groupedData[key].items.push({
        ...income,
        type: 'income',
      })
    }

    // Process expenses
    for (const expense of expenses) {
      const key = formatKey(new Date(expense.date))
      if (!groupedData[key]) {
        groupedData[key] = { income: 0, expense: 0, items: [] }
      }
      groupedData[key].expense += expense.amount
      groupedData[key].items.push({
        ...expense,
        type: 'expense',
      })
    }

    // Income by category
    const incomeByCategory: Record<string, number> = {}
    for (const income of incomes) {
      const catName = income.category.name
      incomeByCategory[catName] = (incomeByCategory[catName] || 0) + income.amount
    }

    // Expense by category
    const expenseByCategory: Record<string, number> = {}
    for (const expense of expenses) {
      const catName = expense.category.name
      expenseByCategory[catName] = (expenseByCategory[catName] || 0) + expense.amount
    }

    return NextResponse.json({
      period: {
        type,
        dateFrom: startDate.toISOString(),
        dateTo: endDate.toISOString(),
      },
      summary: {
        totalIncome,
        totalExpense,
        saldo,
        incomeCount: incomes.length,
        expenseCount: expenses.length,
      },
      groupedData,
      incomeByCategory,
      expenseByCategory,
      incomes,
      expenses,
    })
  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menggenerate laporan' },
      { status: 500 }
    )
  }
}
