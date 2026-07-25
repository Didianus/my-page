"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Calendar,
  Receipt,
  Plus,
  Search,
  X,
  Eye,
  Pencil,
  Trash2,
  ArrowDownCircle,
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────

interface IncomeCategory {
  id: string;
  name: string;
  description?: string | null;
}

interface Member {
  id: string;
  name: string;
  memberNumber: string;
}

interface Income {
  id: string;
  transactionNumber: string;
  date: string;
  amount: number;
  description?: string | null;
  proofUrl?: string | null;
  categoryId: string;
  memberId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  category: IncomeCategory;
  member?: { id: string; name: string; memberNumber: string } | null;
  createdUser: { id: string; name: string };
}

interface IncomeListResponse {
  incomes: Income[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CategoriesResponse {
  incomeCategories: IncomeCategory[];
  expenseCategories: { id: string; name: string }[];
}

interface MembersResponse {
  members: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Category color map ───────────────────────────────────────────

const categoryColors: Record<string, string> = {
  "Iuran Bulanan":
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Donasi:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Sponsor: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  Bantuan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  "Dana Kegiatan":
    "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400",
  Lainnya: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

function getCategoryBadgeClass(name: string): string {
  return (
    categoryColors[name] ||
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
  );
}

// ─── Animation Variants ───────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

// ─── Loading Skeleton ─────────────────────────────────────────────

function IncomePageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-7 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters skeleton */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-40" />
          </div>
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="space-y-0">
            <div className="flex items-center gap-4 p-4 border-b">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border-b last:border-0"
              >
                {Array.from({ length: 8 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function IncomePage() {
  const { user } = useAppStore();

  // Role-based permissions
  const canModify = user?.role === "admin" || user?.role === "bendahara";
  const canDelete = user?.role === "admin";

  // Data state
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Summary state
  const [totalIncomeAll, setTotalIncomeAll] = useState(0);
  const [totalIncomeMonth, setTotalIncomeMonth] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Filter state
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("all");
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    categoryId: "",
  });

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [viewingIncome, setViewingIncome] = useState<Income | null>(null);
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState("");
  const [formMemberId, setFormMemberId] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ─── Fetch Incomes ────────────────────────────────────────────────

  const fetchIncomes = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "10");
        if (appliedFilters.search) params.set("search", appliedFilters.search);
        if (appliedFilters.dateFrom)
          params.set("dateFrom", appliedFilters.dateFrom);
        if (appliedFilters.dateTo) params.set("dateTo", appliedFilters.dateTo);
        if (appliedFilters.categoryId)
          params.set("categoryId", appliedFilters.categoryId);

        const result = await api.get<IncomeListResponse>(
          `/income?${params.toString()}`,
        );
        setIncomes(result.incomes);
        setPagination(result.pagination);
        setTotalTransactions(result.pagination.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat data pemasukan",
        );
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters],
  );

  // ─── Fetch Summary ────────────────────────────────────────────────

  const fetchSummary = useCallback(async () => {
    try {
      // Fetch all incomes to compute totals (up to 10000 records)
      const fullResult = await api.get<IncomeListResponse>(
        "/income?limit=10000",
      );
      const allIncomes = fullResult.incomes;
      const total = allIncomes.reduce((sum, inc) => sum + inc.amount, 0);
      setTotalIncomeAll(total);

      // Current month income
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      const monthTotal = allIncomes
        .filter((inc) => {
          const d = new Date(inc.date);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, inc) => sum + inc.amount, 0);
      setTotalIncomeMonth(monthTotal);
    } catch {
      // Silently fail for summary
    }
  }, []);

  // ─── Fetch Categories ─────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    try {
      const result = await api.get<CategoriesResponse>("/categories");
      setCategories(result.incomeCategories);
    } catch {
      // Silently fail
    }
  }, []);

  // ─── Fetch Members ────────────────────────────────────────────────

  const fetchMembers = useCallback(async () => {
    try {
      const result = await api.get<MembersResponse>("/members?limit=100");
      setMembers(result.members);
    } catch {
      // Silently fail
    }
  }, []);

  // ─── Initial Load ─────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchCategories(), fetchMembers(), fetchSummary()]);
      // fetchIncomes will be triggered by appliedFilters change below
    };
    init();
  }, [fetchCategories, fetchMembers, fetchSummary]);

  // ─── Apply Filters ────────────────────────────────────────────────

  const applyFilters = () => {
    setAppliedFilters({
      search,
      dateFrom,
      dateTo,
      categoryId: filterCategoryId === "all" ? "" : filterCategoryId,
    });
  };

  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setFilterCategoryId("all");
    setAppliedFilters({ search: "", dateFrom: "", dateTo: "", categoryId: "" });
  };

  // Re-fetch when applied filters change
  useEffect(() => {
    fetchIncomes(1);
  }, [appliedFilters, fetchIncomes]);

  // ─── Form Helpers ─────────────────────────────────────────────────

  const openAddForm = () => {
    setEditingIncome(null);
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormMemberId("none");
    setFormCategoryId("");
    setFormAmount("");
    setFormDescription("");
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditForm = (income: Income) => {
    setEditingIncome(income);
    setFormDate(new Date(income.date).toISOString().split("T")[0]);
    setFormMemberId(income.memberId || "none");
    setFormCategoryId(income.categoryId);
    setFormAmount(String(income.amount));
    setFormDescription(income.description || "");
    setFormErrors({});
    setFormOpen(true);
  };

  const openViewDialog = (income: Income) => {
    setViewingIncome(income);
    setViewOpen(true);
  };

  const openDeleteDialog = (income: Income) => {
    setDeletingIncome(income);
    setDeleteOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formDate) errors.date = "Tanggal wajib diisi";
    if (!formCategoryId) errors.categoryId = "Kategori wajib diisi";
    if (!formAmount || parseFloat(formAmount) <= 0)
      errors.amount = "Nominal harus lebih dari 0";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        date: formDate,
        memberId: formMemberId && formMemberId !== "none" ? formMemberId : null,
        categoryId: formCategoryId,
        amount: parseFloat(formAmount),
        description: formDescription || null,
      };

      if (editingIncome) {
        const result = await api.put<{ income: Income }>(
          `/income/${editingIncome.id}`,
          payload,
        );
        toast.success("Pemasukan berhasil diperbarui", {
          description: `No. ${result.income.transactionNumber}`,
        });
      } else {
        const result = await api.post<{ income: Income; message: string }>(
          "/income",
          payload,
        );
        toast.success("Pemasukan berhasil ditambahkan", {
          description: `No. ${result.income.transactionNumber}`,
        });
      }

      setFormOpen(false);
      await Promise.all([fetchIncomes(pagination.page), fetchSummary()]);
    } catch (err) {
      toast.error("Gagal menyimpan pemasukan", {
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingIncome) return;
    setDeleting(true);
    try {
      await api.delete(`/income/${deletingIncome.id}`);
      toast.success("Pemasukan berhasil dihapus", {
        description: `No. ${deletingIncome.transactionNumber}`,
      });
      setDeleteOpen(false);
      setDeletingIncome(null);
      await Promise.all([fetchIncomes(pagination.page), fetchSummary()]);
    } catch (err) {
      toast.error("Gagal menghapus pemasukan", {
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ─── Pagination Helpers ───────────────────────────────────────────

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchIncomes(page);
  };

  // ─── Format display amount ────────────────────────────────────────

  const formatDisplayAmount = (value: string) => {
    if (!value) return "";
    const num = parseFloat(value.replace(/[^\d]/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString("id-ID");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setFormAmount(raw);
  };

  // ─── Render ───────────────────────────────────────────────────────

  if (loading && incomes.length === 0 && !error) {
    return <IncomePageSkeleton />;
  }

  if (error && incomes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground text-center">{error}</p>
        <Button
          onClick={() => fetchIncomes(1)}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Header ──────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ArrowDownCircle className="h-7 w-7 text-emerald-500" />
            Kas Masuk
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola pemasukan kas kelompok dengan mudah
          </p>
        </div>
        {canModify && (
          <Button
            onClick={openAddForm}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25 gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Kas Masuk
          </Button>
        )}
      </motion.div>

      {/* ─── Summary Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Pemasukan */}
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
          >
            <Card className="relative overflow-hidden h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100/50 opacity-50" />
              <div className="absolute inset-0 backdrop-blur-sm bg-white/40 dark:bg-black/10" />
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl p-2.5 bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400 shadow-sm">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <CardDescription className="text-sm font-medium">
                    Total Pemasukan
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <div className="text-2xl font-bold tracking-tight text-green-700 dark:text-green-400">
                  {loading ? (
                    <Skeleton className="h-7 w-36" />
                  ) : (
                    formatCurrency(totalIncomeAll)
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Pemasukan Bulan Ini */}
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
          >
            <Card className="relative overflow-hidden h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 opacity-50" />
              <div className="absolute inset-0 backdrop-blur-sm bg-white/40 dark:bg-black/10" />
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl p-2.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-sm">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <CardDescription className="text-sm font-medium">
                    Pemasukan Bulan Ini
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <div className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                  {loading ? (
                    <Skeleton className="h-7 w-36" />
                  ) : (
                    formatCurrency(totalIncomeMonth)
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Jumlah Transaksi */}
        <motion.div variants={itemVariants}>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
          >
            <Card className="relative overflow-hidden h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-teal-100/50 opacity-50" />
              <div className="absolute inset-0 backdrop-blur-sm bg-white/40 dark:bg-black/10" />
              <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl p-2.5 bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400 shadow-sm">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <CardDescription className="text-sm font-medium">
                    Jumlah Transaksi
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <div className="text-2xl font-bold tracking-tight text-teal-700 dark:text-teal-400">
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    totalTransactions
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* ─── Filters Bar ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari no. transaksi atau keterangan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                    className="pl-9 h-9"
                  />
                </div>
              </div>

              {/* Date From */}
              <div className="min-w-[140px]">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9"
                  placeholder="Dari tanggal"
                />
              </div>

              {/* Date To */}
              <div className="min-w-[140px]">
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9"
                  placeholder="Sampai tanggal"
                />
              </div>

              {/* Category Filter */}
              <div className="min-w-[180px]">
                <Select
                  value={filterCategoryId}
                  onValueChange={setFilterCategoryId}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Apply & Reset */}
              <Button
                onClick={applyFilters}
                size="sm"
                className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Search className="h-3.5 w-3.5 mr-1" />
                Cari
              </Button>
              <Button
                onClick={resetFilters}
                variant="outline"
                size="sm"
                className="h-9 gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Income Table ────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-500" />
              Daftar Kas Masuk
            </CardTitle>
            <CardDescription>
              Menampilkan {incomes.length} dari {pagination.total} transaksi
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {incomes.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 p-6 mb-4">
                  <ArrowDownCircle className="h-12 w-12 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  Belum Ada Kas Masuk
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-4">
                  {appliedFilters.search ||
                  appliedFilters.dateFrom ||
                  appliedFilters.dateTo ||
                  appliedFilters.categoryId
                    ? "Tidak ada data yang cocok dengan filter. Coba ubah kriteria pencarian."
                    : "Mulai catat pemasukan kas kelompok dengan menekan tombol di atas."}
                </p>
                {canModify &&
                  !appliedFilters.search &&
                  !appliedFilters.dateFrom &&
                  !appliedFilters.dateTo &&
                  !appliedFilters.categoryId && (
                    <Button
                      onClick={openAddForm}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Kas Masuk
                    </Button>
                  )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-12 text-center">No</TableHead>
                        <TableHead>No. Transaksi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Nama Anggota</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Nominal</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomes.map((income, idx) => (
                        <TableRow key={income.id} className="group">
                          <TableCell className="text-center text-muted-foreground text-sm">
                            {(pagination.page - 1) * pagination.limit + idx + 1}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-medium">
                            {income.transactionNumber}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(income.date)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {income.member ? (
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                  <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span>{income.member.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getCategoryBadgeClass(income.category.name)}`}
                            >
                              {income.category.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(income.amount)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {income.description || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => openViewDialog(income)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canModify && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
                                  onClick={() => openEditForm(income)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => openDeleteDialog(income)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile card view */}
                <div className="md:hidden space-y-3 p-4">
                  {incomes.map((income, idx) => (
                    <motion.div
                      key={income.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="rounded-xl border bg-white/80 dark:bg-gray-900/80 p-4 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-medium text-muted-foreground">
                          {income.transactionNumber}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getCategoryBadgeClass(income.category.name)}`}
                        >
                          {income.category.name}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {income.member?.name || "Umum"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(income.date)}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(income.amount)}
                        </p>
                      </div>
                      {income.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {income.description}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-1 pt-1 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => openViewDialog(income)}
                        >
                          <Eye className="h-3 w-3" /> Detail
                        </Button>
                        {canModify && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-emerald-600"
                            onClick={() => openEditForm(income)}
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-destructive"
                            onClick={() => openDeleteDialog(income)}
                          >
                            <Trash2 className="h-3 w-3" /> Hapus
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Halaman {pagination.page} dari {pagination.totalPages} (
                      {pagination.total} data)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        disabled={pagination.page <= 1}
                        onClick={() => goToPage(pagination.page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => goToPage(pagination.page + 1)}
                      >
                        Selanjutnya
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Add/Edit Dialog ─────────────────────────────────────── */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open && !submitting) setFormOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-emerald-500" />
              {editingIncome ? "Edit Kas Masuk" : "Tambah Kas Masuk"}
            </DialogTitle>
            <DialogDescription>
              {editingIncome
                ? "Perbarui data pemasukan kas"
                : "Isi form untuk menambahkan pemasukan kas baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Transaction number (read-only for edit) */}
            {editingIncome && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">No. Transaksi</Label>
                <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {editingIncome.transactionNumber}
                </div>
              </div>
            )}

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="form-date" className="text-sm font-medium">
                Tanggal <span className="text-destructive">*</span>
              </Label>
              <Input
                id="form-date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className={formErrors.date ? "border-destructive" : ""}
              />
              {formErrors.date && (
                <p className="text-xs text-destructive">{formErrors.date}</p>
              )}
            </div>

            {/* Member */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Anggota</Label>
              <Select value={formMemberId} onValueChange={setFormMemberId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih anggota (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.memberNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Kategori <span className="text-destructive">*</span>
              </Label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                <SelectTrigger
                  className={`w-full ${formErrors.categoryId ? "border-destructive" : ""}`}
                >
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.categoryId && (
                <p className="text-xs text-destructive">
                  {formErrors.categoryId}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="form-amount" className="text-sm font-medium">
                Nominal <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="form-amount"
                  type="text"
                  inputMode="numeric"
                  value={formAmount ? formatDisplayAmount(formAmount) : ""}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className={`pl-10 ${formErrors.amount ? "border-destructive" : ""}`}
                />
              </div>
              {formErrors.amount && (
                <p className="text-xs text-destructive">{formErrors.amount}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="form-desc" className="text-sm font-medium">
                Keterangan
              </Label>
              <Textarea
                id="form-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Tambahkan keterangan (opsional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingIncome ? "Simpan Perubahan" : "Tambah Pemasukan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── View Detail Dialog ──────────────────────────────────── */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-500" />
              Detail Kas Masuk
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap transaksi pemasukan
            </DialogDescription>
          </DialogHeader>

          {viewingIncome && (
            <div className="space-y-4 py-2">
              {/* Transaction Number */}
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  No. Transaksi
                </p>
                <p className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {viewingIncome.transactionNumber}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Tanggal"
                  value={formatDate(viewingIncome.date)}
                  icon={<Calendar className="h-4 w-4" />}
                />
                <DetailItem
                  label="Kategori"
                  value={viewingIncome.category.name}
                  icon={<Receipt className="h-4 w-4" />}
                />
                <DetailItem
                  label="Anggota"
                  value={viewingIncome.member?.name || "Umum"}
                  icon={<User className="h-4 w-4" />}
                />
                <DetailItem
                  label="Nominal"
                  value={formatCurrency(viewingIncome.amount)}
                  icon={<Wallet className="h-4 w-4" />}
                  valueClass="text-emerald-600 dark:text-emerald-400 font-bold"
                />
              </div>

              {/* Description */}
              {viewingIncome.description && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Keterangan</p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">
                    {viewingIncome.description}
                  </p>
                </div>
              )}

              {/* Meta */}
              <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
                <p>Dibuat oleh: {viewingIncome.createdUser.name}</p>
                <p>Dibuat pada: {formatDate(viewingIncome.createdAt)}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Tutup
            </Button>
            {canModify && viewingIncome && (
              <Button
                onClick={() => {
                  setViewOpen(false);
                  setTimeout(() => openEditForm(viewingIncome), 200);
                }}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─────────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Hapus Kas Masuk
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi{" "}
              <span className="font-semibold font-mono">
                {deletingIncome?.transactionNumber}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// ─── Detail Item Helper ─────────────────────────────────────────────

function DetailItem({
  label,
  value,
  icon,
  valueClass = "",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={`text-sm font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}
