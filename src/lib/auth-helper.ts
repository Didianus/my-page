import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  if (!payload) return null
  const user = await db.user.findUnique({ where: { id: payload.userId } })
  if (!user) return null
  return user
}

export function requireAuth(user: ReturnType<typeof getAuthUser> extends Promise<infer T> ? T : never) {
  if (!user) {
    return { error: 'Akses ditolak. Silakan login terlebih dahulu.', status: 401 }
  }
  return null
}

export function requireRole(user: { role: string } | null, roles: string[]) {
  if (!user) {
    return { error: 'Akses ditolak. Silakan login terlebih dahulu.', status: 401 }
  }
  if (!roles.includes(user.role)) {
    return { error: 'Anda tidak memiliki izin untuk melakukan aksi ini.', status: 403 }
  }
  return null
}
