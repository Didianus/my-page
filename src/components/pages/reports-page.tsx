'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileDown,
  Table as TableIcon,
  Printer,
  RefreshCw,
  AlertCircle,
  CalendarDays,
  Search,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { formatCurrency, formatDate } from '@/lib/constants'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────

interface ReportPeriod {
  type: string
  dateFrom: string
  dateTo: string
}

interface ReportSummary {
  totalIncome: number
  totalExpense: number
  saldo: number
  incomeCount: number
  expenseCount: number
}

interface GroupedItem {
  id: string
  date: string
  transactionNumber: string
  amount: number
  description: string | null
  type: 'income' | 'expense'
  category: { id: string; name: string; type: string }
  member?: { id: string; name: string; memberNumber: string } | null
  createdUser?: { id: string; name: string } | null
  recipient?: string | null
}

interface GroupedData {
  income: number
  expense: number
  items: GroupedItem[]
}

interface ReportData {
  period: ReportPeriod
  summary: ReportSummary
  groupedData: Record<string, GroupedData>
  incomeByCategory: Record<string, number>
  expenseByCategory: Record<string, number>
  incomes: GroupedItem[]
  expenses: GroupedItem[]
}

type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly'

interface CombinedTransaction {
  id: string
  date: string
  transactionNumber: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string | null
  memberName?: string | null
  recipient?: string | null
}

// ─── Chart Config ─────────────────────────────────────────────────────

const chartConfig = {
  income: {
    label: 'Pemasukan',
    color: 'oklch(0.7 0.17 162)',
  },
  expense: {
    label: 'Pengeluaran',
    color: 'oklch(0.65 0.2 25)',
  },
} satisfies ChartConfig

// ─── Animation Variants ──────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getDateStr(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getFirstDayOfMonth(): string {
  const now = new Date()
  return getDateStr(new Date(now.getFullYear(), now.getMonth(), 1))
}

function getLastDayOfMonth(): string {
  const now = new Date()
  return getDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0))
}

function getFirstDayOfYear(): string {
  const now = new Date()
  return getDateStr(new Date(now.getFullYear(), 0, 1))
}

function getLastDayOfYear(): string {
  const now = new Date()
  return getDateStr(new Date(now.getFullYear(), 11, 31))
}

function getThreeMonthsAgo(): string {
  const now = new Date()
  return getDateStr(new Date(now.getFullYear(), now.getMonth() - 2, 1))
}

function formatGroupLabel(key: string, reportType: ReportType): string {
  switch (reportType) {
    case 'daily': {
      const parts = key.split('-')
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
      }
      return key
    }
    case 'weekly':
      return key.replace('Minggu ', '').split('-').reverse().join('/')
    case 'yearly':
      return key
    case 'monthly':
    default: {
      const [year, month] = key.split('-')
      const d = new Date(Number(year), Number(month) - 1, 1)
      return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    }
  }
}

// ─── Custom Tooltip ──────────────────────────────────────────────────

function CurrencyTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="border-border/50 bg-background grid min-w-[10rem] items-start gap-1.5 rounded-lg border px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.name === 'income' ? 'Pemasukan' : 'Pengeluaran'}:
          </span>
          <span className="text-foreground font-mono font-medium tabular-nums">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Stat Card Component ─────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  gradientFrom,
  gradientTo,
  iconBg,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  colorClass: string
  gradientFrom: string
  gradientTo: string
  iconBg: string
}) {
  return (
    <motion.div variants={itemVariants}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="h-full"
      >
        <Card className="relative overflow-hidden h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-50`} />
          <div className="absolute inset-0 backdrop-blur-sm bg-white/40 dark:bg-black/10" />
          <CardHeader className="relative z-10 pb-2">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${iconBg} shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
              <CardDescription className="text-sm font-medium">
                {label}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-0">
            <p className={`text-2xl font-bold tracking-tight ${colorClass}`}>
              {value}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ─── Loading Skeleton ────────────────────────────────────────────────

function ReportsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Filter card skeleton */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-md" />
            ))}
          </div>
          <div className="flex gap-3 items-end">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-7 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart skeleton */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Reports Page Component ─────────────────────────────────────

