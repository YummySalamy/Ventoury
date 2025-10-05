"use client"
import { motion } from "framer-motion"
import { Users, Package, DollarSign, ArrowUpRight, ArrowDownRight, ShoppingCart } from "lucide-react"
import { GlassCard } from "@/components/dashboard/glass-card"

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    category: "revenue",
  },
  {
    title: "Active Customers",
    value: "2,345",
    change: "+15.3%",
    trend: "up",
    icon: Users,
    color: "from-blue-500 to-cyan-600",
    category: "customer",
  },
  {
    title: "Products in Stock",
    value: "1,234",
    change: "-5.2%",
    trend: "down",
    icon: Package,
    color: "from-purple-500 to-pink-600",
    category: "product",
  },
  {
    title: "Sales Today",
    value: "89",
    change: "+12.5%",
    trend: "up",
    icon: ShoppingCart,
    color: "from-orange-500 to-red-600",
    category: "sale",
  },
]

const recentActivity = [
  { action: "New sale", customer: "John Doe", amount: "$234.00", time: "2 minutes ago", category: "sale" },
  { action: "Product added", customer: "System", amount: "15 units", time: "15 minutes ago", category: "product" },
  { action: "New customer", customer: "Jane Smith", amount: "—", time: "1 hour ago", category: "customer" },
  { action: "Stock alert", customer: "System", amount: "Low stock", time: "2 hours ago", category: "product" },
]

export default function DashboardPage() {
  const getCategoryStyle = (category: string) => {
    const stat = stats.find((s) => s.category === category)
    return stat ? { icon: stat.icon } : { icon: Package }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
          Dashboard <span className="italic font-light text-neutral-600">Overview</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 mb-6 sm:mb-8">
          Here's what's happening with your business today.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 sm:p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">{stat.value}</h3>
                <p className="text-xs sm:text-sm text-neutral-600">{stat.title}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <GlassCard className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6">
            Recent <span className="italic font-light text-neutral-600">Activity</span>
          </h2>
          <div className="space-y-0 divide-y divide-neutral-200/50">
            {recentActivity.map((activity, index) => {
              const categoryStyle = getCategoryStyle(activity.category)
              const CategoryIcon = categoryStyle.icon

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-neutral-900 group"
                >
                  <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                    <div className="p-2 sm:p-2.5 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 rounded-lg shadow-md relative">
                      <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
                      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/20 to-transparent" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-neutral-900 group-hover:text-white transition-colors truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-300 transition-colors truncate">
                      {activity.customer}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm sm:text-base text-neutral-900 group-hover:text-white transition-colors">
                      {activity.amount}
                    </p>
                    <p className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors whitespace-nowrap">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
