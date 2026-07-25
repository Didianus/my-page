'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingDown,
  Calendar,
  Receipt,
  Plus,
  Search,
  X,
  Eye,
  Pencil,
  Trash2,
  ArrowUpCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { formatCurrency, formatDate } from '@/lib/constants'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExpenseCategory {
  id: string
  name: string
  description?: string | null
}

interface ExpenseRecord {
  id: string
  transactionNumber: string
  date: string
  categoryId: string
  category: ExpenseCategory
  amount: number
  description?: string | null
  recipient?: string | null
  proofUrl?: string | null
  createdBy: string
  createdUser: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface ExpenseListResponse {
  expenses: ExpenseRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface CategoriesResponse {
  incomeCategories: ExpenseCategory[]
  expenseCategories: ExpenseCategory[]
}

interface ExpenseFormData {
  date: string
  categoryId: string
  amount: string
  description: string
  recipient: string
}

// ─── Category color mapping ──────────────────────────────────────────────────

const categoryColorMap: Record<string, string> = {
  'Konsumsi': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Operasional': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Kegiatan': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Peralatan': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'Transportasi': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Listrik': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
  'Internet': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Lainnya': 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400',
}

function getCategoryColor(name: string): string {
  return categoryColorMap[name] || 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400'
}

// ─── Animation variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

// ─── Stat Card Component ────────────────────────────────────────────────────

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

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function ExpensePageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters skeleton */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Expense Page Component ─────────────────────────────────────────────

export function ExpensePage() {
  const { user } = useAppStore()
  const userRole = user?.role || 'anggota'
  const canModify = userRole === 'admin' || userRole === 'bendahara'
  const canDelete = userRole === 'admin'

  // Data state
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Summary state
  const [totalExpenseAll, setTotalExpenseAll] = useState(0)
  const [totalExpenseMonth, setTotalExpenseMonth] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)

  // Pagination state
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  // Filter state
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    categoryId: '',
  })

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<ExpenseFormData>({
    date: '',
    categoryId: '',
    amount: '',
    description: '',
    recipient: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({})

  // ─── Fetch expenses ──────────────────────────────────────────────────────

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (appliedFilters.search) params.set('search', appliedFilters.search)
      if (appliedFilters.dateFrom) params.set('dateFrom', appliedFilters.dateFrom)
      if (appliedFilters.dateTo) params.set('dateTo', appliedFilters.dateTo)
      if (appliedFilters.categoryId) params.set('categoryId', appliedFilters.categoryId)

      const result = await api.get<ExpenseListResponse>(`/expense?${params.toString()}`)
      setExpenses(result.expenses)
      setTotal(result.pagination.total)
      setTotalPages(result.pagination.totalPages)
      setTotalTransactions(result.pagination.total)

      // For summary, fetch all expenses (without filters) to calculate overall totals
      const allParams = new URLSearchParams()
      allParams.set('limit', '10000')

      const allResult = await api.get<ExpenseListResponse>(`/expense?${allParams.toString()}`)
      const allTotal = allResult.expenses.reduce((sum, e) => sum + e.amount, 0)
      setTotalExpenseAll(allTotal)

      // Calculate this month's total
      const now = new Date()
      const thisMonth = allResult.expenses.filter((e) => {
        const d = new Date(e.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      setTotalExpenseMonth(thisMonth.reduce((sum, e) => sum + e.amount, 0))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data pengeluaran')
    } finally {
      setLoading(false)
    }
  }, [page, appliedFilters])

  // ─── Fetch categories ────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    try {
      const result = await api.get<CategoriesResponse>('/categories')
      setCategories(result.expenseCategories)
    } catch {
      // Silently fail - categories are not critical for initial render
    }
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // ─── Apply filters ───────────────────────────────────────────────────────

  const applyFilters = () => {
    setAppliedFilters({ search, dateFrom, dateTo, categoryId: categoryId === 'all' ? '' : categoryId })
    setPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setCategoryId('all')
    setAppliedFilters({ search: '', dateFrom: '', dateTo: '', categoryId: '' })
    setPage(1)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters()
  }

  // ─── Form helpers ────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormData({ date: '', categoryId: '', amount: '', description: '', recipient: '' })
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ExpenseFormData, string>> = {}
    if (!formData.date) errors.date = 'Tanggal wajib diisi'
    if (!formData.categoryId) errors.categoryId = 'Kategori wajib dipilih'
    if (!formData.amount) errors.amount = 'Nominal wajib diisi'
    else if (Number(formData.amount) <= 0) errors.amount = 'Nominal harus lebih dari 0'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ─── Add expense ─────────────────────────────────────────────────────────

  const handleAdd = () => {
    resetForm()
    setAddDialogOpen(true)
  }

  const submitAdd = async () => {
    if (!validateForm()) return
    setSubmitting(true)
    try {
      await api.post('/expense', {
        date: formData.date,
        categoryId: formData.categoryId,
        amount: Number(formData.amount),
        description: formData.description || undefined,
        recipient: formData.recipient || undefined,
      })
      toast.success('Pengeluaran berhasil ditambahkan')
      setAddDialogOpen(false)
      resetForm()
      fetchExpenses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan pengeluaran')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Edit expense ────────────────────────────────────────────────────────

  const handleEdit = (expense: ExpenseRecord) => {
    setSelectedExpense(expense)
    setFormData({
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      categoryId: expense.categoryId,
      amount: String(expense.amount),
      description: expense.description || '',
      recipient: expense.recipient || '',
    })
    setFormErrors({})
    setEditDialogOpen(true)
  }

  const submitEdit = async () => {
    if (!selectedExpense) return
    if (!validateForm()) return
    setSubmitting(true)
    try {
      await api.put(`/expense/${selectedExpense.id}`, {
        date: formData.date,
        categoryId: formData.categoryId,
        amount: Number(formData.amount),
        description: formData.description || undefined,
        recipient: formData.recipient || undefined,
      })
      toast.success('Pengeluaran berhasil diperbarui')
      setEditDialogOpen(false)
      resetForm()
      setSelectedExpense(null)
      fetchExpenses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui pengeluaran')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── View expense ────────────────────────────────────────────────────────

  const handleView = (expense: ExpenseRecord) => {
    setSelectedExpense(expense)
    setViewDialogOpen(true)
  }

  // ─── Delete expense ──────────────────────────────────────────────────────

  const handleDeleteClick = (expense: ExpenseRecord) => {
    setSelectedExpense(expense)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedExpense) return
    setDeleting(true)
    try {
      await api.delete(`/expense/${selectedExpense.id}`)
      toast.success('Pengeluaran berhasil dihapus')
      setDeleteDialogOpen(false)
      setSelectedExpense(null)
      fetchExpenses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus pengeluaran')
    } finally {
      setDeleting(false)
    }
  }

  // ─── Pagination helpers ──────────────────────────────────────────────────

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  // ─── Initial loading state ───────────────────────────────────────────────

  if (loading && expenses.length === 0 && !error) {
    return <ExpensePageSkeleton />
  }

  // ─── Error state ─────────────────────────────────────────────────────────

  if (error && expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground text-center">{error}</p>
        <Button onClick={fetchExpenses} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5 bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20">
            <ArrowUpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kas Keluar</h1>
            <p className="text-muted-foreground mt-0.5">Kelola pengeluaran kas kelompok</p>
          </div>
        </div>
        {canModify && (
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25 gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Kas Keluar
          </Button>
        )}
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingDown}
          label="Total Pengeluaran"
          value={formatCurrency(totalExpenseAll)}
          colorClass="text-orange-700 dark:text-orange-400"
          gradientFrom="from-orange-50"
          gradientTo="to-orange-100/50"
          iconBg="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
        />
        <StatCard
          icon={Calendar}
          label="Pengeluaran Bulan Ini"
          value={formatCurrency(totalExpenseMonth)}
          colorClass="text-red-700 dark:text-red-400"
          gradientFrom="from-red-50"
          gradientTo="to-red-100/50"
          iconBg="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
        />
        <StatCard
          icon={Receipt}
          label="Jumlah Transaksi"
          value={String(totalTransactions)}
          colorClass="text-amber-700 dark:text-amber-400"
          gradientFrom="from-amber-50"
          gradientTo="to-amber-100/50"
          iconBg="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
        />
      </div>

      {/* Filters Bar */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor transaksi, keterangan, penerima..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full sm:w-36"
                  placeholder="Dari tanggal"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full sm:w-36"
                  placeholder="Sampai tanggal"
                />
              </div>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={applyFilters} variant="outline" className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20">
                  <Search className="h-4 w-4" />
                  <span className="sm:hidden">Cari</span>
                </Button>
                <Button onClick={resetFilters} variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                  <span className="sm:hidden">Reset</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expense Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 text-center">No</TableHead>
                    <TableHead>No. Transaksi</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead>Penerima Dana</TableHead>
                    <TableHead className="hidden md:table-cell">Keterangan</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-4">
                            <ArrowUpCircle className="h-8 w-8 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">Belum ada data pengeluaran</p>
                            <p className="text-muted-foreground/70 text-sm mt-1">
                              {canModify
                                ? 'Klik "Tambah Kas Keluar" untuk menambahkan pengeluaran baru'
                                : 'Data pengeluaran akan muncul di sini'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence>
                      {expenses.map((expense, index) => (
                        <motion.tr
                          key={expense.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <TableCell className="text-center text-muted-foreground text-sm">
                            {(page - 1) * limit + index + 1}
                          </TableCell>
                          <TableCell className="font-mono text-sm font-medium">
                            {expense.transactionNumber}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(expense.date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getCategoryColor(expense.category.name)}`}
                            >
                              {expense.category.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              -{formatCurrency(expense.amount)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {expense.recipient || '-'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                            {expense.description || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleView(expense)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Lihat</span>
                              </Button>
                              {canModify && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                                  onClick={() => handleEdit(expense)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleDeleteClick(expense)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Hapus</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {(page - 1) * limit + 1}-{Math.min(page * limit, total)} dari {total} data
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Halaman sebelumnya</span>
                  </Button>
                  {getPageNumbers().map((p, i) =>
                    typeof p === 'string' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? 'default' : 'outline'}
                        size="icon"
                        className={`size-8 ${
                          page === p
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0'
                            : ''
                        }`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Halaman berikutnya</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Add Expense Dialog ──────────────────────────────────────────── */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setAddDialogOpen(open) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-500 p-1.5">
                <Plus className="h-4 w-4 text-white" />
              </div>
              Tambah Kas Keluar
            </DialogTitle>
            <DialogDescription>
              Tambahkan pengeluaran kas baru ke sistem
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-date">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={formErrors.date ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-category">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
              >
                <SelectTrigger id="add-category" className={formErrors.categoryId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.categoryId && <p className="text-xs text-red-500">{formErrors.categoryId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-amount">
                Nominal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-amount"
                type="number"
                placeholder="Masukkan nominal pengeluaran"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={formErrors.amount ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}
              {formData.amount && Number(formData.amount) > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(Number(formData.amount))}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-recipient">Penerima Dana</Label>
              <Input
                id="add-recipient"
                type="text"
                placeholder="Nama penerima dana (opsional)"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-description">Keterangan</Label>
              <Textarea
                id="add-description"
                placeholder="Keterangan pengeluaran (opsional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setAddDialogOpen(false); resetForm() }}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={submitAdd}
              disabled={submitting}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Expense Dialog ─────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { resetForm(); setSelectedExpense(null) }; setEditDialogOpen(open) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-500 p-1.5">
                <Pencil className="h-4 w-4 text-white" />
              </div>
              Edit Kas Keluar
            </DialogTitle>
            <DialogDescription>
              Perbarui data pengeluaran kas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={formErrors.date ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
              >
                <SelectTrigger id="edit-category" className={formErrors.categoryId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.categoryId && <p className="text-xs text-red-500">{formErrors.categoryId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">
                Nominal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="Masukkan nominal pengeluaran"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={formErrors.amount ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}
              {formData.amount && Number(formData.amount) > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(Number(formData.amount))}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-recipient">Penerima Dana</Label>
              <Input
                id="edit-recipient"
                type="text"
                placeholder="Nama penerima dana (opsional)"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Keterangan</Label>
              <Textarea
                id="edit-description"
                placeholder="Keterangan pengeluaran (opsional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setEditDialogOpen(false); resetForm(); setSelectedExpense(null) }}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={submitEdit}
              disabled={submitting}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Perbarui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── View Detail Dialog ──────────────────────────────────────────── */}
      <Dialog open={viewDialogOpen} onOpenChange={(open) => { if (!open) setSelectedExpense(null); setViewDialogOpen(open) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-500 p-1.5">
                <Eye className="h-4 w-4 text-white" />
              </div>
              Detail Kas Keluar
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap pengeluaran
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4 py-4">
              {/* Transaction Number */}
              <div className="rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 space-y-1">
                <p className="text-xs text-muted-foreground">No. Transaksi</p>
                <p className="text-lg font-bold font-mono text-orange-700 dark:text-orange-400">
                  {selectedExpense.transactionNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs">Tanggal</span>
                  </div>
                  <p className="text-sm font-medium">{formatDate(selectedExpense.date)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5" />
                    <span className="text-xs">Nominal</span>
                  </div>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">
                    -{formatCurrency(selectedExpense.amount)}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="text-xs">Kategori</span>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getCategoryColor(selectedExpense.category.name)}`}
                >
                  {selectedExpense.category.name}
                </Badge>
              </div>

              {selectedExpense.recipient && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span className="text-xs">Penerima Dana</span>
                  </div>
                  <p className="text-sm font-medium">{selectedExpense.recipient}</p>
                </div>
              )}

              {selectedExpense.description && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Keterangan</p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{selectedExpense.description}</p>
                </div>
              )}

              <div className="border-t pt-4 space-y-1">
                <p className="text-xs text-muted-foreground">Dibuat oleh</p>
                <p className="text-sm font-medium">{selectedExpense.createdUser.name}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setViewDialogOpen(false); setSelectedExpense(null) }}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) setSelectedExpense(null); setDeleteDialogOpen(open) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-1.5">
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              Hapus Pengeluaran
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedExpense && (
                <>
                  Apakah Anda yakin ingin menghapus pengeluaran{' '}
                  <span className="font-semibold text-foreground">
                    {selectedExpense.transactionNumber}
                  </span>{' '}
                  sebesar{' '}
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(selectedExpense.amount)}
                  </span>?
                  <br />
                  <span className="text-destructive font-medium">Tindakan ini tidak dapat dibatalkan.</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
