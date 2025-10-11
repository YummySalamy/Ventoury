"use client"

import { GlassCard } from "@/components/dashboard/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FiEdit2, FiTrash2, FiEye, FiImage } from "react-icons/fi"
import Image from "next/image"
import type { Product } from "@/hooks/useProducts"
import { getContrastColor } from "@/lib/get-contrast-color"

interface ProductsGridProps {
  products: Product[]
  handleEdit: (product: Product) => void
  handleDelete: (productId: string, productName: string) => void
  handleViewHistory: (product: Product) => void // Changed from productId to full product object
  isDeleting: string | null
  t: (key: string) => string
}

export const ProductsGrid = ({
  products,
  handleEdit,
  handleDelete,
  isDeleting,
  t,
  handleViewHistory,
}: ProductsGridProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
    {products.map((product: Product) => {
      const isOutOfStock = product.stock_quantity === 0
      const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= (product.min_stock_alert || 5)

      const categoryBgColor = product.category_color || "#6B7280"
      const categoryTextColor = getContrastColor(categoryBgColor)

      return (
        <GlassCard
          key={product.id}
          className="p-4 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-shadow"
        >
          {/* Product Image and Name */}
          <div className="flex items-start gap-3 mb-4">
            <div className="relative w-20 h-20 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
              {product.image_url ? (
                <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiImage className="w-8 h-8 text-neutral-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 line-clamp-2 mb-1">{product.name}</h3>
              <p className="text-xs sm:text-sm text-neutral-500 truncate">{product.sku}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            {product.category_name ? (
              <Badge
                style={{
                  backgroundColor: categoryBgColor,
                  color: categoryTextColor,
                }}
                className="text-xs font-medium w-fit"
              >
                {product.category_name}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-neutral-100 text-neutral-600 border-neutral-300 text-xs w-fit">
                {t("products.noCategory")}
              </Badge>
            )}

            <Badge
              className={`whitespace-nowrap text-xs font-semibold ${
                isOutOfStock
                  ? "bg-red-100 text-red-700 border-red-300"
                  : isLowStock
                    ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                    : "bg-green-100 text-green-700 border-green-300"
              }`}
            >
              {product.stock_quantity}{" "}
              {isOutOfStock ? t("products.outOfStock") : isLowStock ? t("products.lowStock") : t("products.units")}
            </Badge>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
            <p className="text-xl sm:text-2xl font-bold text-neutral-900">${product.price.toFixed(2)}</p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewHistory(product)} // Pass full product object instead of just ID
                className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title={t("products.viewHistory")}
              >
                <FiEye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(product)}
                className="hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                title={t("products.edit")}
              >
                <FiEdit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(product.id, product.name)}
                disabled={isDeleting === product.id}
                className="hover:bg-red-50 hover:text-red-600 transition-colors"
                title={t("products.delete")}
              >
                <FiTrash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </GlassCard>
      )
    })}
  </div>
)
