'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  AlertCircle,
  CheckCheck,
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────

type NotificationType = 'info' | 'success' | 'warning' | 'error'

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  updatedAt: string
}

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface MarkReadResponse {
  message: string
  notification: Notification
}

// ─── Notification type config ─────────────────────────────────────

const notificationConfig: Record<NotificationType, {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  dotColor: string
  borderColor: string
}> = {
  info: {
    icon: Info,
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconColor: 'text-sky-600 dark:text-sky-400',
    dotColor: 'bg-sky-500',
    borderColor: 'border-l-sky-500',
  },
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-l-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    dotColor: 'bg-amber-500',
    borderColor: 'border-l-amber-500',
  },
  error: {
    icon: XCircle,
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
    dotColor: 'bg-red-500',
    borderColor: 'border-l-red-500',
  },
}

// ─── Relative Time ────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSeconds < 60) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`
  if (diffWeeks < 4) return `${diffWeeks} minggu lalu`
  if (diffMonths < 12) return `${diffMonths} bulan lalu`

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
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

const listItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: 12,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

// ─── Loading Skeleton ─────────────────────────────────────────────

function NotificationsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  // ─── Fetch Notifications ──────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.get<NotificationsResponse>('/notifications?limit=50')
      setNotifications(result.notifications)
      setUnreadCount(result.unreadCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat notifikasi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // ─── Mark Single as Read ──────────────────────────────────────────

  const markAsRead = async (id: string) => {
    const notification = notifications.find((n) => n.id === id)
    if (!notification || notification.isRead) return

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    try {
      await api.put<MarkReadResponse>(`/notifications/${id}`, { isRead: true })
    } catch (err) {
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      )
      setUnreadCount((prev) => prev + 1)
      toast.error('Gagal menandai notifikasi', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      })
    }
  }

  // ─── Mark All as Read ─────────────────────────────────────────────

  const markAllAsRead = async () => {
    if (unreadCount === 0) return

    setMarkingAll(true)
    const previousNotifications = [...notifications]
    const previousUnreadCount = unreadCount

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)

    try {
      // Mark each unread notification
      const unreadIds = previousNotifications.filter((n) => !n.isRead).map((n) => n.id)
      await Promise.all(
        unreadIds.map((id) =>
          api.put<MarkReadResponse>(`/notifications/${id}`, { isRead: true })
        )
      )
      toast.success('Semua notifikasi ditandai sebagai dibaca')
    } catch (err) {
      // Revert on error
      setNotifications(previousNotifications)
      setUnreadCount(previousUnreadCount)
      toast.error('Gagal menandai semua notifikasi', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      })
    } finally {
      setMarkingAll(false)
    }
  }

  // ─── Render Loading ───────────────────────────────────────────────

  if (loading && notifications.length === 0 && !error) {
    return <NotificationsPageSkeleton />
  }

  if (error && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground text-center">{error}</p>
        <Button onClick={fetchNotifications} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Header ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-7 w-7 text-emerald-500" />
            Notifikasi
            {unreadCount > 0 && (
              <Badge className="bg-emerald-500 text-white text-xs ml-1 px-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Pemberitahuan dan pesan untuk Anda
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            disabled={markingAll}
            variant="outline"
            className="gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            {markingAll ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Tandai Semua Dibaca
          </Button>
        )}
      </motion.div>

      {/* ─── Notification List ───────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-500" />
              Daftar Notifikasi
            </CardTitle>
            <CardDescription>
              {notifications.length > 0
                ? `${notifications.length} notifikasi${unreadCount > 0 ? ` · ${unreadCount} belum dibaca` : ''}`
                : 'Tidak ada notifikasi'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 p-6 mb-4">
                  <Bell className="h-12 w-12 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Tidak ada notifikasi</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Belum ada pemberitahuan untuk Anda. Notifikasi baru akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {notifications.map((notification, idx) => {
                    const config = notificationConfig[notification.type] || notificationConfig.info
                    const IconComponent = config.icon

                    return (
                      <motion.div
                        key={notification.id}
                        variants={listItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ delay: idx * 0.03 }}
                        className={`
                          relative flex items-start gap-3 p-4 border-b last:border-0 cursor-pointer
                          transition-colors duration-200
                          border-l-4 ${config.borderColor}
                          ${notification.isRead
                            ? 'bg-transparent hover:bg-muted/30'
                            : 'bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30'
                          }
                        `}
                        onClick={() => markAsRead(notification.id)}
                      >
                        {/* Type Icon */}
                        <div className={`rounded-xl p-2 shrink-0 ${config.iconBg}`}>
                          <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-semibold leading-tight ${notification.isRead ? 'text-foreground' : 'text-foreground'}`}>
                                {notification.title}
                              </h4>
                            </div>
                            {/* Unread indicator */}
                            {!notification.isRead && (
                              <div className={`shrink-0 h-2.5 w-2.5 rounded-full ${config.dotColor} mt-1 ring-2 ring-white dark:ring-gray-900`} />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(notification.createdAt)}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
