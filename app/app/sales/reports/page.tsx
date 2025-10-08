"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  FaDollarSign,
  FaChartLine,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMoneyBillWave,
  FaCreditCard,
  FaCalendarAlt,
  FaWhatsapp,
  FaFileExport,
  FaPrint,
  FaQuestionCircle,
  FaBox,
  FaArrowUp,
} from "react-icons/fa"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSalesReports } from "@/hooks/useSalesReports"
import { useLocale } from "@/contexts/LocaleContext"
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { formatLargeNumber } from "@/lib/utils"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  valueColor?: string
  onClick?: () => void
}

function StatCard({ icon, label, value, valueColor = "text-neutral-900", onClick }: StatCardProps) {
  const displayValue = formatLargeNumber(value)
  const fullValue = `$${value.toFixed(2)}`

  return (
    <GlassCard className={onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""} onClick={onClick}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black flex items-center justify-center">
          <div className="text-white text-lg sm:text-xl">{icon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-neutral-600 truncate">{label}</p>
          <p className={`text-lg sm:text-2xl font-bold ${valueColor} truncate`} title={fullValue}>
            {displayValue}
          </p>
        </div>
      </div>
    </GlassCard>
  )
}

export default function ReportsPage() {
  const router = useRouter()
  const { t } = useLocale()
  const { getFinancialSummary, getProductProfitability, getAccountsReceivable, getIncomeTimeline, loading } =
    useSalesReports()

  // Date range state
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Data state
  const [financialSummary, setFinancialSummary] = useState<any>(null)
  const [productProfitability, setProductProfitability] = useState<any[]>([])
  const [accountsReceivable, setAccountsReceivable] = useState<any>(null)
  const [incomeTimeline, setIncomeTimeline] = useState<any[]>([])

  // UI state
  const [activeTab, setActiveTab] = useState("overview")
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day")
  const [showOnlyWithCost, setShowOnlyWithCost] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState<string>("total_revenue")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailModalData, setDetailModalData] = useState<{ label: string; value: number } | null>(null)

  // Load data based on active tab and date range
  useEffect(() => {
    loadData()
  }, [dateRange, activeTab, groupBy])

  const loadData = async () => {
    const startDate = format(dateRange.from, "yyyy-MM-dd")
    const endDate = format(dateRange.to, "yyyy-MM-dd")

    if (activeTab === "overview") {
      const { data } = await getFinancialSummary(startDate, endDate)
      setFinancialSummary(data)
    } else if (activeTab === "profitability") {
      const { data } = await getProductProfitability(startDate, endDate)
      setProductProfitability(data || [])
    } else if (activeTab === "receivables") {
      const { data } = await getAccountsReceivable()
      setAccountsReceivable(data)
    } else if (activeTab === "timeline") {
      const { data } = await getIncomeTimeline(startDate, endDate, groupBy)
      setIncomeTimeline(data || [])
    }
  }

  const handleDatePreset = (preset: string) => {
    const today = new Date()
    let from: Date
    let to: Date = today

    switch (preset) {
      case "today":
        from = today
        break
      case "7days":
        from = subDays(today, 7)
        break
      case "30days":
        from = subDays(today, 30)
        break
      case "thisMonth":
        from = startOfMonth(today)
        to = endOfMonth(today)
        break
      case "lastMonth":
        from = startOfMonth(subMonths(today, 1))
        to = endOfMonth(subMonths(today, 1))
        break
      default:
        return
    }

    setDateRange({ from, to })
    setIsDatePickerOpen(false)
  }

  const openWhatsApp = (phone: string, customerName: string) => {
    const cleanPhone = phone.replace(/\D/g, "")
    const message = encodeURIComponent(`Hello ${customerName}, this is a friendly reminder about your pending payment.`)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank")
  }

  const sortedProducts = [...productProfitability]
    .filter((p) => !showOnlyWithCost || p.has_cost_data)
    .sort((a, b) => {
      const aVal = a[sortColumn] ?? 0
      const bVal = b[sortColumn] ?? 0
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal
    })

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const showDetailModal = (label: string, value: number) => {
    setDetailModalData({ label, value })
    setDetailModalOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900">
              {t("reports.title")}{" "}
              <span className="italic font-light text-neutral-600">{t("reports.titleItalic")}</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">{t("reports.description")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setTutorialOpen(true)} className="gap-2 bg-transparent">
              <FaQuestionCircle className="w-4 h-4" />
              {t("reports.help")}
            </Button>

            {/* Date Range Picker */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <FaCalendarAlt className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                  </span>
                  <span className="sm:hidden">{format(dateRange.from, "MMM dd")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4 space-y-2 border-b">
                  <p className="text-sm font-semibold">{t("reports.quickSelect")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDatePreset("today")}>
                      {t("reports.today")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDatePreset("7days")}>
                      {t("reports.last7Days")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDatePreset("30days")}>
                      {t("reports.last30Days")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDatePreset("thisMonth")}>
                      {t("reports.thisMonth")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDatePreset("lastMonth")}>
                      {t("reports.lastMonth")}
                    </Button>
                  </div>
                </div>
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range: any) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to })
                    }
                  }}
                  numberOfMonths={2}
                  className="hidden sm:block"
                />
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range: any) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to })
                    }
                  }}
                  numberOfMonths={1}
                  className="sm:hidden"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="overview">{t("reports.overview")}</TabsTrigger>
            <TabsTrigger value="profitability">{t("reports.profitability")}</TabsTrigger>
            <TabsTrigger value="receivables">{t("reports.receivables")}</TabsTrigger>
            <TabsTrigger value="timeline">{t("reports.timeline")}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <GlassCard key={i}>
                    <Skeleton className="h-20 sm:h-24" />
                  </GlassCard>
                ))}
              </div>
            ) : financialSummary ? (
              <>
                <div className="rounded-2xl bg-gradient-to-br from-black via-neutral-900 to-neutral-800 p-6 sm:p-8 shadow-[0_8px_30px_rgb(59,130,246,0.15)]">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                    <FaChartLine />
                    {t("reports.keyMetrics")}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* CHANGE: Made cards white and clickable to open detail modal */}
                    <div
                      className="bg-white rounded-xl p-4 sm:p-5 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => showDetailModal(t("reports.totalRealIncome"), financialSummary.real_income.total)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black flex items-center justify-center">
                          <FaDollarSign className="text-white text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-neutral-600 truncate">{t("reports.totalRealIncome")}</p>
                          <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                            {formatLargeNumber(financialSummary.real_income.total)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="bg-white rounded-xl p-4 sm:p-5 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() =>
                        showDetailModal(
                          t("reports.pendingCollection"),
                          financialSummary.accounts_receivable.pending_amount,
                        )
                      }
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black flex items-center justify-center">
                          <FaExclamationTriangle className="text-white text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-neutral-600 truncate">
                            {t("reports.pendingCollection")}
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-orange-500 truncate">
                            {formatLargeNumber(financialSummary.accounts_receivable.pending_amount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="bg-white rounded-xl p-4 sm:p-5 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => showDetailModal(t("reports.totalSales"), financialSummary.total_sales.amount)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black flex items-center justify-center">
                          <FaChartLine className="text-white text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-neutral-600 truncate">{t("reports.totalSales")}</p>
                          <p className="text-lg sm:text-2xl font-bold text-blue-600 truncate">
                            {formatLargeNumber(financialSummary.total_sales.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real Income Section */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-600" />
                    {t("reports.realIncome")}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <StatCard
                      icon={<FaDollarSign />}
                      label={t("reports.cashSales")}
                      value={financialSummary.real_income.cash_sales}
                      onClick={() => showDetailModal(t("reports.cashSales"), financialSummary.real_income.cash_sales)}
                    />
                    <StatCard
                      icon={<FaCreditCard />}
                      label={t("reports.paidInstallments")}
                      value={financialSummary.real_income.paid_installments}
                      onClick={() =>
                        showDetailModal(t("reports.paidInstallments"), financialSummary.real_income.paid_installments)
                      }
                    />
                    <StatCard
                      icon={<FaCheckCircle />}
                      label={t("reports.totalRealIncome")}
                      value={financialSummary.real_income.total}
                      valueColor="text-green-600"
                      onClick={() => showDetailModal(t("reports.totalRealIncome"), financialSummary.real_income.total)}
                    />
                  </div>
                </div>

                {/* Accounts Receivable Section */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <FaExclamationTriangle className="text-orange-600" />
                    {t("reports.accountsReceivable")}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <StatCard
                      icon={<FaCalendarAlt />}
                      label={t("reports.pendingAmount")}
                      value={financialSummary.accounts_receivable.pending_amount}
                      onClick={() =>
                        showDetailModal(t("reports.pendingAmount"), financialSummary.accounts_receivable.pending_amount)
                      }
                    />
                    <StatCard
                      icon={<FaExclamationTriangle />}
                      label={t("reports.overdue")}
                      value={financialSummary.accounts_receivable.overdue_amount}
                      valueColor="text-red-600"
                      onClick={() =>
                        showDetailModal(t("reports.overdue"), financialSummary.accounts_receivable.overdue_amount)
                      }
                    />
                    <GlassCard>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black flex items-center justify-center">
                          <FaUsers className="text-white text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-neutral-600 truncate">
                            {t("reports.customersWithDebt")}
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-neutral-900">
                            {financialSummary.accounts_receivable.total_customers_with_debt}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>

                {/* Profitability Section */}
                {financialSummary.profitability.products_with_cost_data > 0 ? (
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <FaChartLine className="text-blue-600" />
                      {t("reports.profitabilityAnalysis")}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <StatCard
                        icon={<FaDollarSign />}
                        label={t("reports.totalRevenue")}
                        value={financialSummary.profitability.total_revenue_with_cost}
                        onClick={() =>
                          showDetailModal(
                            t("reports.totalRevenue"),
                            financialSummary.profitability.total_revenue_with_cost,
                          )
                        }
                      />
                      <StatCard
                        icon={<FaBox />}
                        label={t("reports.totalCost")}
                        value={financialSummary.profitability.total_cost}
                        onClick={() =>
                          showDetailModal(t("reports.totalCost"), financialSummary.profitability.total_cost)
                        }
                      />
                      <StatCard
                        icon={<FaChartLine />}
                        label={t("reports.grossProfit")}
                        value={financialSummary.profitability.gross_profit}
                        valueColor="text-green-600"
                        onClick={() =>
                          showDetailModal(t("reports.grossProfit"), financialSummary.profitability.gross_profit)
                        }
                      />
                      <GlassCard>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black flex items-center justify-center">
                            <FaArrowUp className="text-white text-lg sm:text-xl" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-neutral-600 truncate">{t("reports.profitMargin")}</p>
                            <p className="text-lg sm:text-2xl font-bold text-neutral-900">
                              {(
                                (financialSummary.profitability.gross_profit /
                                  financialSummary.profitability.total_revenue_with_cost) *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                    <div className="mt-4 rounded-full bg-gradient-to-r from-black via-neutral-900 to-white/10 px-8 py-5 shadow-[0_4px_20px_rgb(59,130,246,0.25)]">
                      <p className="text-sm text-white text-center">
                        {t("reports.profitabilityNote", {
                          count: financialSummary.profitability.products_with_cost_data,
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <FaExclamationTriangle className="h-4 w-4" />
                    <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span>{t("reports.noCostDataWarning")}</span>
                      <Button variant="outline" size="sm" onClick={() => router.push("/app/inventory/products")}>
                        {t("reports.goToProducts")}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4">{t("reports.comparison")}</h2>
                  <GlassCard>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      <div className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm text-neutral-600 mb-1">{t("reports.totalSalesInvoiced")}</p>
                        <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                          {formatLargeNumber(financialSummary.total_sales.amount)}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {financialSummary.total_sales.count} {t("reports.sales")}
                        </p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm text-neutral-600 mb-1">{t("reports.realIncomeCollected")}</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">
                          {formatLargeNumber(financialSummary.real_income.total)}
                        </p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm text-neutral-600 mb-1">{t("reports.pendingCollection")}</p>
                        <p className="text-xl sm:text-2xl font-bold text-orange-600">
                          {formatLargeNumber(financialSummary.total_sales.amount - financialSummary.real_income.total)}
                        </p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm text-neutral-600 mb-1">{t("reports.collectionRate")}</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">
                          {((financialSummary.real_income.total / financialSummary.total_sales.amount) * 100).toFixed(
                            1,
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </>
            ) : (
              <Alert>
                <AlertDescription>{t("reports.noData")}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Profitability Tab */}
          <TabsContent value="profitability" className="space-y-6">
            {loading ? (
              <GlassCard>
                <Skeleton className="h-96" />
              </GlassCard>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <GlassCard>
                    <p className="text-xs sm:text-sm text-neutral-600">{t("reports.totalProductsAnalyzed")}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-neutral-900">{productProfitability.length}</p>
                  </GlassCard>
                  <GlassCard>
                    <p className="text-xs sm:text-sm text-neutral-600">{t("reports.productsWithCostData")}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {productProfitability.filter((p) => p.has_cost_data).length}
                    </p>
                  </GlassCard>
                  <GlassCard>
                    <p className="text-xs sm:text-sm text-neutral-600">{t("reports.totalGrossProfit")}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {formatLargeNumber(productProfitability.reduce((sum, p) => sum + (p.gross_profit || 0), 0))}
                    </p>
                  </GlassCard>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <Button
                    variant={showOnlyWithCost ? "default" : "outline"}
                    onClick={() => setShowOnlyWithCost(!showOnlyWithCost)}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <FaBox className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{t("reports.showOnlyWithCost")}</span>
                  </Button>
                  <Button variant="outline" className="gap-2 w-full sm:w-auto sm:ml-auto bg-transparent">
                    <FaFileExport className="w-4 h-4" />
                    {t("reports.exportCSV")}
                  </Button>
                </div>

                <GlassCard>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                              {t("reports.productName")}
                            </th>
                            <th
                              className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 cursor-pointer hover:bg-neutral-100 text-xs sm:text-sm"
                              onClick={() => handleSort("units_sold")}
                            >
                              {t("reports.unitsSold")}{" "}
                              {sortColumn === "units_sold" && (sortDirection === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                              className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 cursor-pointer hover:bg-neutral-100 text-xs sm:text-sm"
                              onClick={() => handleSort("total_revenue")}
                            >
                              {t("reports.revenue")}{" "}
                              {sortColumn === "total_revenue" && (sortDirection === "asc" ? "↑" : "↓")}
                            </th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm hidden sm:table-cell">
                              {t("reports.cost")}
                            </th>
                            <th
                              className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 cursor-pointer hover:bg-neutral-100 text-xs sm:text-sm"
                              onClick={() => handleSort("gross_profit")}
                            >
                              {t("reports.profit")}{" "}
                              {sortColumn === "gross_profit" && (sortDirection === "asc" ? "↑" : "↓")}
                            </th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm hidden lg:table-cell">
                              {t("reports.margin")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedProducts.map((product, index) => (
                            <motion.tr
                              key={product.product_id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                              onClick={() => router.push(`/app/inventory/products`)}
                            >
                              <td className="py-3 sm:py-4 px-3 sm:px-4 font-medium text-neutral-900 text-xs sm:text-sm">
                                <div className="flex flex-col">
                                  <span className="truncate max-w-[150px] sm:max-w-none">{product.product_name}</span>
                                  {!product.has_cost_data && (
                                    <Badge variant="secondary" className="mt-1 text-xs w-fit">
                                      {t("reports.noCostData")}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 sm:py-4 px-3 sm:px-4 text-neutral-600 text-xs sm:text-sm">
                                {product.units_sold}
                              </td>
                              <td className="py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                                {formatLargeNumber(product.total_revenue)}
                              </td>
                              <td className="py-3 sm:py-4 px-3 sm:px-4 text-neutral-600 text-xs sm:text-sm hidden sm:table-cell">
                                {product.has_cost_data ? formatLargeNumber(product.total_cost) : "-"}
                              </td>
                              <td
                                className={`py-3 sm:py-4 px-3 sm:px-4 font-semibold text-xs sm:text-sm ${
                                  product.gross_profit && product.gross_profit > 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {product.has_cost_data ? formatLargeNumber(product.gross_profit) : "-"}
                              </td>
                              <td className="py-3 sm:py-4 px-3 sm:px-4 text-neutral-600 text-xs sm:text-sm hidden lg:table-cell">
                                {product.has_cost_data ? `${product.profit_margin_avg?.toFixed(1)}%` : "-"}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </GlassCard>
              </>
            )}
          </TabsContent>

          {/* Accounts Receivable Tab */}
          <TabsContent value="receivables" className="space-y-6">
            {loading ? (
              <GlassCard>
                <Skeleton className="h-96" />
              </GlassCard>
            ) : accountsReceivable ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard
                    icon={<FaDollarSign />}
                    label={t("reports.totalPending")}
                    value={accountsReceivable.summary.total_pending}
                    onClick={() => showDetailModal(t("reports.totalPending"), accountsReceivable.summary.total_pending)}
                  />
                  <StatCard
                    icon={<FaExclamationTriangle />}
                    label={t("reports.totalOverdue")}
                    value={accountsReceivable.summary.total_overdue}
                    valueColor="text-red-600"
                    onClick={() => showDetailModal(t("reports.totalOverdue"), accountsReceivable.summary.total_overdue)}
                  />
                  <GlassCard>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black flex items-center justify-center">
                        <FaUsers className="text-white text-lg sm:text-xl" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-neutral-600 truncate">{t("reports.customersWithDebt")}</p>
                        <p className="text-lg sm:text-2xl font-bold text-neutral-900">
                          {accountsReceivable.summary.total_customers}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                  <GlassCard>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black flex items-center justify-center">
                        <FaCalendarAlt className="text-white text-lg sm:text-xl" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-neutral-600 truncate">{t("reports.avgDaysOverdue")}</p>
                        <p className="text-lg sm:text-2xl font-bold text-neutral-900">
                          {accountsReceivable.summary.avg_days_overdue.toFixed(0)} {t("reports.days")}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Aging Analysis Chart */}
                <GlassCard>
                  <h3 className="text-base sm:text-lg font-semibold mb-4">{t("reports.agingAnalysis")}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          name: t("reports.current030"),
                          amount: accountsReceivable.aging.current_0_30,
                          fill: "#3b82f6",
                        },
                        {
                          name: t("reports.overdue130"),
                          amount: accountsReceivable.aging.overdue_1_30,
                          fill: "#eab308",
                        },
                        {
                          name: t("reports.overdue3160"),
                          amount: accountsReceivable.aging.overdue_31_60,
                          fill: "#f97316",
                        },
                        {
                          name: t("reports.overdue6190"),
                          amount: accountsReceivable.aging.overdue_61_90,
                          fill: "#ef4444",
                        },
                        {
                          name: t("reports.overdue90plus"),
                          amount: accountsReceivable.aging.overdue_90_plus,
                          fill: "#dc2626",
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>

                {/* By Customer Table */}
                <GlassCard>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">{t("reports.byCustomer")}</h3>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent w-full sm:w-auto">
                      <FaFileExport className="w-4 h-4" />
                      {t("reports.export")}
                    </Button>
                  </div>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                              {t("reports.customer")}
                            </th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm hidden sm:table-cell">
                              {t("reports.phone")}
                            </th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                              {t("reports.totalDebt")}
                            </th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm hidden lg:table-cell">
                              {t("reports.overdue")}
                            </th>
                            <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                              {t("reports.actions")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {accountsReceivable.by_customer
                            .sort((a: any, b: any) => b.total_debt - a.total_debt)
                            .map((customer: any, index: number) => (
                              <motion.tr
                                key={customer.customer_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-neutral-100 hover:bg-neutral-50"
                              >
                                <td className="py-3 sm:py-4 px-3 sm:px-4 font-medium text-neutral-900 text-xs sm:text-sm">
                                  <div className="flex flex-col">
                                    <span className="truncate max-w-[120px] sm:max-w-none">
                                      {customer.customer_name}
                                    </span>
                                    {customer.days_oldest_overdue > 30 && (
                                      <Badge variant="destructive" className="mt-1 text-xs w-fit">
                                        {t("reports.urgent")}
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 sm:py-4 px-3 sm:px-4 text-neutral-600 text-xs sm:text-sm hidden sm:table-cell">
                                  {customer.customer_phone}
                                </td>
                                <td className="py-3 sm:py-4 px-3 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                                  {formatLargeNumber(customer.total_debt)}
                                </td>
                                <td className="py-3 sm:py-4 px-3 sm:px-4 font-semibold text-red-600 text-xs sm:text-sm hidden lg:table-cell">
                                  {formatLargeNumber(customer.overdue_debt)}
                                </td>
                                <td className="py-3 sm:py-4 px-3 sm:px-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 bg-transparent text-xs"
                                    onClick={() => openWhatsApp(customer.customer_phone, customer.customer_name)}
                                  >
                                    <FaWhatsapp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                    <span className="hidden sm:inline">{t("reports.remind")}</span>
                                  </Button>
                                </td>
                              </motion.tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </GlassCard>
              </>
            ) : (
              <Alert>
                <AlertDescription>{t("reports.noReceivablesData")}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Income Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            {/* Group By Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <label className="text-sm font-semibold text-neutral-900">{t("reports.groupBy")}:</label>
              <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">{t("reports.daily")}</SelectItem>
                  <SelectItem value="week">{t("reports.weekly")}</SelectItem>
                  <SelectItem value="month">{t("reports.monthly")}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-2 sm:ml-auto bg-transparent w-full sm:w-auto">
                <FaPrint className="w-4 h-4" />
                {t("reports.print")}
              </Button>
            </div>

            {loading ? (
              <GlassCard>
                <Skeleton className="h-96" />
              </GlassCard>
            ) : incomeTimeline.length > 0 ? (
              <>
                {/* Chart */}
                <GlassCard>
                  <h3 className="text-base sm:text-lg font-semibold mb-4">{t("reports.incomeTimeline")}</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={incomeTimeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Line
                        type="monotone"
                        dataKey="cash_sales"
                        stroke="#10b981"
                        name={t("reports.cashSales")}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="installment_payments"
                        stroke="#3b82f6"
                        name={t("reports.installmentPayments")}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="total_income"
                        stroke="#8b5cf6"
                        name={t("reports.totalIncome")}
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </GlassCard>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <GlassCard>
                    <p className="text-xs sm:text-sm text-neutral-600">{t("reports.totalCashSales")}</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {formatLargeNumber(incomeTimeline.reduce((sum, t) => sum + t.cash_sales, 0))}
                    </p>
                  </GlassCard>
                  <GlassCard>
                    <p className="text-xs sm:text-sm text-neutral-600">{t("reports.totalInstallmentPayments")}</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                      {formatLargeNumber(incomeTimeline.reduce((sum, t) => sum + t.installment_payments, 0))}
                    </p>
                  </GlassCard>
                  <GlassCard>
                    <p className="text-xs sm:text-sm text-neutral-600">{t("reports.totalIncome")}</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">
                      {formatLargeNumber(incomeTimeline.reduce((sum, t) => sum + t.total_income, 0))}
                    </p>
                  </GlassCard>
                  <GlassCard>
                    <p className="text-xs sm:text-sm text-neutral-600">{t("reports.avgDailyIncome")}</p>
                    <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                      {formatLargeNumber(
                        incomeTimeline.reduce((sum, t) => sum + t.total_income, 0) / incomeTimeline.length,
                      )}
                    </p>
                  </GlassCard>
                </div>
              </>
            ) : (
              <Alert>
                <AlertDescription>{t("reports.noIncomeData")}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{detailModalData?.label}</DialogTitle>
            <DialogDescription>{t("reports.fullValueDescription")}</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-2">{t("reports.exactAmount")}</p>
              <p className="text-4xl font-bold text-neutral-900">${detailModalData?.value.toFixed(2)}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tutorial Dialog */}
      <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("reports.tutorialTitle")}</DialogTitle>
            <DialogDescription>{t("reports.tutorialDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-semibold mb-2">{t("reports.overviewTab")}</h4>
              <p className="text-sm text-neutral-600">{t("reports.overviewTabDesc")}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t("reports.profitabilityTab")}</h4>
              <p className="text-sm text-neutral-600">{t("reports.profitabilityTabDesc")}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t("reports.receivablesTab")}</h4>
              <p className="text-sm text-neutral-600">{t("reports.receivablesTabDesc")}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t("reports.timelineTab")}</h4>
              <p className="text-sm text-neutral-600">{t("reports.timelineTabDesc")}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
