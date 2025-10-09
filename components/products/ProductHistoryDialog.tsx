"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FiPackage, FiDollarSign, FiTrendingUp, FiClock } from "react-icons/fi"
import type { ProductHistory } from "@/hooks/useInventory"

interface ProductHistoryDialogProps {
  isOpen: boolean
  onClose: () => void
  history: ProductHistory[]
  loading: boolean
  t: (key: string) => string
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
    default:
      return <FiClock className="w-4 h-4" />
  }
}

const getChangeTypeColor = (changeType: string) => {
  switch (changeType) {
    case "creation":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "price_update":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "stock_update":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "restock":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-neutral-100 text-neutral-800 border-neutral-200"
  }
}

export const ProductHistoryDialog = ({ isOpen, onClose, history, loading, t }: ProductHistoryDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">{t("products.productHistory")}</DialogTitle>
        <DialogDescription>{t("products.productHistoryDescription")}</DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto px-1">
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
            {history.map((entry: ProductHistory, index: number) => (
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
                        {entry.change_type.replace("_", " ")}
                      </Badge>
                      <p className="text-xs text-neutral-500 mt-1">{new Date(entry.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-600">Changed by</p>
                    <p className="text-sm font-semibold text-neutral-900">{entry.user?.name || "System"}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {/* Stock Changes */}
                  {(entry.change_type === "stock_update" || entry.change_type === "restock") && (
                    <>
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-xs text-neutral-600 mb-1">{t("products.stockBefore")}</p>
                        <p className="text-lg font-bold text-neutral-900">{entry.stock_before ?? "-"}</p>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-xs text-neutral-600 mb-1">{t("products.stockAfter")}</p>
                        <p className="text-lg font-bold text-green-600">{entry.stock_after ?? "-"}</p>
                      </div>
                      {entry.quantity_added && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-green-700 mb-1">{t("products.quantityAdded")}</p>
                          <p className="text-lg font-bold text-green-600">+{entry.quantity_added}</p>
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
      </div>

      <DialogFooter className="pt-4 border-t">
        <Button variant="outline" onClick={onClose} className="bg-neutral-900 text-white hover:bg-neutral-800">
          {t("common.close")}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
