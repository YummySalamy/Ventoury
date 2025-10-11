"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Package, Clock, DollarSign, Tag, ImageIcon, Calendar, TrendingUp, ShoppingCart, Share2 } from "lucide-react"
import { useInventory } from "@/hooks/useInventory"
import { useLocale } from "@/contexts/LocaleContext"
import { ShareInvoiceModal } from "@/components/sales/ShareInvoiceModal"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface ProductHistoryModalProps {
  product: any
  open: boolean
  onClose: () => void
}

export function ProductHistoryModal({ product, open, onClose }: ProductHistoryModalProps) {
  const { t } = useLocale()
  const { toast } = useToast()
  const { getProductHistory } = useInventory()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [saleToShare, setSaleToShare] = useState<any | null>(null)

  useEffect(() => {
    if (open && product) {
      loadHistory()
    }
  }, [open, product])

  const loadHistory = async () => {
    if (!product?.id) return
    setLoading(true)
    try {
      const { data } = await getProductHistory(product.id)
      setHistory(data || [])
    } catch (error) {
      console.error("Failed to load product history:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShareInvoice = (entry: any) => {
    if (!entry.public_token) {
      toast({
        title: t("sales.notifications.invoiceNotAvailableTitle"),
        description: t("sales.notifications.invoiceNotAvailable"),
        variant: "destructive",
      })
      return
    }
    setSaleToShare({
      public_token: entry.public_token,
      sale_number: entry.sale_number,
    })
    setShareModalOpen(true)
  }

  const getChangeTypeBadge = (type: string) => {
    switch (type) {
      case "creation":
        return <Badge className="bg-blue-500 text-white">{t("products.history.creation")}</Badge>
      case "restock":
        return <Badge className="bg-green-500 text-white">{t("products.history.restock")}</Badge>
      case "sale":
        return <Badge className="bg-purple-500 text-white">{t("products.history.sale")}</Badge>
      case "price_update":
        return <Badge className="bg-yellow-500 text-white">{t("products.history.priceUpdate")}</Badge>
      case "stock_update":
        return <Badge className="bg-gray-500 text-white">{t("products.history.stockUpdate")}</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  if (!product) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {product.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">{t("products.history.productInfo")}</TabsTrigger>
              <TabsTrigger value="history">{t("products.history.changeHistory")}</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="flex-1 overflow-y-auto space-y-4 mt-4 px-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  {product.image_url ? (
                    <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden border border-neutral-200">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 md:h-64 rounded-lg bg-neutral-100 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-neutral-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-neutral-600 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {t("products.productName")}
                    </label>
                    <p className="text-lg font-bold text-neutral-900 mt-1">{product.name}</p>
                  </div>

                  {product.description && (
                    <div>
                      <label className="text-sm font-semibold text-neutral-600">{t("products.description")}</label>
                      <p className="text-sm text-neutral-700 mt-1">{product.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-neutral-600 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {t("products.price")}
                      </label>
                      <p className="text-xl font-bold text-green-600 mt-1">${product.price?.toFixed(2)}</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-neutral-600 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {t("products.stock")}
                      </label>
                      <p className="text-xl font-bold text-neutral-900 mt-1">{product.stock_quantity}</p>
                    </div>
                  </div>

                  {product.category_name && (
                    <div>
                      <label className="text-sm font-semibold text-neutral-600 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {t("products.category")}
                      </label>
                      <Badge
                        className="mt-1"
                        style={{
                          backgroundColor: product.category_color || "#3b82f6",
                          color: getContrastColor(product.category_color || "#3b82f6"),
                        }}
                      >
                        {product.category_name}
                      </Badge>
                    </div>
                  )}

                  {product.sku && (
                    <div>
                      <label className="text-sm font-semibold text-neutral-600">{t("products.sku")}</label>
                      <p className="text-sm text-neutral-700 mt-1 font-mono">{product.sku}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-neutral-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t("products.createdAt")}
                    </label>
                    <p className="text-sm text-neutral-700 mt-1">
                      {new Date(product.created_at).toLocaleDateString()}{" "}
                      {new Date(product.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto mt-4 px-1">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-neutral-600">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                  <p>{t("products.history.noHistory")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 flex items-center justify-center text-white">
                          {entry.change_type === "creation" && <Package className="w-5 h-5" />}
                          {entry.change_type === "restock" && <TrendingUp className="w-5 h-5" />}
                          {entry.change_type === "sale" && <ShoppingCart className="w-5 h-5" />}
                          {entry.change_type === "price_update" && <DollarSign className="w-5 h-5" />}
                          {entry.change_type === "stock_update" && <Package className="w-5 h-5" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getChangeTypeBadge(entry.change_type)}
                          <span className="text-xs text-neutral-500">
                            {new Date(entry.changed_at).toLocaleDateString()}{" "}
                            {new Date(entry.changed_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-700 mb-2">{entry.description}</p>

                        {entry.change_type === "sale" && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-neutral-200 space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-neutral-600">
                                  {t("products.history.saleCode")}:
                                </span>
                                <Badge variant="outline" className="font-mono">
                                  #{entry.sale_number}
                                </Badge>
                              </div>
                              {entry.price && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-neutral-600">
                                    {t("products.history.saleValue")}:
                                  </span>
                                  <span className="text-sm font-bold text-green-600">${entry.price.toFixed(2)}</span>
                                </div>
                              )}
                            </div>

                            {entry.quantity_changed && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-neutral-600">
                                  {t("products.history.quantitySold")}:
                                </span>
                                <span className="text-sm font-medium text-neutral-900">
                                  {Math.abs(entry.quantity_changed)} {t("products.history.units")}
                                </span>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2 border-t border-neutral-100">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleShareInvoice(entry)}
                                className="flex-1 text-xs"
                              >
                                <Share2 className="w-3 h-3 mr-1" />
                                {t("products.history.shareInvoice")}
                              </Button>
                            </div>
                          </div>
                        )}
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

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace("#", "")
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? "#000000" : "#FFFFFF"
}
