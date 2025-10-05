"use client"
import { motion } from "framer-motion"
import { Calendar, Download, DollarSign, TrendingUp, ShoppingCart, Eye } from "lucide-react"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Button } from "@/components/ui/button"

const sales = [
  { id: "#12345", customer: "John Doe", date: "2024-01-15", amount: "$234.00", status: "Completed", items: 3 },
  { id: "#12344", customer: "Jane Smith", date: "2024-01-15", amount: "$567.00", status: "Completed", items: 5 },
  { id: "#12343", customer: "Bob Johnson", date: "2024-01-14", amount: "$123.00", status: "Pending", items: 2 },
  { id: "#12342", customer: "Alice Brown", date: "2024-01-14", amount: "$890.00", status: "Completed", items: 7 },
  { id: "#12341", customer: "Charlie Wilson", date: "2024-01-13", amount: "$456.00", status: "Cancelled", items: 4 },
]

export default function SalesHistoryPage() {
  return (
    <div className="p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">
              Sales <span className="italic font-light text-neutral-600">History</span>
            </h1>
            <p className="text-neutral-600 mt-2">View and analyze all your sales transactions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Filter Date
            </Button>
            <Button className="bg-neutral-900 hover:bg-neutral-800">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Revenue</p>
                <p className="text-2xl font-bold text-neutral-900">$45,231</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Orders</p>
                <p className="text-2xl font-bold text-neutral-900">1,234</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-neutral-900">$36.67</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Order ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Customer</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Items</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <motion.tr
                    key={sale.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-neutral-100 hover:bg-neutral-900 group transition-all duration-300"
                  >
                    <td className="py-4 px-4 font-mono text-neutral-900 group-hover:text-white transition-colors">
                      {sale.id}
                    </td>
                    <td className="py-4 px-4 font-medium text-neutral-900 group-hover:text-white transition-colors">
                      {sale.customer}
                    </td>
                    <td className="py-4 px-4 text-neutral-600 group-hover:text-neutral-300 transition-colors">
                      {sale.date}
                    </td>
                    <td className="py-4 px-4 text-neutral-600 group-hover:text-neutral-300 transition-colors">
                      {sale.items}
                    </td>
                    <td className="py-4 px-4 font-semibold text-neutral-900 group-hover:text-white transition-colors">
                      {sale.amount}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          sale.status === "Completed"
                            ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                            : sale.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700 group-hover:bg-yellow-200"
                              : "bg-red-100 text-red-700 group-hover:bg-red-200"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors group-hover:text-white">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
