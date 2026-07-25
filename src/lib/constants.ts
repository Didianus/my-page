export type { Page } from './store'

export const INCOME_CATEGORIES = [
  'Iuran Bulanan',
  'Donasi',
  'Sponsor',
  'Bantuan',
  'Dana Kegiatan',
  'Lainnya',
] as const

export const EXPENSE_CATEGORIES = [
  'Konsumsi',
  'Operasional',
  'Kegiatan',
  'Peralatan',
  'Transportasi',
  'Listrik',
  'Internet',
  'Lainnya',
] as const

export const ROLES = ['admin', 'bendahara', 'anggota'] as const

export const MEMBER_STATUSES = ['aktif', 'nonaktif'] as const

export const GENDERS = ['L', 'P'] as const

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function generateMemberNumber(index: number): string {
  return `MBR-${String(index + 1).padStart(4, '0')}`
}

export function generateTransactionNumber(prefix: string, index: number): string {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  return `${prefix}-${dateStr}-${String(index + 1).padStart(4, '0')}`
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'bendahara': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'anggota': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'admin': return 'Admin'
    case 'bendahara': return 'Bendahara'
    case 'anggota': return 'Anggota'
    default: return role
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'aktif': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'nonaktif': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800'
  }
}
