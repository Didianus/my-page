"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { LoginPage } from "@/components/login-page"
import { AppShell } from "@/components/app-shell"
import { Loader2 } from "lucide-react"

export function AuthGuard() {
  const { isAuthenticated, token, setUser, logout } = useAppStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      if (token && isAuthenticated) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const data = await res.json()
            setUser(data.user, token)
          } else {
            logout()
          }
        } catch {
          // Network error - keep existing state for offline resilience
        }
      }
      setChecking(false)
    }
    checkAuth()
  }, [token, isAuthenticated, setUser, logout])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-emerald-500" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <AppShell />
}
