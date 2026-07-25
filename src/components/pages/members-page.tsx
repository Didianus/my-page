'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Shield,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import {
  formatDate,
  getStatusBadgeColor,
  getRoleBadgeColor,
  getRoleLabel,
} from '@/lib/constants'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MemberUser {
  id: string
  role: string
  isActive: boolean
  avatar: string | null
}

interface Member {
  id: string
  memberNumber: string
  name: string
  email: string
  phone: string | null
  address: string | null
  gender: string | null
  position: string | null
  joinDate: string
  status: string
  avatar: string | null
  userId: string
  createdAt: string
  updatedAt: string
  user: MemberUser
}

interface MembersResponse {
  members: Member[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface MemberDetailResponse {
  member: Member & {
    incomes?: Array<{
      id: string
      transactionNumber: string
      date: string
      amount: number
      description: string | null
      category: { id: string; name: string }
    }>
  }
}

interface MemberFormData {
  name: string
  email: string
  password: string
  phone: string
  address: string
  gender: string
  position: string
  role: string
  status: string
}

const emptyForm: MemberFormData = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  gender: '',
  position: '',
  role: 'anggota',
  status: 'aktif',
}

// ─── Animation Variants ─────────────────────────────────────────────────────

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

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'aktif': return 'Aktif'
    case 'nonaktif': return 'Nonaktif'
    default: return status
  }
}

