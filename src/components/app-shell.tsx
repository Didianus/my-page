"use client"

import { useAppStore, type Page } from "@/lib/store"
import { getRoleBadgeColor, getRoleLabel } from "@/lib/constants"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserNav } from "@/components/user-nav"
import DashboardPage from "@/components/dashboard-page"
import { MembersPage } from "@/components/pages/members-page"
import { IncomePage } from "@/components/pages/income-page"
import { ExpensePage } from "@/components/pages/expense-page"
import { ReportsPage } from "@/components/pages/reports-page"
import { ProfilePage } from "@/components/pages/profile-page"
import { NotificationsPage } from "@/components/pages/notifications-page"
import { PaymentPage } from "@/components/pages/payment-page"
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  Wallet,
  LogOut,
  Moon,
  Sun,
  Bell,
  CreditCard,
} from "lucide-react"
import { useTheme } from "next-themes"
import { AnimatePresence, motion } from "framer-motion"

const navItems: { page: Page; label: string; icon: React.ElementType }[] = [
  { page: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { page: "members", label: "Anggota", icon: Users },
  { page: "payment", label: "Pembayaran", icon: CreditCard },
  { page: "income", label: "Kas Masuk", icon: ArrowDownCircle },
  { page: "expense", label: "Kas Keluar", icon: ArrowUpCircle },
  { page: "reports", label: "Laporan", icon: FileText },
]

const pageLabels: Record<Page, string> = {
  dashboard: "Dashboard",
  members: "Anggota",
  payment: "Pembayaran",
  income: "Kas Masuk",
  expense: "Kas Keluar",
  reports: "Laporan",
  profile: "Profil",
  notifications: "Notifikasi",
}

function PageRenderer({ page }: { page: Page }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={page}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {page === "dashboard" && <DashboardPage />}
        {page === "members" && <MembersPage />}
        {page === "income" && <IncomePage />}
        {page === "expense" && <ExpensePage />}
        {page === "reports" && <ReportsPage />}
        {page === "payment" && <PaymentPage />}
        {page === "profile" && <ProfilePage />}
        {page === "notifications" && <NotificationsPage />}
      </motion.div>
    </AnimatePresence>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="size-9"
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export function AppShell() {
  const { user, currentPage, setCurrentPage, logout } = useAppStore()

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r-0">
        {/* Sidebar Header */}
        <SidebarHeader className="p-3">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3 shadow-lg shadow-emerald-500/20">
            <div className="flex size-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Wallet className="size-5 text-white" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold text-white">KasKu</span>
              <span className="text-[10px] text-emerald-100/80">Manajemen Keuangan</span>
            </div>
          </div>
        </SidebarHeader>

        {/* Sidebar Content */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/50">
              Menu Utama
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.page}>
                    <SidebarMenuButton
                      isActive={currentPage === item.page}
                      onClick={() => setCurrentPage(item.page)}
                      tooltip={item.label}
                      className={`transition-all duration-200 ${
                        currentPage === item.page
                          ? "bg-emerald-500/15 text-emerald-400 font-semibold hover:bg-emerald-500/20 hover:text-emerald-400"
                          : "hover:bg-sidebar-accent"
                      }`}
                    >
                      <item.icon className={`size-4 ${currentPage === item.page ? "text-emerald-500" : ""}`} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer */}
        <SidebarFooter className="p-3">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="size-8 border border-sidebar-border">
              <AvatarFallback className="bg-emerald-600 text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <Badge
                variant="secondary"
                className={`w-fit text-[10px] px-1.5 py-0 ${getRoleBadgeColor(user.role)}`}
              >
                {getRoleLabel(user.role)}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-sidebar-foreground/60 hover:text-red-400 group-data-[collapsible=icon]:hidden"
              onClick={logout}
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Main Content Area */}
      <SidebarInset>
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-xl px-4 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />

          <div className="flex-1">
            <h2 className="text-sm font-semibold">{pageLabels[currentPage]}</h2>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 relative"
              onClick={() => setCurrentPage("notifications")}
            >
              <Bell className="size-4" />
              <span className="sr-only">Notifikasi</span>
            </Button>

            <ThemeToggle />

            <Separator orientation="vertical" className="h-5 mx-1" />

            <UserNav />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6">
          <PageRenderer page={currentPage} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
