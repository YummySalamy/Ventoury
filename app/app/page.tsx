"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Users, Package, DollarSign, ArrowUpRight, ArrowDownRight, ShoppingCart, Trash2 } from "lucide-react"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "@/hooks/useTranslation"

interface DashboardOverview {
  total_revenue: {
    current: number
    previous: number
    percentage_change: number
  }
  active_customers: {
    current: number
    previous: number
    percentage_change: number
  }
  products_in_stock: {
    current: number
    low_stock_count: number
    out_of_stock_count: number
  }
  sales_today: {
    count: number
    total_amount: number
  }
}

interface RecentActivity {
  activity_type: string // Updated to match new backend format
  title: string
  description: string
  amount: number | null
  amount_type: "revenue" | "cost" | null // Added amount_type
  created_at: string
  related_id: string
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString("en-US")
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [activityLimit, setActivityLimit] = useState(10)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return

      setLoading(true)
      setActivityError(null) // Reset error state

      try {
        // Load both functions in parallel
        const [overviewRes, activityRes] = await Promise.all([
          supabase.rpc("get_dashboard_overview", { user_uuid: user.id }),
          supabase.rpc("get_recent_activity", { user_uuid: user.id, limit_count: activityLimit }), // Use activityLimit for initial load
        ])

        if (overviewRes.error) {
          setActivityError("Failed to load overview") // Removed console.log, only set error state
        } else {
          setOverview(overviewRes.data)
        }

        if (activityRes.error) {
          setActivityError(activityRes.error.message) // Removed console.log, only set error state
        } else {
          setRecentActivity(activityRes.data || [])
          setHasMore((activityRes.data || []).length === activityLimit) // Removed console.log
        }
      } catch (error) {
        setActivityError("Failed to load dashboard") // Removed console.error
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [user, activityLimit])

