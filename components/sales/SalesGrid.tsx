"use client"

import { motion } from "framer-motion"
import { Eye, Share2, MessageCircle, Calendar, DollarSign, Package, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/dashboard/glass-card"

interface SalesGridProps {
  sales: any[]
  onViewDetails: (sale: any) => void
  onShareInvoice: (sale: any) => void
  onOpenWhatsApp: (phone: string, name: string) => void
  t: (key: string) => string
}

export function SalesGrid({ sales, onViewDetails, onShareInvoice, onOpenWhatsApp, t }: SalesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr bg-transparent">
      {sales.map((sale: any, index) => (
        <motion.div
          key={sale.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="h-full"
        >
          <GlassCard
            className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group border border-neutral-200 h-full flex flex-col"
            style={{ background: "transparent" }}
          >
            <div onClick={() => onViewDetails(sale)} className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate group-hover:text-neutral-900 transition-colors">
                      {sale.customers?.name || t("sales.walkIn")}
                    </h3>
                    <p className="text-xs text-neutral-500 truncate">
                      {t("sales.saleNumber")}: {sale.sale_number}
                    </p>
                  </div>
                </div>
                <Badge
                  className={`flex-shrink-0 ml-2 text-xs ${
                    sale.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : sale.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : sale.status === "partial"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                  }`}
                >
                  {t(`sales.status.${sale.status}`)}
                </Badge>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Calendar className="w-4 h-4 flex-shrink-0 text-neutral-400" />
                  <span className="truncate">{new Date(sale.sale_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Package className="w-4 h-4 flex-shrink-0 text-neutral-400" />
                  <span className="truncate">
                    {sale.sale_items?.length || 0} {t("sales.items")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <DollarSign className="w-4 h-4 flex-shrink-0 text-neutral-400" />
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="capitalize">{t(`sales.paymentType.${sale.payment_type}`)}</span>
                    {sale.payment_type === "credit" && sale.paid_installments !== undefined && (
                      <span className="text-xs text-neutral-500">
                        ({sale.paid_installments}/{sale.total_installments})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="pt-3 border-t border-neutral-200 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">{t("sales.total")}</span>
                  <span className="text-xl font-bold text-neutral-900">${sale.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-neutral-200">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails(sale)
                }}
                className="flex-1 p-2 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center"
                title={t("sales.viewDetails")}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShareInvoice(sale)
                }}
                className="flex-1 p-2 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center text-blue-600"
                title={t("sales.shareInvoice")}
              >
                <Share2 className="w-4 h-4" />
              </button>
              {sale.payment_type === "credit" && sale.customers?.phone && sale.status !== "paid" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenWhatsApp(sale.customers.phone, sale.customers.name)
                  }}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  )
}
