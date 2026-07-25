"use client"

import { useState, useEffect, useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterPage } from "@/components/register-page"
import { Wallet, Eye, EyeOff, Loader2, ShieldCheck, TrendingUp, Users } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

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

export function LoginPage() {
  const { setUser } = useAppStore()
  const [showRegister, setShowRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (showRegister) {
    return <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await api.post<{ user: { userId: string; email: string; name: string; role: string; avatar?: string | null }; token: string }>("/auth/login", {
        email: form.email,
        password: form.password,
      })

      setUser(data.user, data.token)
      toast.success("Berhasil masuk!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal masuk")
    } finally {
      setLoading(false)
    }
  }

  const bgImage = resolvedTheme === "dark" ? "/images/auth-bg-dark.png" : "/images/auth-bg-light.png"

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image with Overlay */}
      {mounted && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-teal-800/60 to-cyan-900/70 dark:from-gray-950/80 dark:via-emerald-950/70 dark:to-gray-950/80" />
        </div>
      )}

      {/* Animated Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large morphing orb - top right */}
        <div
          className="auth-bg-float-1 auth-bg-morph absolute -top-20 -right-20 w-80 h-80 opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.6) 0%, rgba(20,184,166,0.3) 40%, transparent 70%)",
          }}
        />
        {/* Medium orb - bottom left */}
        <div
          className="auth-bg-float-2 auth-bg-morph absolute -bottom-16 -left-16 w-72 h-72 opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(16,185,129,0.2) 40%, transparent 70%)",
          }}
        />
        {/* Small orb - center top */}
        <div
          className="auth-bg-float-3 absolute top-1/4 left-1/3 w-48 h-48 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(52,211,153,0.5) 0%, transparent 60%)",
          }}
        />
        {/* Pulsing glow - center */}
        <div
          className="auth-bg-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 50%)",
          }}
        />
        {/* Spinning ring - top left */}
        <div className="auth-bg-spin absolute -top-32 -left-32 w-64 h-64 opacity-10">
          <div className="w-full h-full rounded-full border-4 border-dashed border-emerald-400/50" />
        </div>
        {/* Spinning ring reverse - bottom right */}
        <div className="auth-bg-spin-reverse absolute -bottom-24 -right-24 w-56 h-56 opacity-10">
          <div className="w-full h-full rounded-full border-4 border-dashed border-teal-400/50" />
        </div>
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Shimmer Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="auth-shimmer-line absolute top-[30%] left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
        />
        <div
          className="auth-shimmer-line absolute top-[60%] left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400/15 to-transparent"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="auth-shimmer-line absolute top-[80%] left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Login Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="border-white/20 shadow-2xl bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl border-0 overflow-hidden">
            {/* Card shimmer effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
            </div>

            <CardHeader className="space-y-3 text-center pb-2 relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 200 }}
                className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30"
              >
                <Wallet className="size-8 text-white" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <CardTitle className="text-2xl font-bold text-white">
                  KasKu
                </CardTitle>
                <CardDescription className="text-emerald-200/80">
                  Manajemen Keuangan Kelompok
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="pt-4 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-emerald-100">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-emerald-300/50 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/30 h-11"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-emerald-100">Kata Sandi</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      minLength={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-emerald-300/50 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/30 h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-11 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Masuk"
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-emerald-200/70">
                  Belum punya akun?{" "}
                  <button
                    onClick={() => setShowRegister(true)}
                    className="font-semibold text-emerald-300 hover:text-white transition-colors underline underline-offset-2"
                  >
                    Daftar sekarang
                  </button>
                </p>
              </motion.div>

              {/* Feature badges */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="mt-6 flex items-center justify-center gap-4"
              >
                <div className="flex items-center gap-1.5 text-emerald-300/60 text-xs">
                  <ShieldCheck className="size-3.5" />
                  <span>Aman</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300/60 text-xs">
                  <TrendingUp className="size-3.5" />
                  <span>Real-time</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300/60 text-xs">
                  <Users className="size-3.5" />
                  <span>Kolaboratif</span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