function getGenderLabel(gender: string | null): string {
  switch (gender) {
    case 'L': return 'Laki-laki'
    case 'P': return 'Perempuan'
    default: return '-'
  }
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function MembersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Filters skeleton */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <th key={i} className="h-11 px-4">
                      <Skeleton className="h-4 w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="h-14 px-4">
                        <Skeleton className="h-4 w-full max-w-[100px]" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function MembersPage() {
  const { user } = useAppStore()
  const isAdmin = user?.role === 'admin'

  // Data state
  const [members, setMembers] = useState<Member[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState<MemberFormData>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)

  // Selected member for view/edit/delete
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [viewMember, setViewMember] = useState<MemberDetailResponse['member'] | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  // Debounced search
  const [searchInput, setSearchInput] = useState('')

  // ─── Fetch Members ─────────────────────────────────────────────────────────

  const fetchMembers = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '10')
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'semua') params.set('status', statusFilter)

      const result = await api.get<MembersResponse>(`/members?${params.toString()}`)
      setMembers(result.members)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data anggota')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchMembers(1)
  }, [fetchMembers])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  // ─── Page Change ───────────────────────────────────────────────────────────

  const handlePageChange = (page: number) => {
    fetchMembers(page)
  }

  // ─── View Member ───────────────────────────────────────────────────────────

  const handleViewMember = async (member: Member) => {
    setSelectedMember(member)
    setViewDialogOpen(true)
    setViewLoading(true)
    setViewMember(null)
    try {
      const result = await api.get<MemberDetailResponse>(`/members/${member.id}`)
      setViewMember(result.member)
    } catch {
      toast.error('Gagal memuat detail anggota')
    } finally {
      setViewLoading(false)
    }
  }

  // ─── Add Member ────────────────────────────────────────────────────────────

  const handleOpenAddDialog = () => {
    setFormData(emptyForm)
    setAddDialogOpen(true)
  }

  const handleAddMember = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error('Nama, email, dan password wajib diisi')
      return
    }
    setFormLoading(true)
    try {
      await api.post('/members', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        gender: formData.gender || undefined,
        position: formData.position || undefined,
        status: formData.status || 'aktif',
      })
      toast.success('Anggota berhasil ditambahkan')
      setAddDialogOpen(false)
      setFormData(emptyForm)
      fetchMembers(pagination.page)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan anggota')
    } finally {
      setFormLoading(false)
    }
  }

  // ─── Edit Member ───────────────────────────────────────────────────────────

  const handleOpenEditDialog = (member: Member) => {
    setFormData({
      name: member.name,
      email: member.email,
      password: '',
      phone: member.phone || '',
      address: member.address || '',
      gender: member.gender || '',
      position: member.position || '',
      role: member.user?.role || 'anggota',
      status: member.status,
    })
    setSelectedMember(member)
    setEditDialogOpen(true)
  }

  const handleEditMember = async () => {
    if (!selectedMember) return
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Nama dan email wajib diisi')
      return
    }
    setFormLoading(true)
    try {
      await api.put(`/members/${selectedMember.id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        gender: formData.gender || undefined,
        position: formData.position || undefined,
        status: formData.status,
      })
      toast.success('Data anggota berhasil diperbarui')
      setEditDialogOpen(false)
      setSelectedMember(null)
      setFormData(emptyForm)
      fetchMembers(pagination.page)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui data anggota')
    } finally {
      setFormLoading(false)
    }
  }

  // ─── Delete Member ─────────────────────────────────────────────────────────

  const handleOpenDeleteDialog = (member: Member) => {
    setSelectedMember(member)
    setDeleteDialogOpen(true)
  }

  const handleDeleteMember = async () => {
    if (!selectedMember) return
    setFormLoading(true)
    try {
      await api.delete(`/members/${selectedMember.id}`)
      toast.success('Anggota berhasil dihapus')
      setDeleteDialogOpen(false)
      setSelectedMember(null)
      fetchMembers(pagination.page)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus anggota')
    } finally {
      setFormLoading(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  // Loading state (first load)
  if (loading && members.length === 0 && !error) {
    return <MembersSkeleton />
  }

  // Error state (no data at all)
  if (error && members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground text-center">{error}</p>
        <Button onClick={() => fetchMembers(1)} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  // Pagination helpers
  const { page, totalPages, total } = pagination
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | 'ellipsis')[] = [1]
    if (page > 3) pages.push('ellipsis')
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (page < totalPages - 2) pages.push('ellipsis')
    if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Data Anggota</h1>
          <p className="text-muted-foreground mt-1">
            Kelola data anggota kelompok keuangan
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={handleOpenAddDialog}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Anggota
          </Button>
        )}
      </motion.div>

      {/* ─── Filters Bar ─────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, email, atau no. HP..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val)}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-10">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Members Table ───────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-0">
            {members.length === 0 && !loading ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 mb-4">
                  <Users className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Belum Ada Anggota</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {search || (statusFilter && statusFilter !== 'semua')
                    ? 'Tidak ada anggota yang sesuai dengan filter. Coba ubah filter pencarian.'
                    : 'Belum ada data anggota. Tambahkan anggota pertama untuk memulai.'}
                </p>
                {isAdmin && !search && (!statusFilter || statusFilter === 'semua') && (
                  <Button
                    onClick={handleOpenAddDialog}
                    className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Anggota
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="w-12 text-center">No</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden sm:table-cell">No. HP</TableHead>
                        <TableHead className="hidden lg:table-cell">Jabatan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Tgl Bergabung</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={`skeleton-${i}`}>
                              <TableCell className="text-center"><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Skeleton className="h-8 w-8 rounded-full" />
                                  <Skeleton className="h-4 w-28" />
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-36" /></TableCell>
                              <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                              <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell className="text-center"><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          members.map((member, index) => (
                            <motion.tr
                              key={member.id}
                              variants={rowVariants}
                              initial="hidden"
                              animate="visible"
                              transition={{ delay: index * 0.03, duration: 0.25 }}
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <TableCell className="text-center text-muted-foreground text-sm">
                                {(pagination.page - 1) * pagination.limit + index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 border border-border/50">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-xs font-semibold">
                                      {getInitials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate max-w-[160px]">
                                      {member.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground md:hidden truncate max-w-[160px]">
                                      {member.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                {member.email}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                {member.phone || '-'}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                {member.position || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs px-2 py-0.5 ${getStatusBadgeColor(member.status)}`}
                                >
                                  {getStatusLabel(member.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                {formatDate(member.joinDate || member.createdAt)}
                              </TableCell>
                              <TableCell className="text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Aksi</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem
                                      onClick={() => handleViewMember(member)}
                                      className="gap-2 cursor-pointer"
                                    >
                                      <Eye className="h-4 w-4 text-emerald-500" />
                                      Lihat Detail
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => handleOpenEditDialog(member)}
                                          className="gap-2 cursor-pointer"
                                        >
                                          <Pencil className="h-4 w-4 text-amber-500" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleOpenDeleteDialog(member)}
                                          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Hapus
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* ─── Pagination ────────────────────────────────────────── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      Menampilkan {Math.min((page - 1) * 10 + 1, total)}–{Math.min(page * 10, total)} dari {total} anggota
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={page <= 1}
                        onClick={() => handlePageChange(page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {getPageNumbers().map((p, i) =>
                        p === 'ellipsis' ? (
                          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                            ...
                          </span>
                        ) : (
                          <Button
                            key={p}
                            variant={p === page ? 'default' : 'outline'}
                            size="icon"
                            className={`h-8 w-8 ${
                              p === page
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                : ''
                            }`}
                            onClick={() => handlePageChange(p)}
                          >
                            {p}
                          </Button>
                        )
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={page >= totalPages}
                        onClick={() => handlePageChange(page + 1)}
                      >
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

      {/* ─── Add Member Dialog ───────────────────────────────────────────── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-1.5">
                <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Tambah Anggota Baru
            </DialogTitle>
            <DialogDescription>
              Isi data berikut untuk menambahkan anggota baru ke sistem
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="add-name">Nama Lengkap <span className="text-destructive">*</span></Label>
              <Input
                id="add-name"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="add-email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="add-email"
                type="email"
                placeholder="contoh@email.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="add-password">Password <span className="text-destructive">*</span></Label>
              <Input
                id="add-password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="add-phone">Nomor HP</Label>
              <Input
                id="add-phone"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="add-address">Alamat</Label>
              <Textarea
                id="add-address"
                placeholder="Masukkan alamat lengkap"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            {/* Gender */}
            <div className="grid gap-2">
              <Label>Jenis Kelamin</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="L" id="add-gender-l" />
                  <Label htmlFor="add-gender-l" className="font-normal cursor-pointer">Laki-laki</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="P" id="add-gender-p" />
                  <Label htmlFor="add-gender-p" className="font-normal cursor-pointer">Perempuan</Label>
                </div>
              </RadioGroup>
            </div>
            {/* Position */}
            <div className="grid gap-2">
              <Label htmlFor="add-position">Jabatan</Label>
              <Input
                id="add-position"
                placeholder="Contoh: Ketua, Sekretaris"
                value={formData.position}
                onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
              />
            </div>
            {/* Role */}
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, role: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="bendahara">Bendahara</SelectItem>
                  <SelectItem value="anggota">Anggota</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Status */}
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={formLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={formLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2"
            >
              {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Tambah Anggota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Member Dialog ──────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-1.5">
                <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Edit Data Anggota
            </DialogTitle>
            <DialogDescription>
              Perbarui informasi anggota{selectedMember ? `: ${selectedMember.name}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nama Lengkap <span className="text-destructive">*</span></Label>
              <Input
                id="edit-name"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="contoh@email.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Nomor HP</Label>
              <Input
                id="edit-phone"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Alamat</Label>
              <Textarea
                id="edit-address"
                placeholder="Masukkan alamat lengkap"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            {/* Gender */}
            <div className="grid gap-2">
              <Label>Jenis Kelamin</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="L" id="edit-gender-l" />
                  <Label htmlFor="edit-gender-l" className="font-normal cursor-pointer">Laki-laki</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="P" id="edit-gender-p" />
                  <Label htmlFor="edit-gender-p" className="font-normal cursor-pointer">Perempuan</Label>
                </div>
              </RadioGroup>
            </div>
            {/* Position */}
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Jabatan</Label>
              <Input
                id="edit-position"
                placeholder="Contoh: Ketua, Sekretaris"
                value={formData.position}
                onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
              />
            </div>
            {/* Status */}
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={formLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleEditMember}
              disabled={formLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2"
            >
              {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── View Member Detail Dialog ───────────────────────────────────── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-1.5">
                <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Detail Anggota
            </DialogTitle>
          </DialogHeader>
          {viewLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : viewMember ? (
            <div className="space-y-6">
              {/* Avatar + Name Header */}
              <div className="flex flex-col items-center text-center gap-3 pb-4 border-b">
                <Avatar className="h-20 w-20 border-2 border-emerald-200 dark:border-emerald-800">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xl font-bold">
                    {getInitials(viewMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{viewMember.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewMember.memberNumber}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getStatusBadgeColor(viewMember.status)}`}
                    >
                      {getStatusLabel(viewMember.status)}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getRoleBadgeColor(viewMember.user?.role || 'anggota')}`}
                    >
                      {getRoleLabel(viewMember.user?.role || 'anggota')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2 shrink-0">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium break-all">{viewMember.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2 shrink-0">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nomor HP</p>
                    <p className="text-sm font-medium">{viewMember.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2 shrink-0">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Alamat</p>
                    <p className="text-sm font-medium">{viewMember.address || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Jenis Kelamin</p>
                      <p className="text-sm font-medium">{getGenderLabel(viewMember.gender)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Jabatan</p>
                      <p className="text-sm font-medium">{viewMember.position || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <p className="text-sm font-medium">{getRoleLabel(viewMember.user?.role || 'anggota')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tgl Bergabung</p>
                      <p className="text-sm font-medium">{formatDate(viewMember.joinDate || viewMember.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ──────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-destructive/10 p-1.5">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              Hapus Anggota
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus anggota{' '}
              <span className="font-semibold text-foreground">{selectedMember?.name}</span>?
              Tindakan ini tidak dapat dibatalkan dan semua data terkait anggota ini akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={formLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
