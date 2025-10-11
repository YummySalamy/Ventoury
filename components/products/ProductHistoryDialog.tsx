"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FiPackage, FiDollarSign, FiTrendingUp, FiClock, FiInfo, FiList } from "react-icons/fi"
import type { ProductHistory } from "@/hooks/useInventory"
import { getContrastColor } from "@/lib/get-contrast-color"
import Image from "next/image"

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  stock_quantity: number
  min_stock_alert: number
  cost_price: number | null
  wholesale_price: number | null
  retail_price: number | null
  category_name: string | null
  category_color: string | null
  image_url: string | null
  created_at: string
}

interface ProductHistoryDialogProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  history: ProductHistory[]
  loading: boolean
  t: (key: string, vars?: Record<string, any>) => string
}

const getChangeTypeIcon = (changeType: string) => {
  switch (changeType) {
    case "creation":
      return <FiPackage className="w-4 h-4" />
    case "price_update":
      return <FiDollarSign className="w-4 h-4" />
    case "stock_update":
    case "restock":
      return <FiTrendingUp className="w-4 h-4" />
    case "sale":
      return <FiDollarSign className="w-4 h-4" />
    default:
      return <FiClock className="w-4 h-4" />
  }
}

const getChangeTypeColor = (changeType: string) => {
  switch (changeType) {
    case "creation":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "price_update":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "stock_update":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "restock":
      return "bg-green-100 text-green-800 border-green-200"
    case "sale":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-neutral-100 text-neutral-800 border-neutral-200"
  }
}

