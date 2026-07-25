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

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const monthStart = new Date(currentYear, currentMonth, 1)
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)

    // Chart period: 6 months back
    const chartStart = new Date(currentYear, currentMonth - 5, 1)

    // Run all independent queries in parallel (reduced from 20+ to 6)
    const [
      totalIncomeResult,
      totalExpenseResult,
      incomeThisMonthResult,
      expenseThisMonthResult,
      totalMembers,
      recentIncomes,
      recentExpenses,
      // Monthly chart: use groupBy instead of 12 separate aggregate queries
      monthlyIncomes,
      monthlyExpenses,
      // Category stats
      incomeByCategory,
      expenseByCategory,
      incomeCategories,
      expenseCategories,
      // Payment stats
      paidThisMonthRaw,
    ] = await Promise.all([
      // Totals
      db.income.aggregate({ _sum: { amount: true } }),
      db.expense.aggregate({ _sum: { amount: true } }),
      db.income.aggregate({ _sum: { amount: true }, where: { date: { gte: monthStart, lte: monthEnd } } }),
      db.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: monthStart, lte: monthEnd } } }),
      db.member.count({ where: { status: 'aktif' } }),
      // Recent transactions
      db.income.findMany({
        take: 10,
        orderBy: { date: 'desc' },
        include: { category: true, member: { select: { id: true, name: true, memberNumber: true } } },
      }),
      db.expense.findMany({
        take: 10,
        orderBy: { date: 'desc' },
        include: { category: true },
      }),
      // Monthly chart - groupBy is much more efficient than 12 separate queries
      db.income.groupBy({
        by: ['date'],
        _sum: { amount: true },
        where: { date: { gte: chartStart } },
      }),
      db.expense.groupBy({
        by: ['date'],
        _sum: { amount: true },
        where: { date: { gte: chartStart } },
      }),
      // Category stats
      db.income.groupBy({ by: ['categoryId'], _sum: { amount: true }, _count: true }),
      db.expense.groupBy({ by: ['categoryId'], _sum: { amount: true }, _count: true }),
      db.incomeCategory.findMany(),
      db.expenseCategory.findMany(),
      // Payment stats
      db.income.groupBy({
        by: ['memberId'],
        _sum: { amount: true },
        where: {
          categoryId: { in: (await db.incomeCategory.findMany({ where: { name: { contains: 'Iuran' } } })).map(c => c.id) },
          date: { gte: monthStart, lte: monthEnd },
          memberId: { not: null },
        },
      }),
    ])

    const totalIncome = totalIncomeResult._sum.amount || 0
    const totalExpense = totalExpenseResult._sum.amount || 0
    const totalSaldo = totalIncome - totalExpense
    const incomeThisMonth = incomeThisMonthResult._sum.amount || 0
    const expenseThisMonth = expenseThisMonthResult._sum.amount || 0

    // Combine recent transactions
    const recentTransactions = [
      ...recentIncomes.map((i) => ({
        id: i.id,
        transactionNumber: i.transactionNumber,
        date: i.date,
        type: 'income' as const,
        amount: i.amount,
        description: i.description,
        category: i.category.name,
        memberName: i.member?.name || null,
      })),
      ...recentExpenses.map((e) => ({
        id: e.id,
        transactionNumber: e.transactionNumber,
        date: e.date,
        type: 'expense' as const,
        amount: e.amount,
        description: e.description,
        category: e.category.name,
        memberName: null,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

    // Build monthly chart from groupBy results
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const monthlyMap: Record<string, { income: number; expense: number }> = {}
    
    // Initialize all 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1)
      const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth()).padStart(2, '0')}`
      monthlyMap[key] = { income: 0, expense: 0 }
    }

    // Aggregate income by month
    for (const inc of monthlyIncomes) {
      const d = new Date(inc.date)
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
      if (monthlyMap[key]) {
        monthlyMap[key].income += inc._sum.amount || 0
      }
    }

    // Aggregate expense by month
    for (const exp of monthlyExpenses) {
      const d = new Date(exp.date)
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
      if (monthlyMap[key]) {
        monthlyMap[key].expense += exp._sum.amount || 0
      }
    }

    const monthlyChart = Object.entries(monthlyMap).map(([key, val]) => {
      const [yr, mo] = key.split('-').map(Number)
      return {
        month: monthNames[mo],
        year: yr,
        income: val.income,
        expense: val.expense,
      }
    })

    // Category stats
    const incomeStats = incomeByCategory.map((ic) => {
      const cat = incomeCategories.find((c) => c.id === ic.categoryId)
      return {
        categoryId: ic.categoryId,
        categoryName: cat?.name || 'Tidak Diketahui',
        total: ic._sum.amount || 0,
        count: ic._count,
      }
    })

    const expenseStats = expenseByCategory.map((ec) => {
      const cat = expenseCategories.find((c) => c.id === ec.categoryId)
      return {
        categoryId: ec.categoryId,
        categoryName: cat?.name || 'Tidak Diketahui',
        total: ec._sum.amount || 0,
        count: ec._count,
      }
    })

    // Payment stats
    const paidMemberCount = paidThisMonthRaw.filter(p => p.memberId).length
    const unpaidMemberCount = Math.max(0, totalMembers - paidMemberCount)

    return NextResponse.json({
      totalSaldo,
      totalIncome,
      totalExpense,
      totalIncomeMonth: incomeThisMonth,
      totalExpenseMonth: expenseThisMonth,
      totalMembers,
      recentTransactions,
      monthlyChart,
      paymentStats: {
        paid: paidMemberCount,
        unpaid: unpaidMemberCount,
      },
      paymentStatistics: {
        incomeByCategory: incomeStats,
        expenseByCategory: expenseStats,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data dashboard' },
      { status: 500 }
    )
  }
}
