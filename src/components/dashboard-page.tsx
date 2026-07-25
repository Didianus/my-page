"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/constants";

// Types
interface Transaction {
  id: string;
  type: "income" | "expense";
  date: string;
  description: string;
  amount: number;
  category: string;
  transactionNumber: string;
  memberName?: string | null;
}

interface MonthlyChartData {
  month: string;
  year: number;
  income: number;
  expense: number;
}

interface DashboardData {
  totalSaldo: number;
  totalIncome: number;
  totalExpense: number;
  totalIncomeMonth: number;
  totalExpenseMonth: number;
  totalMembers: number;
  recentTransactions: Transaction[];
  monthlyChart: MonthlyChartData[];
  paymentStats: {
    paid: number;
    unpaid: number;
  };
}

// Chart config
const chartConfig = {
  income: {
    label: "Pemasukan",
    color: "oklch(0.7 0.17 162)",
  },
  expense: {
    label: "Pengeluaran",
    color: "oklch(0.65 0.2 25)",
  },
} satisfies ChartConfig;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

// Custom tooltip formatter for currency
function CurrencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-border/50 bg-background grid min-w-[10rem] items-start gap-1.5 rounded-lg border px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.name === "income" ? "Pemasukan" : "Pengeluaran"}:
          </span>
          <span className="text-foreground font-mono font-medium tabular-nums">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  gradientFrom,
  gradientTo,
  iconBg,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  colorClass: string;
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
  index: number;
}) {
  return (
    <motion.div variants={itemVariants} custom={index}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
        className="h-full"
      >
        <Card className="relative overflow-hidden h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          {/* Subtle gradient background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-50`}
          />
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/40 dark:bg-black/10" />

          <CardHeader className="relative z-10 pb-2">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${iconBg} shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
              <CardDescription className="text-sm font-medium">
                {label}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-0">
            <p className={`text-2xl font-bold tracking-tight ${colorClass}`}>
              {value}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Payment stats skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-52" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions skeleton */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Main Dashboard Page Component
export default function DashboardPage() {
  const { user } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<DashboardData>("/dashboard");
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto-refresh when page becomes active
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchDashboard();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchDashboard]);

  // Get current date in Indonesian format
  const today = new Date();
  const currentDateStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  const userName = user?.name || "Pengguna";

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground text-center">{error}</p>
        <Button onClick={fetchDashboard} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const paymentTotal = data.paymentStats.paid + data.paymentStats.unpaid;
  const paidPercentage =
    paymentTotal > 0
      ? Math.round((data.paymentStats.paid / paymentTotal) * 100)
      : 0;
  const unpaidPercentage =
    paymentTotal > 0
      ? Math.round((data.paymentStats.unpaid / paymentTotal) * 100)
      : 0;

  return (
    <motion.div
      className="space-y-6 p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Selamat Datang, {userName}! 👋
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{currentDateStr}</span>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Total Saldo Kas"
          value={formatCurrency(data.totalSaldo)}
          colorClass="text-emerald-700 dark:text-emerald-400"
          gradientFrom="from-emerald-50"
          gradientTo="to-emerald-100/50"
          iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
          index={0}
        />
        <StatCard
          icon={TrendingUp}
          label="Pemasukan Bulan Ini"
          value={formatCurrency(data.totalIncomeMonth)}
          colorClass="text-green-700 dark:text-green-400"
          gradientFrom="from-green-50"
          gradientTo="to-green-100/50"
          iconBg="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
          index={1}
        />
        <StatCard
          icon={TrendingDown}
          label="Pengeluaran Bulan Ini"
          value={formatCurrency(data.totalExpenseMonth)}
          colorClass="text-orange-700 dark:text-orange-400"
          gradientFrom="from-orange-50"
          gradientTo="to-orange-100/50"
          iconBg="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
          index={2}
        />
        <StatCard
          icon={Users}
          label="Total Anggota"
          value={String(data.totalMembers)}
          colorClass="text-teal-700 dark:text-teal-400"
          gradientFrom="from-teal-50"
          gradientTo="to-teal-100/50"
          iconBg="bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400"
          index={3}
        />
      </div>

      {/* Chart + Payment Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-md h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                Grafik Pemasukan & Pengeluaran
              </CardTitle>
              <CardDescription>6 bulan terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="h-64 w-full aspect-auto"
              >
                <BarChart
                  data={data.monthlyChart}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    tickFormatter={(value: number) => {
                      if (value >= 1000000)
                        return `${(value / 1000000).toFixed(1)}jt`;
                      if (value >= 1000)
                        return `${(value / 1000).toFixed(0)}rb`;
                      return String(value);
                    }}
                  />
                  <ChartTooltip content={<CurrencyTooltip />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="income"
                    fill="var(--color-income)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="expense"
                    fill="var(--color-expense)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Statistics */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md h-full">
            <CardHeader>
              <CardTitle className="text-lg">Statistik Pembayaran</CardTitle>
              <CardDescription>Iuran bulan ini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Paid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium">Sudah Bayar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {data.paymentStats.paid} anggota
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {paidPercentage}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={paidPercentage}
                  className="h-2.5 bg-emerald-100 dark:bg-emerald-900/30 [&>[data-slot=progress-indicator]]:bg-emerald-500"
                />
              </div>

              {/* Unpaid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    <span className="text-sm font-medium">Belum Bayar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {data.paymentStats.unpaid} anggota
                    </span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {unpaidPercentage}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={unpaidPercentage}
                  className="h-2.5 bg-orange-100 dark:bg-orange-900/30 [&>[data-slot=progress-indicator]]:bg-orange-500"
                />
              </div>

              {/* Summary */}
              <div className="mt-4 rounded-xl bg-muted/50 p-4 space-y-1">
                <p className="text-xs text-muted-foreground">
                  Total Anggota Aktif
                </p>
                <p className="text-2xl font-bold">{paymentTotal}</p>
                <div className="flex gap-4 pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">
                      {data.paymentStats.paid} bayar
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-xs text-muted-foreground">
                      {data.paymentStats.unpaid} belum
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
              <CardDescription>8 transaksi terakhir</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              onClick={() => {
                const { setCurrentPage } = useAppStore.getState();
                setCurrentPage("income");
              }}
            >
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Belum ada transaksi
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
                {data.recentTransactions.slice(0, 8).map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  >
                    {/* Icon */}
                    <div
                      className={`rounded-full p-2 shrink-0 ${
                        tx.type === "income"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>

                    {/* Description & Date */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description || tx.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.date)} • {tx.category}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-semibold ${
                          tx.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
