"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiInfo,
  FiList,
  FiShare2,
  FiCopy,
  FiCheck,
  FiShoppingCart,
  FiEdit,
  FiPlusCircle,
} from "react-icons/fi"
import type { ProductHistory } from "@/hooks/useInventory"
import { getContrastColor } from "@/lib/get-contrast-color"
import { ShareInvoiceModal } from "@/components/sales/ShareInvoiceModal"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
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
      return <FiPlusCircle className="w-5 h-5 text-white" />
    case "price_update":
      return <FiEdit className="w-5 h-5 text-white" />
    case "stock_update":
      return <FiTrendingUp className="w-5 h-5 text-white" />
    case "restock":
      return <FiTrendingUp className="w-5 h-5 text-white" />
    case "sale":
      return <FiShoppingCart className="w-5 h-5 text-white" />
    default:
      return <FiClock className="w-5 h-5 text-white" />
  }
}

const getChangeTypeLabel = (changeType: string) => {
  switch (changeType) {
    case "creation":
      return "text-blue-600"
    case "price_update":
      return "text-amber-500"
    case "stock_update":
      return "text-orange-500"
    case "restock":
      return "text-green-600"
    case "sale":
      return "text-purple-600"
    default:
      return "text-black"
  }
}

export const ProductHistoryDialog = ({ isOpen, onClose, product, history, loading, t }: ProductHistoryDialogProps) => {
  const [activeTab, setActiveTab] = useState("info")
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [saleToShare, setSaleToShare] = useState<any | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [marketplaceSlug, setMarketplaceSlug] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchMarketplaceSlug = async () => {
      if (!user) return

      const { data, error } = await supabase.from("profiles").select("marketplace_slug").eq("id", user.id).single()

      if (error) return

      setMarketplaceSlug(data?.marketplace_slug || null)
    }

    fetchMarketplaceSlug()
  }, [user])

  const handleShareInvoice = async (entry: ProductHistory) => {
    if (!entry.sale_id || !entry.public_token) {
      toast({
        title: "Error",
        description: "No se encontró información de la venta",
        variant: "destructive",
      })
      return
    }

    if (!marketplaceSlug) {
      toast({
        title: "Error",
        description: "No se pudo obtener el slug de la tienda",
        variant: "destructive",
      })
      return
    }

    setSaleToShare({
      public_token: entry.public_token,
      sale_number: entry.sale_number,
      marketplace_slug: marketplaceSlug,
    })
    setShareModalOpen(true)
  }

  const handleCopySaleCode = async (saleNumber: string) => {
    try {
      await navigator.clipboard.writeText(saleNumber)
      setCopiedCode(saleNumber)
      toast({
        title: t("products.history.saleCodeCopied"),
        description: `#${saleNumber}`,
      })
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el código",
        variant: "destructive",
      })
    }
  }

  if (!product) return null

  const stockStatus =
    product.stock_quantity === 0
      ? { label: t("products.outOfStock"), color: "bg-red-100 text-red-800" }
      : product.stock_quantity <= product.min_stock_alert
        ? { label: t("products.lowStock"), color: "bg-yellow-100 text-yellow-800" }
        : { label: t("products.inStock"), color: "bg-green-100 text-green-800" }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
            <DialogDescription>{t("products.productDetails")}</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <FiInfo className="w-4 h-4" />
                {t("products.history.productInfo")}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <FiList className="w-4 h-4" />
                {t("products.history.changeHistory")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="flex-1 overflow-y-auto px-1 mt-4 space-y-4">
              {/* Product Image and Basic Info */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Image */}
                <div className="w-full md:w-1/3">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
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
                <div className="flex-1 space-y-2">
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
              <div className="relative overflow-hidden rounded-xl bg-white border border-neutral-200 p-3 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
                <div className="relative">
                  <h3 className="text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
                    <FiPackage className="w-4 h-4" />
                    {t("products.stockInformation")}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="bg-white/80 rounded-lg p-2 border border-neutral-200">
                      <p className="text-xs text-neutral-600 mb-0.5">{t("products.currentStock")}</p>
                      <p className="text-xl font-bold text-neutral-900">{product.stock_quantity}</p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2 border border-neutral-200">
                      <p className="text-xs text-neutral-600 mb-0.5">{t("products.minStockAlert")}</p>
                      <p className="text-xl font-bold text-orange-600">{product.min_stock_alert}</p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2 border border-neutral-200">
                      <p className="text-xs text-neutral-600 mb-0.5">{t("products.createdAt")}</p>
                      <p className="text-sm font-semibold text-neutral-900">
                        {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="relative overflow-hidden rounded-xl bg-white border border-neutral-200 p-3 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
                <div className="relative">
                  <h3 className="text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4" />
                    {t("products.pricingInformation")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="bg-white/80 rounded-lg p-2 border border-neutral-200">
                      <p className="text-xs text-neutral-600 mb-0.5">{t("products.costPrice")}</p>
                      <p className="text-xl font-bold text-neutral-900">
                        ${product.cost_price != null ? product.cost_price.toFixed(2) : "0.00"}
                      </p>
                    </div>
                    {product.wholesale_price !== null && (
                      <div className="bg-white/80 rounded-lg p-2 border border-neutral-200">
                        <p className="text-xs text-neutral-600 mb-0.5">{t("products.wholesalePrice")}</p>
                        <p className="text-xl font-bold text-blue-600">${product.wholesale_price.toFixed(2)}</p>
                      </div>
                    )}
                    <div className="bg-white/80 rounded-lg p-2 border border-neutral-200">
                      <p className="text-xs text-neutral-600 mb-0.5">{t("products.retailPrice")}</p>
                      <p className="text-xl font-bold text-green-600">
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
                <div className="flex flex-col justify-center items-center h-40 text-neutral-600">
                  <FiClock className="w-12 h-12 mb-3" />
                  <p className="text-lg font-medium">{t("products.history.noHistory")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((entry: ProductHistory) => (
                    <div
                      key={entry.id}
                      className="bg-white border border-neutral-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-neutral-300"
                    >
                      {/* Header with icon and type */}
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="p-3 bg-gradient-to-br from-black to-neutral-800 rounded-xl shadow-md">
                            {getChangeTypeIcon(entry.change_type)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <h4 className="font-bold text-base text-neutral-900 capitalize">
                              {t(`products.changeType.${entry.change_type}`)}
                            </h4>
                            <span className="text-xs text-neutral-500 whitespace-nowrap">
                              {new Date(entry.created_at).toLocaleString()}
                            </span>
                          </div>

                          {entry.change_type === "sale" && (
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-3">
                                <Badge
                                  variant="outline"
                                  className="font-mono bg-purple-50 border-purple-200 text-purple-700 font-semibold flex items-center gap-1.5 px-2.5 py-1"
                                >
                                  #{entry.sale_number}
                                  <button
                                    onClick={() => handleCopySaleCode(entry.sale_number || "")}
                                    className="ml-1 p-1 hover:bg-purple-100 rounded transition-colors"
                                    title={t("products.history.copySaleCode")}
                                  >
                                    {copiedCode === entry.sale_number ? (
                                      <FiCheck className="w-3.5 h-3.5 text-green-600" />
                                    ) : (
                                      <FiCopy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </Badge>

                                {entry.price && (
                                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                                    <span className="text-xs text-neutral-600 font-medium">
                                      {t("products.history.price")}:
                                    </span>
                                    <span className="text-sm font-bold text-green-600">${entry.price.toFixed(2)}</span>
                                  </div>
                                )}

                                {entry.quantity_changed && entry.quantity_changed < 0 && (
                                  <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5">
                                    <span className="text-xs text-neutral-600 font-medium">
                                      {t("products.history.qty")}:
                                    </span>
                                    <span className="text-sm font-bold text-neutral-900">
                                      {Math.abs(entry.quantity_changed)}
                                    </span>
                                  </div>
                                )}

                                {entry.quantity_changed && entry.quantity_changed < 0 && (
                                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                    <span className="text-xs text-neutral-600 font-medium">
                                      {t("products.history.stockDecrease")}:
                                    </span>
                                    <span className="text-sm font-bold text-red-600">{entry.quantity_changed}</span>
                                  </div>
                                )}
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleShareInvoice(entry)}
                                disabled={!entry.public_token}
                                className="text-xs h-8 bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900 font-semibold"
                              >
                                <FiShare2 className="w-3.5 h-3.5 mr-1.5" />
                                {t("products.history.shareInvoice")}
                              </Button>
                            </div>
                          )}

                          {(entry.change_type === "stock_update" || entry.change_type === "restock") && (
                            <div className="flex flex-wrap gap-3">
                              {entry.stock_before !== null && (
                                <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
                                  <span className="text-xs text-neutral-600 font-medium">
                                    {t("products.history.before")}:
                                  </span>
                                  <span className="text-base font-bold text-neutral-900">{entry.stock_before}</span>
                                </div>
                              )}
                              {entry.stock_after !== null && (
                                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                  <span className="text-xs text-neutral-600 font-medium">
                                    {t("products.history.after")}:
                                  </span>
                                  <span className="text-base font-bold text-green-600">{entry.stock_after}</span>
                                </div>
                              )}
                              {entry.quantity_added && entry.quantity_added > 0 && (
                                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                  <span className="text-xs text-neutral-600 font-medium">
                                    {t("products.history.added")}:
                                  </span>
                                  <span className="text-base font-bold text-green-600">+{entry.quantity_added}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {entry.change_type === "price_update" && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {entry.cost_price !== null && (
                                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-2.5">
                                  <p className="text-xs text-neutral-600 font-medium mb-1">
                                    {t("products.history.cost")}
                                  </p>
                                  <p className="text-sm font-bold text-neutral-900">${entry.cost_price.toFixed(2)}</p>
                                </div>
                              )}
                              {entry.wholesale_price !== null && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                                  <p className="text-xs text-neutral-600 font-medium mb-1">
                                    {t("products.history.wholesale")}
                                  </p>
                                  <p className="text-sm font-bold text-blue-600">${entry.wholesale_price.toFixed(2)}</p>
                                </div>
                              )}
                              {entry.retail_price !== null && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                                  <p className="text-xs text-neutral-600 font-medium mb-1">
                                    {t("products.history.retail")}
                                  </p>
                                  <p className="text-sm font-bold text-green-600">${entry.retail_price.toFixed(2)}</p>
                                </div>
                              )}
                              {entry.price !== null && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                                  <p className="text-xs text-neutral-600 font-medium mb-1">
                                    {t("products.history.salePrice")}
                                  </p>
                                  <p className="text-sm font-bold text-green-600">${entry.price.toFixed(2)}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {entry.change_type === "creation" && (
                            <div className="flex flex-wrap gap-3">
                              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                <span className="text-xs text-neutral-600 font-medium">
                                  {t("products.history.initialStock")}:
                                </span>
                                <span className="text-base font-bold text-blue-600">{entry.stock_after ?? 0}</span>
                              </div>
                              {entry.price !== null && (
                                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                  <span className="text-xs text-neutral-600 font-medium">
                                    {t("products.history.initialPrice")}:
                                  </span>
                                  <span className="text-sm font-bold text-green-600">${entry.price.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {entry.notes && (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs text-neutral-900 font-semibold mb-1">
                                {t("products.history.notes")}
                              </p>
                              <p className="text-sm text-neutral-700">{entry.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {saleToShare && (
        <ShareInvoiceModal
          publicToken={saleToShare.public_token}
          saleNumber={saleToShare.sale_number}
          marketplaceSlug={saleToShare.marketplace_slug}
          open={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false)
            setSaleToShare(null)
          }}
        />
      )}
    </>
  )
}
