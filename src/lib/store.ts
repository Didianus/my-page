import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Page = 'dashboard' | 'members' | 'income' | 'expense' | 'payment' | 'reports' | 'profile' | 'notifications'

interface AuthUser {
  userId: string
  email: string
  name: string
  role: string
  avatar?: string | null
}

interface AppState {
  // Auth
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: AuthUser | null, token: string | null) => void
  logout: () => void

  // Navigation
  currentPage: Page
  setCurrentPage: (page: Page) => void

  // UI
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token) =>
        set({ user, token, isAuthenticated: !!user }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, currentPage: 'dashboard' }),

      // Navigation
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),

      // UI
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'kas-keuangan-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        currentPage: state.currentPage,
      }),
    }
  )
)