export const ProductHistoryDialog = ({ isOpen, onClose, product, history, loading, t }: ProductHistoryDialogProps) => {
  const [activeTab, setActiveTab] = useState("info")

  if (!product) return null

  const stockStatus =
    product.stock_quantity === 0
      ? { label: t("products.outOfStock"), color: "bg-red-100 text-red-800" }
      : product.stock_quantity <= product.min_stock_alert
        ? { label: t("products.lowStock"), color: "bg-yellow-100 text-yellow-800" }
        : { label: t("products.inStock"), color: "bg-green-100 text-green-800" }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <DialogDescription>{t("products.productDetails")}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <FiInfo className="w-4 h-4" />
              {t("products.productInfo")}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FiList className="w-4 h-4" />
              {t("products.history")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto px-1 mt-4">
            <div className="space-y-6">
              {/* Product Image and Basic Info */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-1/3">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border-2 border-neutral-200">
                    {product.image_url ? (
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FiPackage className="w-16 h-16 text-neutral-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                      {t("products.sku")}
                    </label>
                    <p className="text-lg font-mono font-bold text-neutral-900">{product.sku}</p>
                  </div>

                  {product.description && (
                    <div>
                      <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                        {t("products.description")}
                      </label>
                      <p className="text-sm text-neutral-700 mt-1">{product.description}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {product.category_name && (
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-1">
                          {t("products.category")}
                        </label>
                        <Badge
                          style={{
                            backgroundColor: product.category_color || "#6b7280",
                            color: getContrastColor(product.category_color || "#6b7280"),
                          }}
                          className="text-sm font-semibold"
                        >
                          {product.category_name}
                        </Badge>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-1">
                        {t("products.status")}
                      </label>
                      <Badge className={`${stockStatus.color} text-sm font-semibold`}>{stockStatus.label}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <FiPackage className="w-5 h-5" />
                  {t("products.stockInformation")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-neutral-200">
                    <p className="text-xs text-neutral-600 mb-1">{t("products.currentStock")}</p>
                    <p className="text-2xl font-bold text-neutral-900">{product.stock_quantity}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-neutral-200">
                    <p className="text-xs text-neutral-600 mb-1">{t("products.minStockAlert")}</p>
                    <p className="text-2xl font-bold text-orange-600">{product.min_stock_alert}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-neutral-200">
                    <p className="text-xs text-neutral-600 mb-1">{t("products.createdAt")}</p>
                    <p className="text-sm font-semibold text-neutral-900">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <FiDollarSign className="w-5 h-5" />
                  {t("products.pricingInformation")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-neutral-200">
                    <p className="text-xs text-neutral-600 mb-1">{t("products.costPrice")}</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      ${product.cost_price != null ? product.cost_price.toFixed(2) : "0.00"}
                    </p>
                  </div>
                  {product.wholesale_price !== null && (
                    <div className="bg-white rounded-lg p-4 border-2 border-neutral-200">
                      <p className="text-xs text-neutral-600 mb-1">{t("products.wholesalePrice")}</p>
                      <p className="text-2xl font-bold text-blue-600">${product.wholesale_price.toFixed(2)}</p>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-4 border-2 border-neutral-200">
                    <p className="text-xs text-neutral-600 mb-1">{t("products.retailPrice")}</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${product.retail_price != null ? product.retail_price.toFixed(2) : "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-y-auto px-1 mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-40 text-neutral-500">
                <FiClock className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-lg font-medium">{t("products.noHistoryFound")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((entry: ProductHistory) => (
                  <div key={entry.id} className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getChangeTypeColor(entry.change_type)}`}>
                          {getChangeTypeIcon(entry.change_type)}
                        </div>
                        <div>
                          <Badge
                            variant="outline"
                            className={`text-xs font-semibold capitalize ${getChangeTypeColor(entry.change_type)}`}
                          >
                            {t(`products.changeType.${entry.change_type}`)}
                          </Badge>
                          <p className="text-xs text-neutral-500 mt-1">{new Date(entry.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {/* Stock Changes */}
                      {(entry.change_type === "stock_update" ||
                        entry.change_type === "restock" ||
                        entry.change_type === "sale") && (
                        <>
                          {entry.stock_before !== null && (
                            <div className="bg-neutral-50 rounded-lg p-3">
                              <p className="text-xs text-neutral-600 mb-1">{t("products.stockBefore")}</p>
                              <p className="text-lg font-bold text-neutral-900">{entry.stock_before}</p>
                            </div>
                          )}
                          {entry.stock_after !== null && (
                            <div className="bg-neutral-50 rounded-lg p-3">
                              <p className="text-xs text-neutral-600 mb-1">{t("products.stockAfter")}</p>
                              <p
                                className={`text-lg font-bold ${
                                  entry.change_type === "sale" ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {entry.stock_after}
                              </p>
                            </div>
                          )}
                          {entry.quantity_added && entry.quantity_added > 0 && (
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="text-xs text-green-700 mb-1">{t("products.quantityAdded")}</p>
                              <p className="text-lg font-bold text-green-600">+{entry.quantity_added}</p>
                            </div>
                          )}
                          {entry.quantity_added && entry.quantity_added < 0 && (
                            <div className="bg-red-50 rounded-lg p-3">
                              <p className="text-xs text-red-700 mb-1">{t("products.quantitySold")}</p>
                              <p className="text-lg font-bold text-red-600">{entry.quantity_added}</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Price Changes */}
                      {entry.change_type === "price_update" && (
                        <>
                          {entry.cost_price !== null && (
                            <div className="bg-neutral-50 rounded-lg p-3">
                              <p className="text-xs text-neutral-600 mb-1">{t("products.costPrice")}</p>
                              <p className="text-sm font-bold text-neutral-900">${entry.cost_price.toFixed(2)}</p>
                            </div>
                          )}
                          {entry.price !== null && (
                            <div className="bg-neutral-50 rounded-lg p-3">
                              <p className="text-xs text-neutral-600 mb-1">{t("products.salePrice")}</p>
                              <p className="text-sm font-bold text-neutral-900">${entry.price.toFixed(2)}</p>
                            </div>
                          )}
                          {entry.wholesale_price !== null && (
                            <div className="bg-neutral-50 rounded-lg p-3">
                              <p className="text-xs text-neutral-600 mb-1">{t("products.wholesalePrice")}</p>
                              <p className="text-sm font-bold text-neutral-900">${entry.wholesale_price.toFixed(2)}</p>
                            </div>
                          )}
                          {entry.retail_price !== null && (
                            <div className="bg-neutral-50 rounded-lg p-3">
                              <p className="text-xs text-neutral-600 mb-1">{t("products.retailPrice")}</p>
                              <p className="text-sm font-bold text-neutral-900">${entry.retail_price.toFixed(2)}</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Creation Details */}
                      {entry.change_type === "creation" && (
                        <>
                          <div className="bg-neutral-50 rounded-lg p-3">
                            <p className="text-xs text-neutral-600 mb-1">{t("products.initialStock")}</p>
                            <p className="text-lg font-bold text-neutral-900">{entry.stock_after ?? 0}</p>
                          </div>
                          {entry.price !== null && (
                            <div className="bg-neutral-50 rounded-lg p-3">
                              <p className="text-xs text-neutral-600 mb-1">{t("products.initialPrice")}</p>
                              <p className="text-sm font-bold text-neutral-900">${entry.price.toFixed(2)}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Notes */}
                    {entry.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700 font-semibold mb-1">{t("common.notes")}</p>
                        <p className="text-sm text-blue-900">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
