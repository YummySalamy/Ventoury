"use client"

import { GlassCard } from "@/components/dashboard/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FiEdit2, FiTrash2, FiClock, FiImage } from "react-icons/fi"
import Image from "next/image"
import type { Product } from "@/hooks/useProducts"

interface ProductsGridProps {
  products: Product[]
  handleEdit: (product: Product) => void
  handleDelete: (productId: string, productName: string) => void
  handleViewHistory: (productId: string) => void
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
    {products.map((product: Product) => (
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

        {/* Category and Stock Badge */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <span className="text-xs sm:text-sm text-neutral-600 truncate">
            {product.category?.name || t("products.noCategory")}
          </span>
          <Badge
            variant={
              product.stock_quantity === 0
                ? "secondary"
                : product.stock_quantity < (product.min_stock_alert || 5)
                  ? "destructive"
                  : "default"
            }
            className={`${
              product.stock_quantity === 0
                ? "bg-neutral-200 text-neutral-700"
                : product.stock_quantity < (product.min_stock_alert || 5)
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
            } whitespace-nowrap`}
          >
            {product.stock_quantity} {t("products.units")}
          </Badge>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
          <p className="text-xl sm:text-2xl font-bold text-neutral-900">${product.price.toFixed(2)}</p>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(product)}
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <FiEdit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(product.id, product.name)}
              disabled={isDeleting === product.id}
              className="hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewHistory(product.id)}
              className="hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <FiClock className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlassCard>
    ))}
  </div>
)
