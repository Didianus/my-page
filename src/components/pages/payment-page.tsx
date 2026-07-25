'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  ArrowDownCircle,
  Search,
  RefreshCw,
  AlertCircle,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  Phone,
  QrCode,
  ShieldCheck,
  Loader2,
  Check,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { formatCurrency, formatDate } from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────

interface EWallet {
  id: string
  type: string
  name: string
  number: string
  holderName: string
  qrUrl?: string | null
  isActive: boolean
}

interface Payment {
  id: string
  paymentNumber: string
  userId: string
  ewalletId: string
  amount: number
  description?: string | null
  status: 'pending' | 'verified' | 'rejected'
  proofUrl?: string | null
  verifiedBy?: string | null
  verifiedAt?: string | null
  incomeId?: string | null
  createdAt: string
  user: { id: string; name: string; email: string }
  ewallet: { id: string; type: string; name: string; number: string; holderName: string }
  verifiedUser?: { id: string; name: string } | null
}

interface PaymentListResponse {
  payments: Payment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface EWalletListResponse {
  ewallets: EWallet[]
}

// ─── E-Wallet Color Map ───────────────────────────────────────────

const ewalletColors: Record<string, { bg: string; text: string; border: string }> = {
  dana: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700' },
  ovo: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-700' },
  gopay: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-600 dark:text-green-400', border: 'border-green-300 dark:border-green-700' },
  shopeepay: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700' },
  qris: { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-300 dark:border-rose-700' },
  bank: { bg: 'bg-slate-100 dark:bg-slate-900/40', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-300 dark:border-slate-700' },
}

function getEwalletColor(type: string) {
  return ewalletColors[type] || ewalletColors.bank
}

function getEwalletLabel(type: string): string {
  const labels: Record<string, string> = {
    dana: 'DANA',
    ovo: 'OVO',
    gopay: 'GoPay',
    shopeepay: 'ShopeePay',
    qris: 'QRIS',
    bank: 'Bank Transfer',
  }
  return labels[type] || type
}

// ─── Status badge helpers ─────────────────────────────────────────

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 gap-1">
          <Clock className="h-3 w-3" />
          Menunggu
        </Badge>
      )
    case 'verified':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Diverifikasi
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 gap-1">
          <XCircle className="h-3 w-3" />
          Ditolak
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

// ─── Animation Variants ───────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

// ─── Quick Amount Options ─────────────────────────────────────────

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000]

// ─── Loading Skeleton ─────────────────────────────────────────────

export function PaymentPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />

