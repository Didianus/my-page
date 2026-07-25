import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'kas-keuangan-secret-key-2024'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function hasPermission(role: string, action: string): boolean {
  const permissions: Record<string, string[]> = {
    admin: ['manage_all', 'manage_members', 'manage_transactions', 'export_reports', 'view_dashboard', 'manage_income', 'manage_expense'],
    bendahara: ['manage_income', 'manage_expense', 'export_reports', 'view_dashboard', 'view_members'],
    anggota: ['view_own_report', 'view_own_payments', 'view_dashboard'],
  }
  return permissions[role]?.includes(action) ?? false
}