  const loadMoreActivity = async () => {
    if (!user || loadingMore) return

    setLoadingMore(true)
    const newLimit = activityLimit + 10

    try {
      const { data, error } = await supabase.rpc("get_recent_activity", {
        user_uuid: user.id,
        limit_count: newLimit,
      })

      if (!error && data) {
        setRecentActivity(data)
        setActivityLimit(newLimit)
        setHasMore(data.length === newLimit)
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoadingMore(false)
    }
  }

  const getActivityRoute = (activity: RecentActivity) => {
    switch (activity.activity_type) {
      case "product_created":
      case "product_updated":
      case "product_deleted":
        return "/app/inventory/products"
      case "sale_created":
      case "sale_updated":
        return "/app/sales/history"
      case "customer_created":
        return "/app/customers/list"
      default:
        return null
    }
  }

  const getActivityStyle = (type: string) => {
    switch (type) {
      case "sale_created":
      case "sale_updated":
      case "sale":
        return { icon: ShoppingCart, color: "from-green-500 to-emerald-600", textColor: "text-green-700" }
      case "product_created":
      case "product_updated":
      case "product":
        return { icon: Package, color: "from-blue-500 to-indigo-600", textColor: "text-blue-700" }
      case "product_deleted":
        return { icon: Trash2, color: "from-red-500 to-orange-600", textColor: "text-red-700" }
      case "customer_created":
      case "customer":
        return { icon: Users, color: "from-purple-500 to-pink-600", textColor: "text-purple-700" }
      case "alert":
        return { icon: Package, color: "from-orange-500 to-red-600", textColor: "text-orange-700" }
      default:
        return { icon: Package, color: "from-neutral-500 to-neutral-600", textColor: "text-neutral-700" }
    }
  }

  const formatAmount = (amount: number | null, amountType: "revenue" | "cost" | null) => {
    if (amount === null) return null

    const isRevenue = amountType === "revenue"
    const colorClass = isRevenue
      ? "text-green-600 group-hover:text-green-400"
      : "text-blue-700 group-hover:text-blue-400"
    const prefix = isRevenue ? "+" : ""

    return (
      <p className={`font-semibold text-sm sm:text-base ${colorClass} transition-colors`}>
        {prefix}${amount.toFixed(2)}
      </p>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
          {t("dashboard.title")} <span className="italic font-light text-neutral-600">{t("dashboard.subtitle")}</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 mb-6 sm:mb-8">{t("dashboard.welcomeMessage")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {loading ? (
            // Skeleton loaders
            <>
              {[1, 2, 3, 4].map((i) => (
                <GlassCard key={i}>
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </GlassCard>
              ))}
            </>
          ) : overview ? (
            <>
              {/* Total Revenue */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0 }}
              >
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${
                        overview.total_revenue.percentage_change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {overview.total_revenue.percentage_change >= 0 ? (
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      {overview.total_revenue.percentage_change >= 0 ? "+" : ""}
                      {overview.total_revenue.percentage_change.toFixed(1)}%
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">
                    ${overview.total_revenue.current.toLocaleString()}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600">{t("dashboard.totalRevenue")}</p>
                </GlassCard>
              </motion.div>

              {/* Active Customers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${
                        overview.active_customers.percentage_change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {overview.active_customers.percentage_change >= 0 ? (
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      {overview.active_customers.percentage_change >= 0 ? "+" : ""}
                      {overview.active_customers.percentage_change.toFixed(1)}%
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">
                    {overview.active_customers.current.toLocaleString()}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600">{t("dashboard.activeCustomers")}</p>
                </GlassCard>
              </motion.div>

              {/* Products in Stock */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-600">
                      {overview.products_in_stock.low_stock_count} {t("dashboard.lowStock")}
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">
                    {overview.products_in_stock.current.toLocaleString()}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600">{t("dashboard.productsInStock")}</p>
                </GlassCard>
              </motion.div>

              {/* Sales Today */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600">
                      ${overview.sales_today.total_amount.toLocaleString()}
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">{overview.sales_today.count}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600">{t("dashboard.salesToday")}</p>
                </GlassCard>
              </motion.div>
            </>
          ) : (
            <div className="col-span-full text-center text-neutral-600">{t("dashboard.errorLoading")}</div>
          )}
        </div>

        <GlassCard className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6">
            {t("dashboard.recentActivity")}{" "}
            <span className="italic font-light text-neutral-600">{t("dashboard.activitySubtitle")}</span>
          </h2>
          <div className="space-y-0 divide-y divide-neutral-200/50 max-h-[600px] overflow-y-auto">
            {loading ? (
              // Skeleton loaders for activity
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Skeleton className="h-5 w-20 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </>
            ) : activityError ? (
              <div className="p-6 text-center">
                <p className="text-neutral-600 mb-2">{t("dashboard.unableToLoad")}</p>
                <p className="text-sm text-neutral-500">{activityError}</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="p-6 text-center text-neutral-500">{t("dashboard.noActivity")}</p>
            ) : (
              recentActivity.map((activity, index) => {
                const activityStyle = getActivityStyle(activity.activity_type)
                const ActivityIcon = activityStyle.icon
                const route = getActivityRoute(activity)

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => route && router.push(route)}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-neutral-900 hover:text-white group ${
                      route ? "cursor-pointer" : ""
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                      <div
                        className={`p-2 sm:p-2.5 bg-gradient-to-br ${activityStyle.color} rounded-lg shadow-md relative`}
                      >
                        <ActivityIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/20 to-transparent" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-sm sm:text-base ${activityStyle.textColor} group-hover:text-white transition-colors truncate`}
                      >
                        {activity.title}
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-300 transition-colors truncate">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {formatAmount(activity.amount, activity.amount_type)}
                      <p className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors whitespace-nowrap">
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>

          {!loading && !activityError && hasMore && recentActivity.length >= activityLimit && (
            <div className="pt-4 text-center border-t border-neutral-200/50 mt-4">
              <Button
                variant="ghost"
                onClick={loadMoreActivity}
                disabled={loadingMore}
                className="text-neutral-700 hover:text-neutral-900"
              >
                {loadingMore ? t("common.loading") : t("common.loadMore")}
              </Button>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}
