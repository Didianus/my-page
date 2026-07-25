'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  User,
  Phone,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { useTheme } from 'next-themes'

const registerSchema = z
  .object({
    name: z.string().min(1, 'Nama lengkap wajib diisi'),
    email: z.email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
    phone: z.string().optional(),
    address: z.string().optional(),
    gender: z.enum(['L', 'P']).optional(),
    role: z.enum(['admin', 'bendahara', 'anggota']).default('anggota'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterPageProps {
  onSwitchToLogin: () => void
}

function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 15,
      duration: Math.random() * 10 + 10,
      opacity: Math.random() * 0.5 + 0.1,
    })), []
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white/40 dark:bg-white/20"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `auth-particle-rise ${p.duration}s ${p.delay}s ease-in infinite`,
          }}
        />
      ))}
    </div>
  )
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'anggota',
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone || undefined,
        address: data.address || undefined,
        gender: data.gender || undefined,
      })

      setSuccess('Registrasi berhasil! Mengalihkan ke halaman login...')

      setTimeout(() => {
        onSwitchToLogin()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat registrasi')
    } finally {
      setLoading(false)
    }
  }

  const fadeInUp = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4 },
  })

  const bgImage = resolvedTheme === 'dark' ? '/images/auth-bg-dark.png' : '/images/auth-bg-light.png'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image with Overlay */}
      {mounted && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-teal-800/60 to-cyan-900/70 dark:from-gray-950/80 dark:via-emerald-950/70 dark:to-gray-950/80" />
        </div>
      )}

      {/* Animated Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="auth-bg-float-2 auth-bg-morph absolute -top-24 -left-24 w-80 h-80 opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(16,185,129,0.3) 40%, transparent 70%)",
          }}
        />
        <div
          className="auth-bg-float-1 auth-bg-morph absolute -bottom-20 -right-20 w-72 h-72 opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.5) 0%, rgba(20,184,166,0.2) 40%, transparent 70%)",
          }}
        />
        <div
          className="auth-bg-float-3 absolute top-1/3 right-1/4 w-48 h-48 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(52,211,153,0.5) 0%, transparent 60%)",
          }}
        />
        <div
          className="auth-bg-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 50%)",
          }}
        />
        {/* Spinning rings */}
        <div className="auth-bg-spin absolute -top-24 -right-24 w-56 h-56 opacity-10">
          <div className="w-full h-full rounded-full border-4 border-dashed border-teal-400/50" />
        </div>
        <div className="auth-bg-spin-reverse absolute -bottom-20 -left-20 w-64 h-64 opacity-10">
          <div className="w-full h-full rounded-full border-4 border-dashed border-emerald-400/50" />
        </div>
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Shimmer Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="auth-shimmer-line absolute top-[25%] left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
        <div className="auth-shimmer-line absolute top-[55%] left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400/15 to-transparent" style={{ animationDelay: '2s' }} />
        <div className="auth-shimmer-line absolute top-[80%] left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" style={{ animationDelay: '4s' }} />
      </div>

      {/* Register Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key="register"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl text-white border-0 overflow-hidden">
            {/* Card shimmer edges */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
            </div>

            <CardHeader className="text-center pb-2 relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 200 }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                  }}
                >
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Daftar Akun Baru</h1>
                  <p className="text-emerald-200/80 text-sm mt-1">Buat akun untuk mulai mengelola keuangan</p>
                </div>
              </motion.div>
            </CardHeader>

            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                  </motion.div>
                )}

                {/* Nama Lengkap */}
                <motion.div {...fadeInUp(0.25)} className="space-y-2">
                  <Label htmlFor="name" className="text-emerald-100 text-sm font-medium">
                    Nama Lengkap
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300" />
                    <Input
                      id="name"
                      placeholder="Masukkan nama lengkap"
                      {...register('name')}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-300/50 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/30 h-11"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-300 text-xs mt-1">{errors.name.message}</p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div {...fadeInUp(0.3)} className="space-y-2">
                  <Label htmlFor="reg-email" className="text-emerald-100 text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="nama@email.com"
                      {...register('email')}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-300/50 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/30 h-11"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-300 text-xs mt-1">{errors.email.message}</p>
                  )}
                </motion.div>

                {/* Password */}
                <motion.div {...fadeInUp(0.35)} className="space-y-2">
                  <Label htmlFor="reg-password" className="text-emerald-100 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300" />
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimal 6 karakter"
                      {...register('password')}
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-300/50 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/30 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-white transition-colors"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-300 text-xs mt-1">{errors.password.message}</p>
                  )}
                </motion.div>

                {/* Konfirmasi Password */}
                <motion.div {...fadeInUp(0.4)} className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-emerald-100 text-sm font-medium">
                    Konfirmasi Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Ulangi password"
                      {...register('confirmPassword')}
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-300/50 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/30 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-white transition-colors"
                      aria-label={
                        showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-300 text-xs mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </motion.div>

                {/* Nomor HP */}
                <motion.div {...fadeInUp(0.45)} className="space-y-2">
                  <Label htmlFor="phone" className="text-emerald-100 text-sm font-medium">
                    Nomor HP
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300" />
                    <Input
                      id="phone"
                      placeholder="08xxxxxxxxxx"
                      {...register('phone')}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-300/50 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/30 h-11"
                    />
                  </div>
                </motion.div>

                {/* Alamat */}
                <motion.div {...fadeInUp(0.5)} className="space-y-2">
                  <Label htmlFor="address" className="text-emerald-100 text-sm font-medium">
                    Alamat
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-emerald-300" />
                    <Textarea
                      id="address"
                      placeholder="Masukkan alamat lengkap"
                      {...register('address')}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-emerald-300/50 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/30 min-h-[80px]"
                    />
                  </div>
                </motion.div>

                {/* Jenis Kelamin */}
                <motion.div {...fadeInUp(0.55)} className="space-y-2">
                  <Label className="text-emerald-100 text-sm font-medium">Jenis Kelamin</Label>
                  <RadioGroup
                    onValueChange={(val) =>
                      setValue('gender', val as 'L' | 'P')
                    }
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="L"
                        id="male"
                        className="border-white/30 text-emerald-400"
                      />
                      <Label htmlFor="male" className="text-emerald-100 cursor-pointer">
                        Laki-laki
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="P"
                        id="female"
                        className="border-white/30 text-emerald-400"
                      />
                      <Label htmlFor="female" className="text-emerald-100 cursor-pointer">
                        Perempuan
                      </Label>
                    </div>
                  </RadioGroup>
                </motion.div>

                {/* Role */}
                <motion.div {...fadeInUp(0.6)} className="space-y-2">
                  <Label className="text-emerald-100 text-sm font-medium">Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(val) =>
                      setValue('role', val as 'admin' | 'bendahara' | 'anggota')
                    }
                  >
                    <SelectTrigger className="w-full bg-white/10 border-white/20 text-white h-11 focus:ring-emerald-400/30">
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="bendahara">Bendahara</SelectItem>
                      <SelectItem value="anggota">Anggota</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Submit Button */}
                <motion.div {...fadeInUp(0.65)} className="pt-1">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      'Daftar'
                    )}
                  </Button>
                </motion.div>

                {/* Switch to Login */}
                <motion.div
                  {...fadeInUp(0.7)}
                  className="text-center pt-1"
                >
                  <p className="text-emerald-200/70 text-sm">
                    Sudah punya akun?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="text-emerald-300 hover:text-white font-semibold transition-colors underline underline-offset-2"
                    >
                      Masuk di sini
                    </button>
                  </p>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
