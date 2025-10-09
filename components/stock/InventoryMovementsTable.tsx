"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { FiArrowUp, FiArrowDown, FiPackage } from "react-icons/fi"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "@/contexts/LocaleContext"
import type { InventoryMovement } from "@/hooks/useInventory"

interface InventoryMovementsTableProps {
  movements: InventoryMovement[]
  loading: boolean
}

export function InventoryMovementsTable({ movements, loading }: InventoryMovementsTableProps) {
  const { t } = useLocale()

  const sortedMovements = useMemo(() => {
    return [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [movements])

  if (loading) {
    return (
      <GlassCard>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </GlassCard>
    )
  }

  if (movements.length === 0) {
    return (
      <GlassCard>
        <div className="flex flex-col items-center justify-center py-12">
          <FiPackage className="w-12 h-12 text-neutral-400 mb-4" />
          <p className="text-neutral-600 text-center">No hay movimientos de inventario en este período</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Producto</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Tipo</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700">
                {t("products.stockBefore")}
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700">
                {t("products.stockAfter")}
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700">Cambio</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {sortedMovements.map((movement, index) => (
              <motion.tr
                key={`${movement.product_id}-${movement.date}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-neutral-900">{movement.product_name}</p>
                    <p className="text-sm text-neutral-500">{movement.sku}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {movement.change_type === "restock" ? (
                      <>
                        <FiArrowUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">Restock</span>
                      </>
                    ) : movement.change_type === "sale" ? (
                      <>
                        <FiArrowDown className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700 font-medium">Venta</span>
                      </>
                    ) : (
                      <span className="text-sm text-neutral-600">{movement.change_type}</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-neutral-700">{movement.stock_before}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-neutral-700">{movement.stock_after}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`font-semibold ${movement.quantity_changed > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {movement.quantity_changed > 0 ? "+" : ""}
                    {movement.quantity_changed}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-sm text-neutral-600">
                  {new Date(movement.date).toLocaleDateString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
