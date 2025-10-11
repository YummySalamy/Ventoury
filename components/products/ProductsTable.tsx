"use client"

import { GlassCard } from "@/components/dashboard/glass-card"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FiEdit2, FiTrash2, FiEye, FiImage } from "react-icons/fi"
import Image from "next/image"
import type { Product } from "@/hooks/useProducts"
import { getContrastColor } from "@/lib/get-contrast-color"

interface ProductsTableProps {
  products: Product[]
  handleEdit: (product: Product) => void
  handleDelete: (productId: string, productName: string) => void
  handleViewHistory: (product: Product) => void // Changed from productId to full product object
  isDeleting: string | null
  t: (key: string) => string
}

export const ProductsTable = ({
  products,
  handleEdit,
  handleDelete,
  handleViewHistory,
  isDeleting,
  t,
}: ProductsTableProps) => {
  const columns = [
    {
      header: t("products.product"),
      accessor: (product: Product) => (
        <div className="flex items-center gap-2 font-medium text-neutral-900 group-hover:text-white transition-colors">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
            {product.image_url ? (
              <Image src={product.image_url || "/placeholder.svg"} alt={product.name} layout="fill" objectFit="cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiImage className="w-5 h-5 text-neutral-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{product.name}</p>
            <p className="text-xs text-neutral-500 group-hover:text-neutral-400 truncate">{product.sku}</p>
          </div>
        </div>
      ),
    },
    {
      header: t("products.category"),
      accessor: (product: Product) => {
        if (!product.category_name) {
          return (
            <Badge variant="outline" className="bg-neutral-100 text-neutral-600 border-neutral-300">
              {t("products.noCategory")}
            </Badge>
          )
        }

        const bgColor = product.category_color || "#6B7280"
        const textColor = getContrastColor(bgColor)

        return (
          <Badge
            style={{
              backgroundColor: bgColor,
              color: textColor,
              border: "none",
            }}
            className="font-medium"
          >
            {product.category_name}
          </Badge>
        )
      },
    },
    {
      header: t("products.stock"),
      accessor: (product: Product) => {
        const isOutOfStock = product.stock_quantity === 0
        const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= (product.min_stock_alert || 5)
        const isInStock = product.stock_quantity > (product.min_stock_alert || 5)

        return (
          <Badge
            className={`font-semibold ${
              isOutOfStock
                ? "bg-red-100 text-red-700 border-red-300"
                : isLowStock
                  ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                  : "bg-green-100 text-green-700 border-green-300"
            }`}
          >
            {product.stock_quantity}{" "}
            {isOutOfStock ? t("products.outOfStock") : isLowStock ? t("products.lowStock") : ""}
          </Badge>
        )
      },
    },
    {
      header: t("products.price"),
      accessor: (product: Product) => (
        <span className="font-semibold text-neutral-900 group-hover:text-white transition-colors">
          ${product.price.toFixed(2)}
        </span>
      ),
    },
    {
      header: t("products.actions"),
      accessor: (product: Product) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleViewHistory(product) // Pass full product object instead of just ID
            }}
            className="p-1.5 sm:p-2 hover:bg-blue-600 rounded-lg transition-colors text-blue-600 hover:text-white"
            title={t("products.viewHistory")}
          >
            <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(product)
            }}
            className="p-1.5 sm:p-2 hover:bg-neutral-800 rounded-lg transition-colors group-hover:text-white"
            title={t("products.edit")}
          >
            <FiEdit2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(product.id, product.name)
            }}
            disabled={isDeleting === product.id}
            className="p-1.5 sm:p-2 hover:bg-red-600 rounded-lg transition-colors text-red-600 hover:text-white"
            title={t("products.delete")}
          >
            <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <GlassCard>
      <DataTable
        data={products}
        columns={columns}
        keyExtractor={(product) => product.id}
        emptyMessage={t("products.noProductsFound")}
      />
    </GlassCard>
  )
}
