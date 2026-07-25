import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-helper'
import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

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
    const type = searchParams.get('type') || 'pdf' // pdf or excel
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    // Build date filters
    let startDate: Date
    let endDate: Date = new Date()

    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom)
      endDate = new Date(new Date(dateTo).setHours(23, 59, 59, 999))
    } else {
      const now = new Date()
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    }

    // Fetch data
    const incomes = await db.income.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
      include: {
        category: true,
        member: {
          select: { name: true },
        },
      },
    })

    const expenses = await db.expense.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
      include: {
        category: true,
      },
    })

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)
    const saldo = totalIncome - totalExpense

    const periodStr = `${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`

    if (type === 'pdf') {
      // Generate PDF
      const doc = new jsPDF()

      // Title
      doc.setFontSize(18)
      doc.text('Laporan Keuangan', 14, 22)
      doc.setFontSize(10)
      doc.text(`Periode: ${periodStr}`, 14, 30)
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 36)

      // Summary
      doc.setFontSize(14)
      doc.text('Ringkasan', 14, 48)
      doc.setFontSize(10)
      doc.text(`Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}`, 14, 56)
      doc.text(`Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}`, 14, 62)
      doc.text(`Saldo: Rp ${saldo.toLocaleString('id-ID')}`, 14, 68)

      // Income table
      doc.setFontSize(14)
      doc.text('Pemasukan', 14, 82)

      const incomeRows = incomes.map((i) => [
        new Date(i.date).toLocaleDateString('id-ID'),
        i.transactionNumber,
        i.category.name,
        i.member?.name || '-',
        i.description || '-',
        `Rp ${i.amount.toLocaleString('id-ID')}`,
      ])

      autoTable(doc, {
        startY: 86,
        head: [['Tanggal', 'No. Transaksi', 'Kategori', 'Anggota', 'Keterangan', 'Jumlah']],
        body: incomeRows,
        foot: [['', '', '', '', 'Total', `Rp ${totalIncome.toLocaleString('id-ID')}`]],
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94] },
      })

      // Expense table
      const finalY = (doc as unknown as Record<string, number>).lastAutoTable?.finalY || 120
      doc.setFontSize(14)
      doc.text('Pengeluaran', 14, finalY + 14)

      const expenseRows = expenses.map((e) => [
        new Date(e.date).toLocaleDateString('id-ID'),
        e.transactionNumber,
        e.category.name,
        e.recipient || '-',
        e.description || '-',
        `Rp ${e.amount.toLocaleString('id-ID')}`,
      ])

      autoTable(doc, {
        startY: finalY + 18,
        head: [['Tanggal', 'No. Transaksi', 'Kategori', 'Penerima', 'Keterangan', 'Jumlah']],
        body: expenseRows,
        foot: [['', '', '', '', 'Total', `Rp ${totalExpense.toLocaleString('id-ID')}`]],
        styles: { fontSize: 8 },
        headStyles: { fillColor: [239, 68, 68] },
      })

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="laporan-keuangan-${Date.now()}.pdf"`,
        },
      })
    } else if (type === 'excel') {
      // Generate Excel
      const wb = XLSX.utils.book_new()

      // Summary sheet
      const summaryData = [
        ['Laporan Keuangan'],
        [`Periode: ${periodStr}`],
        [],
        ['Ringkasan'],
        ['Total Pemasukan', totalIncome],
        ['Total Pengeluaran', totalExpense],
        ['Saldo', saldo],
        [],
      ]
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan')

      // Income sheet
      const incomeData = [
        ['Tanggal', 'No. Transaksi', 'Kategori', 'Anggota', 'Keterangan', 'Jumlah'],
        ...incomes.map((i) => [
          new Date(i.date).toLocaleDateString('id-ID'),
          i.transactionNumber,
          i.category.name,
          i.member?.name || '-',
          i.description || '-',
          i.amount,
        ]),
        ['', '', '', '', 'Total', totalIncome],
      ]
      const wsIncome = XLSX.utils.aoa_to_sheet(incomeData)
      XLSX.utils.book_append_sheet(wb, wsIncome, 'Pemasukan')

      // Expense sheet
      const expenseData = [
        ['Tanggal', 'No. Transaksi', 'Kategori', 'Penerima', 'Keterangan', 'Jumlah'],
        ...expenses.map((e) => [
          new Date(e.date).toLocaleDateString('id-ID'),
          e.transactionNumber,
          e.category.name,
          e.recipient || '-',
          e.description || '-',
          e.amount,
        ]),
        ['', '', '', '', 'Total', totalExpense],
      ]
      const wsExpense = XLSX.utils.aoa_to_sheet(expenseData)
      XLSX.utils.book_append_sheet(wb, wsExpense, 'Pengeluaran')

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="laporan-keuangan-${Date.now()}.xlsx"`,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Tipe export tidak valid. Gunakan pdf atau excel.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengekspor laporan' },
      { status: 500 }
    )
  }
}