        {/* E-Wallet cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form skeleton */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function PaymentPage() {
  const { user } = useAppStore()
  const userRole = user?.role || 'anggota'
  const isAdminOrBendahara = userRole === 'admin' || userRole === 'bendahara'

  // Data state
  const [ewallets, setEwallets] = useState<EWallet[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentsLoading, setPaymentsLoading] = useState(false)

  // Pagination state
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  // Payment form state
  const [selectedEwallet, setSelectedEwallet] = useState<EWallet | null>(null)
  const [formAmount, setFormAmount] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Instruction dialog state
  const [instructionOpen, setInstructionOpen] = useState(false)
  const [createdPayment, setCreatedPayment] = useState<Payment | null>(null)

  // Verify/reject dialog state
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [verifyAction, setVerifyAction] = useState<'verify' | 'reject'>('verify')
  const [verifyPayment, setVerifyPayment] = useState<Payment | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [verifying, setVerifying] = useState(false)

  // Filter state for admin payments
  const [filterStatus, setFilterStatus] = useState('all')

  // Active tab
  const [activeTab, setActiveTab] = useState('pay')

  // ─── Fetch E-Wallets ──────────────────────────────────────────────

  const fetchEwallets = useCallback(async () => {
    try {
      const result = await api.get<EWalletListResponse>('/ewallets')
      setEwallets(result.ewallets.filter((ew) => ew.isActive))
    } catch {
      // Silently fail
    }
  }, [])

  // ─── Fetch Payments ───────────────────────────────────────────────

  const fetchPayments = useCallback(async (pageNum = 1) => {
    setPaymentsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(pageNum))
      params.set('limit', String(limit))
      if (isAdminOrBendahara && filterStatus !== 'all') {
        params.set('status', filterStatus)
      }

      const endpoint = isAdminOrBendahara ? '/payments' : '/payments'
      const result = await api.get<PaymentListResponse>(`${endpoint}?${params.toString()}`)
      setPayments(result.payments)
      setTotal(result.pagination.total)
      setTotalPages(result.pagination.totalPages)
      setPage(pageNum)
    } catch (err) {
      toast.error('Gagal memuat riwayat pembayaran', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      })
    } finally {
      setPaymentsLoading(false)
    }
  }, [isAdminOrBendahara, filterStatus])

  // ─── Initial Load ─────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        await fetchEwallets()
      } catch {
        setError('Gagal memuat data e-wallet')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [fetchEwallets])

  useEffect(() => {
    fetchPayments(1)
  }, [fetchPayments])

  // ─── Copy to Clipboard ────────────────────────────────────────────

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Nomor berhasil disalin!')
  }

  // ─── Format display amount ────────────────────────────────────────

  const formatDisplayAmount = (value: string) => {
    if (!value) return ''
    const num = parseFloat(value.replace(/[^\d]/g, ''))
    if (isNaN(num)) return ''
    return num.toLocaleString('id-ID')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    setFormAmount(raw)
  }

  const handleQuickAmount = (amount: number) => {
    setFormAmount(String(amount))
  }

  // ─── Create Payment ───────────────────────────────────────────────

  const handleCreatePayment = async () => {
    if (!selectedEwallet) {
      toast.error('Pilih e-wallet terlebih dahulu')
      return
    }
    if (!formAmount || parseFloat(formAmount) <= 0) {
      toast.error('Masukkan nominal yang valid')
      return
    }

    setSubmitting(true)
    try {
      const result = await api.post<{ message: string; payment: Payment }>('/payments', {
        ewalletId: selectedEwallet.id,
        amount: parseFloat(formAmount),
        description: formDescription || null,
      })
      toast.success('Pembayaran berhasil dibuat')
      setCreatedPayment(result.payment)
      setInstructionOpen(true)
      // Reset form
      setFormAmount('')
      setFormDescription('')
      // Refresh payments list
      fetchPayments(1)
    } catch (err) {
      toast.error('Gagal membuat pembayaran', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Verify/Reject Payment ────────────────────────────────────────

  const openVerifyDialog = (payment: Payment, action: 'verify' | 'reject') => {
    setVerifyPayment(payment)
    setVerifyAction(action)
    setRejectNote('')
    setVerifyDialogOpen(true)
  }

  const handleVerify = async () => {
    if (!verifyPayment) return
    setVerifying(true)
    try {
      await api.put(`/payments/${verifyPayment.id}/verify`, {
        action: verifyAction,
        ...(verifyAction === 'reject' && rejectNote ? { note: rejectNote } : {}),
      })
      toast.success(
        verifyAction === 'verify'
          ? 'Pembayaran berhasil diverifikasi'
          : 'Pembayaran berhasil ditolak'
      )
      setVerifyDialogOpen(false)
      setVerifyPayment(null)
      fetchPayments(page)
    } catch (err) {
      toast.error(
        verifyAction === 'verify'
          ? 'Gagal memverifikasi pembayaran'
          : 'Gagal menolak pembayaran',
        {
          description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        }
      )
    } finally {
      setVerifying(false)
    }
  }

  // ─── Pagination Helpers ───────────────────────────────────────────

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    fetchPayments(newPage)
  }

  // ─── Initial loading state ────────────────────────────────────────

  if (loading) {
    return <PaymentPageSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground text-center">{error}</p>
        <Button onClick={() => fetchEwallets()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Header ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pembayaran Iuran</h1>
            <p className="text-muted-foreground mt-0.5">Bayar iuran bulanan melalui e-wallet</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Tabs ────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pay" className="gap-2">
              <Wallet className="h-4 w-4" />
              Bayar Iuran
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              Riwayat Pembayaran
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Bayar Iuran ──────────────────────────────── */}
          <TabsContent value="pay" className="space-y-6 mt-6">
            {/* E-Wallet Selection */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-violet-500" />
                    Pilih E-Wallet
                  </CardTitle>
                  <CardDescription>
                    Pilih metode pembayaran e-wallet yang tersedia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ewallets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-muted p-4 mb-4">
                        <Wallet className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">Belum ada e-wallet tersedia</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ewallets.map((ew) => {
                        const colors = getEwalletColor(ew.type)
                        const isSelected = selectedEwallet?.id === ew.id
                        return (
                          <motion.div
                            key={ew.id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            <Card
                              className={`cursor-pointer transition-all duration-200 border-0 shadow-sm hover:shadow-md ${
                                isSelected
                                  ? `ring-2 ring-violet-500 ${colors.border} shadow-md`
                                  : 'hover:ring-1 hover:ring-violet-300 dark:hover:ring-violet-700'
                              }`}
                              onClick={() => setSelectedEwallet(ew)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={`rounded-xl p-2.5 ${colors.bg} ${colors.text} shadow-sm shrink-0`}>
                                    {ew.type === 'qris' ? (
                                      <QrCode className="h-5 w-5" />
                                    ) : (
                                      <span className="text-sm font-bold leading-none">
                                        {getEwalletLabel(ew.type).charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="font-semibold text-sm">{getEwalletLabel(ew.type)}</p>
                                      {isSelected && (
                                        <Check className="h-4 w-4 text-violet-500 shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground font-mono mt-0.5 truncate">
                                      {ew.number}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      a.n. {ew.holderName}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-end mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      copyToClipboard(ew.number)
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                    Salin
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Form */}
            {selectedEwallet && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-fuchsia-500" />
                      Form Pembayaran
                    </CardTitle>
                    <CardDescription>
                      Isi nominal dan keterangan pembayaran
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Selected e-wallet display */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">E-Wallet Dipilih</Label>
                      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
                        {(() => {
                          const colors = getEwalletColor(selectedEwallet.type)
                          return (
                            <>
                              <div className={`rounded-lg p-2 ${colors.bg} ${colors.text}`}>
                                {selectedEwallet.type === 'qris' ? (
                                  <QrCode className="h-4 w-4" />
                                ) : (
                                  <span className="text-xs font-bold leading-none">
                                    {getEwalletLabel(selectedEwallet.type).charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{getEwalletLabel(selectedEwallet.type)}</p>
                                <p className="text-xs text-muted-foreground font-mono">{selectedEwallet.number} a.n. {selectedEwallet.holderName}</p>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Amount input */}
                    <div className="space-y-2">
                      <Label htmlFor="payment-amount" className="text-sm font-medium">
                        Nominal <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
                        <Input
                          id="payment-amount"
                          type="text"
                          inputMode="numeric"
                          placeholder="Masukkan nominal"
                          value={formAmount ? formatDisplayAmount(formAmount) : ''}
                          onChange={handleAmountChange}
                          className="pl-10"
                        />
                      </div>
                      {formAmount && parseFloat(formAmount) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(parseFloat(formAmount))}
                        </p>
                      )}

                      {/* Quick amount buttons */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {QUICK_AMOUNTS.map((amount) => (
                          <Button
                            key={amount}
                            variant={formAmount === String(amount) ? 'default' : 'outline'}
                            size="sm"
                            className={`h-8 text-xs ${
                              formAmount === String(amount)
                                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0'
                                : 'border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-900/20'
                            }`}
                            onClick={() => handleQuickAmount(amount)}
                          >
                            Rp {amount.toLocaleString('id-ID')}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Description input */}
                    <div className="space-y-2">
                      <Label htmlFor="payment-description" className="text-sm font-medium">
                        Keterangan <span className="text-muted-foreground text-xs">(opsional)</span>
                      </Label>
                      <Input
                        id="payment-description"
                        type="text"
                        placeholder="Iuran bulan Maret 2025"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                      />
                    </div>

                    {/* Submit button */}
                    <Button
                      onClick={handleCreatePayment}
                      disabled={submitting || !formAmount || parseFloat(formAmount) <= 0}
                      className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 gap-2 h-11"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Bayar Sekarang
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* ─── Tab 2: Riwayat Pembayaran ────────────────────────── */}
          <TabsContent value="history" className="space-y-4 mt-6">
            {/* Filter for admin/bendahara */}
            {isAdminOrBendahara && (
              <motion.div variants={itemVariants}>
                <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="relative flex-1 min-w-[200px]">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="pl-9 h-9 w-full sm:w-48">
                            <SelectValue placeholder="Filter Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="pending">Menunggu</SelectItem>
                            <SelectItem value="verified">Diverifikasi</SelectItem>
                            <SelectItem value="rejected">Ditolak</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2"
                        onClick={() => fetchPayments(page)}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Payments Table */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowDownCircle className="h-5 w-5 text-violet-500" />
                    {isAdminOrBendahara ? 'Daftar Pembayaran' : 'Riwayat Pembayaran Saya'}
                  </CardTitle>
                  <CardDescription>
                    {paymentsLoading
                      ? 'Memuat data...'
                      : `Menampilkan ${payments.length} dari ${total} pembayaran`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {payments.length === 0 && !paymentsLoading ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <div className="rounded-full bg-violet-50 dark:bg-violet-900/20 p-6 mb-4">
                        <CreditCard className="h-12 w-12 text-violet-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">Belum Ada Pembayaran</h3>
                      <p className="text-muted-foreground text-sm max-w-sm">
                        {filterStatus !== 'all'
                          ? 'Tidak ada pembayaran dengan status ini. Coba ubah filter.'
                          : 'Mulai bayar iuran melalui tab "Bayar Iuran" di atas.'
                        }
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="hidden md:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="w-12 text-center">No</TableHead>
                              <TableHead>No. Pembayaran</TableHead>
                              {isAdminOrBendahara && <TableHead>Nama Anggota</TableHead>}
                              <TableHead>E-Wallet</TableHead>
                              <TableHead className="text-right">Nominal</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Status</TableHead>
                              {isAdminOrBendahara && <TableHead className="text-center">Aksi</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paymentsLoading ? (
                              Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                  <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                  {isAdminOrBendahara && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                  {isAdminOrBendahara && <TableCell><Skeleton className="h-8 w-32 mx-auto" /></TableCell>}
                                </TableRow>
                              ))
                            ) : (
                              <AnimatePresence>
                                {payments.map((payment, idx) => (
                                  <motion.tr
                                    key={payment.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                  >
                                    <TableCell className="text-center text-muted-foreground text-sm">
                                      {(page - 1) * limit + idx + 1}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs font-medium">
                                      {payment.paymentNumber}
                                    </TableCell>
                                    {isAdminOrBendahara && (
                                      <TableCell className="text-sm">
                                        {payment.user.name}
                                      </TableCell>
                                    )}
                                    <TableCell>
                                      <Badge
                                        variant="secondary"
                                        className={`text-xs ${getEwalletColor(payment.ewallet.type).bg} ${getEwalletColor(payment.ewallet.type).text}`}
                                      >
                                        {getEwalletLabel(payment.ewallet.type)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-violet-600 dark:text-violet-400">
                                      {formatCurrency(payment.amount)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      {formatDate(payment.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                      {getStatusBadge(payment.status)}
                                    </TableCell>
                                    {isAdminOrBendahara && (
                                      <TableCell>
                                        {payment.status === 'pending' ? (
                                          <div className="flex items-center justify-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                              onClick={() => openVerifyDialog(payment, 'verify')}
                                            >
                                              <CheckCircle2 className="h-3.5 w-3.5" />
                                              Verifikasi
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                              onClick={() => openVerifyDialog(payment, 'reject')}
                                            >
                                              <XCircle className="h-3.5 w-3.5" />
                                              Tolak
                                            </Button>
                                          </div>
                                        ) : (
                                          <div className="text-center">
                                            {payment.verifiedUser && (
                                              <span className="text-xs text-muted-foreground">
                                                oleh {payment.verifiedUser.name}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </TableCell>
                                    )}
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile card view */}
                      <div className="md:hidden space-y-3 p-4">
                        {paymentsLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-xl border bg-white/80 dark:bg-gray-900/80 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-20" />
                              </div>
                              <Skeleton className="h-4 w-36" />
                              <Skeleton className="h-5 w-28" />
                            </div>
                          ))
                        ) : (
                          payments.map((payment, idx) => (
                            <motion.div
                              key={payment.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="rounded-xl border bg-white/80 dark:bg-gray-900/80 p-4 space-y-3 shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-medium text-muted-foreground">
                                  {payment.paymentNumber}
                                </span>
                                {getStatusBadge(payment.status)}
                              </div>

                              {isAdminOrBendahara && (
                                <p className="text-sm font-medium">{payment.user.name}</p>
                              )}

                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${getEwalletColor(payment.ewallet.type).bg} ${getEwalletColor(payment.ewallet.type).text}`}
                                >
                                  {getEwalletLabel(payment.ewallet.type)}
                                </Badge>
                                <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                                  {formatCurrency(payment.amount)}
                                </p>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                {formatDate(payment.createdAt)}
                              </p>

                              {isAdminOrBendahara && payment.status === 'pending' && (
                                <div className="flex items-center gap-2 pt-2 border-t">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-xs gap-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                                    onClick={() => openVerifyDialog(payment, 'verify')}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Verifikasi
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                    onClick={() => openVerifyDialog(payment, 'reject')}
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Tolak
                                  </Button>
                                </div>
                              )}
                            </motion.div>
                          ))
                        )}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                          <p className="text-sm text-muted-foreground">
                            Halaman {page} dari {totalPages} ({total} data)
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1"
                              disabled={page <= 1}
                              onClick={() => goToPage(page - 1)}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Sebelumnya
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1"
                              disabled={page >= totalPages}
                              onClick={() => goToPage(page + 1)}
                            >
                              Selanjutnya
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ─── Payment Instructions Dialog ─────────────────────────── */}
      <Dialog open={instructionOpen} onOpenChange={setInstructionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 p-1.5">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              Instruksi Pembayaran
            </DialogTitle>
            <DialogDescription>
              Silakan lakukan transfer sesuai petunjuk berikut
            </DialogDescription>
          </DialogHeader>

          {createdPayment && (
            <div className="space-y-4 py-2">
              {/* Payment amount */}
              <div className="rounded-lg bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
                <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                  {formatCurrency(createdPayment.amount)}
                </p>
              </div>

              {/* E-wallet info */}
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-3">
                  {(() => {
                    const colors = getEwalletColor(createdPayment.ewallet.type)
                    return (
                      <div className={`rounded-lg p-2 ${colors.bg} ${colors.text}`}>
                        {createdPayment.ewallet.type === 'qris' ? (
                          <QrCode className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-bold leading-none">
                            {getEwalletLabel(createdPayment.ewallet.type).charAt(0)}
                          </span>
                        )}
                      </div>
                    )
                  })()}
                  <div>
                    <p className="font-semibold text-sm">{getEwalletLabel(createdPayment.ewallet.type)}</p>
                    <p className="text-sm font-mono text-muted-foreground">{createdPayment.ewallet.number}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-auto"
                    onClick={() => copyToClipboard(createdPayment.ewallet.number)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-violet-100 dark:bg-violet-900/30 p-1.5 mt-0.5">
                    <ArrowDownCircle className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-sm">
                    Silakan transfer ke nomor{' '}
                    <span className="font-semibold font-mono">{createdPayment.ewallet.number}</span>{' '}
                    atas nama{' '}
                    <span className="font-semibold">{createdPayment.ewallet.holderName}</span>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-1.5 mt-0.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Setelah melakukan transfer, pembayaran Anda akan diverifikasi oleh admin/bendahara
                  </p>
                </div>
              </div>

              {/* Payment number */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <span>No. Pembayaran:</span>
                <span className="font-mono font-medium">{createdPayment.paymentNumber}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setInstructionOpen(false)}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white gap-2"
            >
              <Check className="h-4 w-4" />
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Verify/Reject Confirmation Dialog ───────────────────── */}
      <Dialog open={verifyDialogOpen} onOpenChange={(open) => { if (!open && !verifying) setVerifyDialogOpen(false) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verifyAction === 'verify' ? (
                <>
                  <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  Verifikasi Pembayaran
                </>
              ) : (
                <>
                  <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-1.5">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  Tolak Pembayaran
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'verify'
                ? 'Apakah Anda yakin ingin memverifikasi pembayaran ini?'
                : 'Apakah Anda yakin ingin menolak pembayaran ini?'
              }
            </DialogDescription>
          </DialogHeader>

          {verifyPayment && (
            <div className="space-y-4 py-2">
              {/* Payment details */}
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">No. Pembayaran</span>
                  <span className="font-mono text-sm font-medium">{verifyPayment.paymentNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Anggota</span>
                  <span className="text-sm font-medium">{verifyPayment.user.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">E-Wallet</span>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getEwalletColor(verifyPayment.ewallet.type).bg} ${getEwalletColor(verifyPayment.ewallet.type).text}`}
                  >
                    {getEwalletLabel(verifyPayment.ewallet.type)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nominal</span>
                  <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                    {formatCurrency(verifyPayment.amount)}
                  </span>
                </div>
                {verifyPayment.description && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Keterangan</span>
                    <span className="text-sm">{verifyPayment.description}</span>
                  </div>
                )}
              </div>

              {/* Reject note */}
              {verifyAction === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="reject-note" className="text-sm font-medium">
                    Alasan Penolakan <span className="text-muted-foreground text-xs">(opsional)</span>
                  </Label>
                  <Input
                    id="reject-note"
                    type="text"
                    placeholder="Masukkan alasan penolakan"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setVerifyDialogOpen(false)}
              disabled={verifying}
            >
              Batal
            </Button>
            {verifyAction === 'verify' ? (
              <Button
                onClick={handleVerify}
                disabled={verifying}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white gap-2"
              >
                {verifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Verifikasi
              </Button>
            ) : (
              <Button
                onClick={handleVerify}
                disabled={verifying}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white gap-2"
              >
                {verifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Tolak
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
