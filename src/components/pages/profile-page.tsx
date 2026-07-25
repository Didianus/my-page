'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Camera,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { formatDate, getRoleLabel, getRoleBadgeColor } from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────

interface MemberData {
  id: string
  memberNumber: string
  position?: string | null
  joinDate: string
  status: string
}

interface ProfileData {
  id: string
  name: string
  email: string
  role: string
  phone?: string | null
  address?: string | null
  gender?: string | null
  avatar?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  member?: MemberData | null
}

interface ProfileResponse {
  profile: ProfileData
}

interface UpdateProfileResponse {
  message: string
  profile: ProfileData
}

interface ChangePasswordResponse {
  message: string
}

// ─── Animation Variants ───────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

// ─── Loading Skeleton ─────────────────────────────────────────────

function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function ProfilePage() {
  const { user, token, setUser } = useAppStore()

  // Profile data
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit form state
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formGender, setFormGender] = useState('')
  const [saving, setSaving] = useState(false)

  // Password form state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  // ─── Fetch Profile ────────────────────────────────────────────────

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.get<ProfileResponse>('/profile')
      setProfile(result.profile)
      // Populate form
      setFormName(result.profile.name)
      setFormPhone(result.profile.phone || '')
      setFormAddress(result.profile.address || '')
      setFormGender(result.profile.gender || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data profil')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // ─── Handle Save Profile ──────────────────────────────────────────

  const handleSaveProfile = async () => {
    if (!formName.trim()) {
      toast.error('Nama tidak boleh kosong')
      return
    }

    setSaving(true)
    try {
      const result = await api.put<UpdateProfileResponse>('/profile', {
        name: formName.trim(),
        phone: formPhone.trim() || undefined,
        address: formAddress.trim() || undefined,
        gender: formGender || undefined,
      })

      setProfile(result.profile)
      toast.success('Profil berhasil diperbarui')

      // Update Zustand store with new user data (preserve existing token)
      if (user) {
        setUser(
          {
            userId: user.userId,
            email: result.profile.email,
            name: result.profile.name,
            role: result.profile.role,
            avatar: result.profile.avatar,
          },
          token
        )
      }
    } catch (err) {
      toast.error('Gagal memperbarui profil', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      })
    } finally {
      setSaving(false)
    }
  }

  // ─── Handle Change Password ───────────────────────────────────────

  const handleChangePassword = async () => {
    const errors: Record<string, string> = {}

    if (!oldPassword) errors.oldPassword = 'Password lama wajib diisi'
    if (!newPassword) errors.newPassword = 'Password baru wajib diisi'
    else if (newPassword.length < 6) errors.newPassword = 'Password baru minimal 6 karakter'
    if (!confirmPassword) errors.confirmPassword = 'Konfirmasi password wajib diisi'
    else if (newPassword !== confirmPassword) errors.confirmPassword = 'Konfirmasi password tidak cocok'

    setPasswordErrors(errors)
    if (Object.keys(errors).length > 0) return

    setChangingPassword(true)
    try {
      await api.put<ChangePasswordResponse>('/profile/password', {
        oldPassword,
        newPassword,
        confirmPassword,
      })

      toast.success('Password berhasil diubah')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordErrors({})
    } catch (err) {
      toast.error('Gagal mengubah password', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  // ─── Get Initials ─────────────────────────────────────────────────

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // ─── Render Loading ───────────────────────────────────────────────

  if (loading && !profile) {
    return <ProfilePageSkeleton />
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground text-center">{error}</p>
        <Button onClick={fetchProfile} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  const displayName = profile?.name || user?.name || 'User'
  const displayEmail = profile?.email || user?.email || ''
  const displayRole = profile?.role || user?.role || ''

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Header ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <User className="h-7 w-7 text-emerald-500" />
          Profil Saya
        </h1>
        <p className="text-muted-foreground mt-1">
          Kelola informasi profil dan keamanan akun Anda
        </p>
      </motion.div>

      {/* ─── Profile Card ────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <motion.div whileHover={{ scale: 1.005 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Card className="relative overflow-hidden border-0 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/10 opacity-60" />
            <div className="absolute inset-0 backdrop-blur-sm bg-white/40 dark:bg-black/10" />
            <CardContent className="relative z-10 p-6 md:p-8">
              <div className="flex flex-col items-center text-center gap-4">
                {/* Avatar */}
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Name & Info */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">{displayName}</h2>
                  <p className="text-muted-foreground flex items-center justify-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {displayEmail}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getRoleBadgeColor(displayRole)}`}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleLabel(displayRole)}
                  </Badge>
                </div>

                {/* Member info */}
                {profile?.member && (
                  <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full">
                      <User className="h-3.5 w-3.5" />
                      No. {profile.member.memberNumber}
                    </span>
                    {profile.member.joinDate && (
                      <span className="flex items-center gap-1.5 bg-white/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Bergabung {formatDate(profile.member.joinDate)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ─── Forms Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Edit Profile Card ────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-emerald-500" />
                Edit Profil
              </CardTitle>
              <CardDescription>
                Perbarui informasi pribadi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <Label htmlFor="profile-name" className="text-sm font-medium">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="profile-name"
                    placeholder="Masukkan nama lengkap"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="profile-email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="profile-email"
                    value={displayEmail}
                    readOnly
                    className="pl-9 bg-muted/50 cursor-not-allowed text-muted-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
              </div>

              {/* Nomor HP */}
              <div className="space-y-2">
                <Label htmlFor="profile-phone" className="text-sm font-medium">
                  Nomor HP
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="profile-phone"
                    placeholder="Masukkan nomor HP"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Alamat */}
              <div className="space-y-2">
                <Label htmlFor="profile-address" className="text-sm font-medium">
                  Alamat
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="profile-address"
                    placeholder="Masukkan alamat lengkap"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="pl-9 min-h-[80px] resize-none"
                  />
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Jenis Kelamin</Label>
                <Select value={formGender} onValueChange={setFormGender}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 gap-2 mt-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Change Password Card ─────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-amber-500" />
                Ubah Password
              </CardTitle>
              <CardDescription>
                Perbarui kata sandi akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Old Password */}
              <div className="space-y-2">
                <Label htmlFor="old-password" className="text-sm font-medium">
                  Kata Sandi Lama <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="old-password"
                    type={showOldPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi lama"
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value)
                      if (passwordErrors.oldPassword) {
                        setPasswordErrors((prev) => {
                          const next = { ...prev }
                          delete next.oldPassword
                          return next
                        })
                      }
                    }}
                    className={`pl-9 pr-10 ${passwordErrors.oldPassword ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.oldPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.oldPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium">
                  Kata Sandi Baru <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (passwordErrors.newPassword) {
                        setPasswordErrors((prev) => {
                          const next = { ...prev }
                          delete next.newPassword
                          return next
                        })
                      }
                    }}
                    className={`pl-9 pr-10 ${passwordErrors.newPassword ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Konfirmasi Kata Sandi Baru <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors((prev) => {
                          const next = { ...prev }
                          delete next.confirmPassword
                          return next
                        })
                      }
                    }}
                    className={`pl-9 pr-10 ${passwordErrors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 p-3">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-400 mb-1.5">
                  Persyaratan kata sandi:
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-400/80 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    Minimal 6 karakter
                  </li>
                  <li className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${confirmPassword && newPassword === confirmPassword ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    Konfirmasi kata sandi cocok
                  </li>
                </ul>
              </div>

              {/* Change Password Button */}
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 gap-2 mt-2"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengubah Password...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Ubah Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Account Info Card ────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-emerald-500" />
              Informasi Akun
            </CardTitle>
            <CardDescription>
              Detail akun Anda (hanya baca)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role */}
              <div className="flex items-center gap-3 rounded-xl bg-white/80 dark:bg-gray-800/60 p-4 border border-emerald-100 dark:border-emerald-900/30">
                <div className="rounded-lg p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Jabatan</p>
                  <Badge
                    variant="secondary"
                    className={`text-xs mt-0.5 ${getRoleBadgeColor(displayRole)}`}
                  >
                    {getRoleLabel(displayRole)}
                  </Badge>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 rounded-xl bg-white/80 dark:bg-gray-800/60 p-4 border border-emerald-100 dark:border-emerald-900/30">
                <div className={`rounded-lg p-2 ${profile?.isActive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-900/40 dark:text-gray-400'}`}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    variant="secondary"
                    className={`text-xs mt-0.5 ${profile?.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}
                  >
                    {profile?.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              </div>

              {/* Terdaftar Sejak */}
              <div className="flex items-center gap-3 rounded-xl bg-white/80 dark:bg-gray-800/60 p-4 border border-emerald-100 dark:border-emerald-900/30">
                <div className="rounded-lg p-2 bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Terdaftar Sejak</p>
                  <p className="text-sm font-medium mt-0.5">
                    {profile?.createdAt ? formatDate(profile.createdAt) : '-'}
                  </p>
                </div>
              </div>

              {/* Terakhir Diperbarui */}
              <div className="flex items-center gap-3 rounded-xl bg-white/80 dark:bg-gray-800/60 p-4 border border-emerald-100 dark:border-emerald-900/30">
                <div className="rounded-lg p-2 bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Terakhir Diperbarui</p>
                  <p className="text-sm font-medium mt-0.5">
                    {profile?.updatedAt ? formatDate(profile.updatedAt) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
