"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { FiBox, FiTrendingUp, FiDollarSign, FiAlertTriangle, FiCalendar } from "react-icons/fi"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInventory } from "@/hooks/useInventory"
import { useProducts } from "@/hooks/useProducts"
import { useLocale } from "@/contexts/LocaleContext"
import { StockStatsCard } from "@/components/stock/StockStatsCard"
import { InventoryMovementsTable } from "@/components/stock/InventoryMovementsTable"
import { Button } from "@/components/ui/button"

export default function StockPage() {
  const { t } = useLocale()
  const { getInventoryMovements } = useInventory()
  const { getInventoryStats } = useProducts()

  const [loading, setLoading] = useState(true)
  const [movements, setMovements] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  })

  const fetchData = useCallback(async () => {
    setLoading(true)

    // Fetch inventory stats
    const { data: statsData } = await getInventoryStats()
    if (statsData) {
      setStats(statsData)
    }

    // Fetch inventory movements
    const { data: movementsData } = await getInventoryMovements(dateRange.from, dateRange.to)
    if (movementsData) {
      setMovements(movementsData)
    }

    setLoading(false)
  }, [dateRange, getInventoryStats, getInventoryMovements])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate inventory value from stats
  const inventoryValue = useMemo(() => {
    if (!stats?.inventory_value) return 0
    return stats.inventory_value.at_cost || 0
  }, [stats])

  // Calculate total items from movements
  const totalItems = useMemo(() => {
    if (!stats) return 0
    return stats.total_products || 0
  }, [stats])

  // Calculate average cost
  const avgCost = useMemo(() => {
    if (!stats?.inventory_value || !stats?.total_products) return 0
    return stats.inventory_value.at_cost / stats.total_products
  }, [stats])

  // Low stock items
  const lowStockItems = useMemo(() => {
    if (!stats) return 0
    return stats.low_stock_custom || 0
  }, [stats])

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900">
              {t("nav.stock")} <span className="italic font-light text-neutral-600">{t("products.subtitle")}</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">
              Análisis detallado de inventario, movimientos y valorización
            </p>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-neutral-600" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
            />
            <span className="text-neutral-600">-</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
            />
            <Button onClick={fetchData} variant="outline" size="sm">
              {t("common.apply")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <StockStatsCard
            title="Valor Total Inventario"
            value={`$${inventoryValue.toLocaleString()}`}
            icon={FiDollarSign}
            gradient="from-blue-500 to-cyan-600"
            loading={loading}
          />
          <StockStatsCard
            title="Total Productos"
            value={totalItems}
            icon={FiBox}
            gradient="from-green-500 to-emerald-600"
            loading={loading}
          />
          <StockStatsCard
            title="Costo Promedio"
            value={`$${avgCost.toFixed(2)}`}
            icon={FiTrendingUp}
            gradient="from-purple-500 to-pink-600"
            loading={loading}
          />
          <StockStatsCard
            title={t("products.lowStock")}
            value={lowStockItems}
            icon={FiAlertTriangle}
            gradient="from-orange-500 to-red-600"
            loading={loading}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="movements" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="movements">Movimientos de Stock</TabsTrigger>
            <TabsTrigger value="valuation">Valorización de Inventario</TabsTrigger>
          </TabsList>

          <TabsContent value="movements">
            <InventoryMovementsTable movements={movements} loading={loading} />
          </TabsContent>

          <TabsContent value="valuation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4 text-neutral-900">Valorización por Costo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Valor a Costo</span>
                    <span className="font-bold text-neutral-900">
                      ${stats?.inventory_value?.at_cost?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Valor Mayorista</span>
                    <span className="font-bold text-neutral-900">
                      ${stats?.inventory_value?.at_wholesale?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Valor Minorista</span>
                    <span className="font-bold text-neutral-900">
                      ${stats?.inventory_value?.at_retail?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4 text-neutral-900">Ganancia Potencial</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Ganancia Mayorista</span>
                    <span className="font-bold text-green-600">
                      ${stats?.inventory_value?.potential_profit_wholesale?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Ganancia Minorista</span>
                    <span className="font-bold text-green-600">
                      ${stats?.inventory_value?.potential_profit_retail?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-neutral-200">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-700 font-medium">Margen Promedio</span>
                      <span className="font-bold text-neutral-900">
                        {stats?.inventory_value?.at_cost > 0
                          ? (
                              ((stats?.inventory_value?.potential_profit_retail || 0) /
                                stats?.inventory_value?.at_cost) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