export function ReportsPage() {
  const { user, token } = useAppStore()
  const userRole = user?.role || ''

  // Filter state
  const [reportType, setReportType] = useState<ReportType>('monthly')
  const [dateFrom, setDateFrom] = useState(getFirstDayOfMonth())
  const [dateTo, setDateTo] = useState(getLastDayOfMonth())

  // Data state
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  // Export state
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)

  const canExport = userRole === 'admin' || userRole === 'bendahara'

  // Fetch report data
  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.get<ReportData>(
        `/reports?type=${reportType}&dateFrom=${dateFrom}&dateTo=${dateTo}`
      )
      setReportData(result)
      setHasFetched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data laporan')
    } finally {
      setLoading(false)
    }
  }, [reportType, dateFrom, dateTo])

  // Fetch on mount (default current month)
  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  // Quick date buttons
  const handleQuickDate = (preset: 'thisMonth' | 'last3Months' | 'thisYear') => {
    switch (preset) {
      case 'thisMonth':
        setDateFrom(getFirstDayOfMonth())
        setDateTo(getLastDayOfMonth())
        break
      case 'last3Months':
        setDateFrom(getThreeMonthsAgo())
        setDateTo(getLastDayOfMonth())
        break
      case 'thisYear':
        setDateFrom(getFirstDayOfYear())
        setDateTo(getLastDayOfYear())
        break
    }
  }

  // Chart data from groupedData
  const chartData = useMemo(() => {
    if (!reportData?.groupedData) return []
    return Object.entries(reportData.groupedData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => ({
        period: formatGroupLabel(key, reportType),
        income: data.income,
        expense: data.expense,
      }))
  }, [reportData, reportType])

  // Combined transactions sorted by date
  const combinedTransactions = useMemo((): CombinedTransaction[] => {
    if (!reportData) return []

    const incomes: CombinedTransaction[] = (reportData.incomes || []).map((inc) => ({
      id: inc.id,
      date: inc.date,
      transactionNumber: inc.transactionNumber,
      type: 'income' as const,
      category: inc.category?.name || '-',
      amount: inc.amount,
      description: inc.description,
      memberName: inc.member?.name,
    }))

    const expenses: CombinedTransaction[] = (reportData.expenses || []).map((exp) => ({
      id: exp.id,
      date: exp.date,
      transactionNumber: exp.transactionNumber,
      type: 'expense' as const,
      category: exp.category?.name || '-',
      amount: exp.amount,
      description: exp.description,
      recipient: exp.recipient,
    }))

    return [...incomes, ...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [reportData])

  // Export PDF
  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      const res = await fetch(
        `/api/reports/export?type=pdf&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Gagal mengekspor PDF' }))
        throw new Error(errData.error || 'Gagal mengekspor PDF')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-keuangan-${dateFrom}-${dateTo}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('PDF berhasil diunduh')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengekspor PDF')
    } finally {
      setExportingPdf(false)
    }
  }

  // Export Excel
  const handleExportExcel = async () => {
    setExportingExcel(true)
    try {
      const res = await fetch(
        `/api/reports/export?type=excel&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Gagal mengekspor Excel' }))
        throw new Error(errData.error || 'Gagal mengekspor Excel')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-keuangan-${dateFrom}-${dateTo}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Excel berhasil diunduh')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengekspor Excel')
    } finally {
      setExportingExcel(false)
    }
  }

  // Print
  const handlePrint = () => {
    window.print()
  }

  // Loading state (first load)
  if (loading && !hasFetched) {
    return <ReportsPageSkeleton />
  }

  // Error state (first load)
  if (error && !reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground text-center">{error}</p>
        <Button onClick={fetchReport} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  const totalIncome = reportData?.summary?.totalIncome || 0
  const totalExpense = reportData?.summary?.totalExpense || 0
  const saldo = reportData?.summary?.saldo || 0

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Header ─────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2 shadow-md">
              <FileText className="h-5 w-5 text-white" />
            </div>
            Laporan Keuangan
          </h1>
          <p className="text-muted-foreground mt-1">
            Pantau dan analisis arus kas keuangan organisasi Anda
          </p>
        </div>
        {canExport && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              onClick={handleExportPdf}
              disabled={exportingPdf || loading}
            >
              {exportingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
              onClick={handleExportExcel}
              disabled={exportingExcel || loading}
            >
              {exportingExcel ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TableIcon className="h-4 w-4" />
              )}
              Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handlePrint}
              disabled={loading}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        )}
      </motion.div>

      {/* ─── Filter Card ────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-4 md:p-6 space-y-4">
            {/* Report type tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground shrink-0">Tipe Laporan:</span>
              <Tabs value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                  <TabsTrigger value="daily" className="text-xs sm:text-sm">Harian</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs sm:text-sm">Mingguan</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs sm:text-sm">Bulanan</TabsTrigger>
                  <TabsTrigger value="yearly" className="text-xs sm:text-sm">Tahunan</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Date range */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Dari</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Sampai</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <Button
                onClick={fetchReport}
                disabled={loading}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shrink-0 gap-1.5"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Tampilkan
              </Button>
            </div>

            {/* Quick date buttons */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Cepat:</span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleQuickDate('thisMonth')}
              >
                <CalendarDays className="h-3 w-3 mr-1" />
                Bulan Ini
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleQuickDate('last3Months')}
              >
                <CalendarDays className="h-3 w-3 mr-1" />
                3 Bulan Terakhir
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleQuickDate('thisYear')}
              >
                <CalendarDays className="h-3 w-3 mr-1" />
                Tahun Ini
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Summary Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Pemasukan"
          value={formatCurrency(totalIncome)}
          colorClass="text-green-700 dark:text-green-400"
          gradientFrom="from-green-50"
          gradientTo="to-green-100/50"
          iconBg="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
        />
        <StatCard
          icon={TrendingDown}
          label="Total Pengeluaran"
          value={formatCurrency(totalExpense)}
          colorClass="text-orange-700 dark:text-orange-400"
          gradientFrom="from-orange-50"
          gradientTo="to-orange-100/50"
          iconBg="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
        />
        <StatCard
          icon={Wallet}
          label="Saldo Akhir"
          value={formatCurrency(saldo)}
          colorClass={
            saldo >= 0
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-700 dark:text-red-400'
          }
          gradientFrom={saldo >= 0 ? 'from-emerald-50' : 'from-red-50'}
          gradientTo={saldo >= 0 ? 'to-emerald-100/50' : 'to-red-100/50'}
          iconBg={
            saldo >= 0
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
              : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
          }
        />
      </div>

      {/* ─── Chart Section ──────────────────────────────── */}
      {chartData.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Grafik Pemasukan & Pengeluaran
              </CardTitle>
              <CardDescription>
                Periode: {formatDate(dateFrom)} — {formatDate(dateTo)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64 w-full aspect-auto">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    tickFormatter={(value: number) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
                      return String(value)
                    }}
                  />
                  <ChartTooltip content={<CurrencyTooltip />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="income"
                    fill="var(--color-income)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="expense"
                    fill="var(--color-expense)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── Transaction Table ───────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-500" />
              Detail Transaksi
            </CardTitle>
            <CardDescription>
              {combinedTransactions.length > 0
                ? `${combinedTransactions.length} transaksi dalam periode ini`
                : 'Tidak ada transaksi dalam periode ini'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {combinedTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                  Tidak ada transaksi ditemukan
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Ubah filter periode untuk melihat data transaksi
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="hidden sm:table-cell">No. Transaksi</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead className="hidden md:table-cell">Kategori</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                      <TableHead className="hidden lg:table-cell">Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinedTransactions.map((tx, idx) => (
                      <TableRow key={`${tx.type}-${tx.id}`}>
                        <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(tx.date)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                            {tx.transactionNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          {tx.type === 'income' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 gap-1">
                              <ArrowDownLeft className="h-3 w-3" />
                              Masuk
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100 gap-1">
                              <ArrowUpRight className="h-3 w-3" />
                              Keluar
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {tx.category}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold text-sm ${
                              tx.type === 'income'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                          {tx.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell colSpan={5} className="text-right">
                        Total Pemasukan
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(totalIncome)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell" />
                    </TableRow>
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell colSpan={5} className="text-right">
                        Total Pengeluaran
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        -{formatCurrency(totalExpense)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell" />
                    </TableRow>
                    <TableRow className="bg-muted/80 font-bold">
                      <TableCell colSpan={5} className="text-right">
                        Saldo Akhir
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          saldo >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {formatCurrency(saldo)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell" />
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Mobile Export Buttons (sticky bottom) ────────── */}
      {canExport && (
        <motion.div variants={itemVariants} className="print:hidden">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Export Laporan</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 w-full"
                  onClick={handleExportPdf}
                  disabled={exportingPdf || loading}
                >
                  {exportingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">PDF</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/20 w-full"
                  onClick={handleExportExcel}
                  disabled={exportingExcel || loading}
                >
                  {exportingExcel ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TableIcon className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Excel</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 w-full"
                  onClick={handlePrint}
                  disabled={loading}
                >
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
