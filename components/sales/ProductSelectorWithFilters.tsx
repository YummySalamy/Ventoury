"use client"

import { useState } from "react"
import { Filter, ImageIcon, Package, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getContrastColor } from "@/lib/get-contrast-color"
import { useTranslation } from "@/hooks/useTranslation"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Product {
  id: string
  name: string
  price: number
  stock_quantity: number
  min_stock_alert?: number
  image_url?: string
  categories?: {
    id: string
    name: string
    color: string
    icon?: string
  }
  sku?: string
}

interface Category {
  id: string
  name: string
  color: string
}

interface ProductSelectorWithFiltersProps {
  products: Product[]
  categories: Category[]
  selectedProduct: string
  quantity: string
  onProductChange: (productId: string) => void
  onQuantityChange: (quantity: string) => void
  onAddToCart: () => void
}

export function ProductSelectorWithFilters({
  products,
  categories,
  selectedProduct,
  quantity,
  onProductChange,
  onQuantityChange,
  onAddToCart,
}: ProductSelectorWithFiltersProps) {
  const { t } = useTranslation()
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null)
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock">("all")

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return {
        color: "bg-red-500",
        text: t("sales.stockStatus.outOfStock"),
        textColor: "text-red-600",
      }
    }
    if (product.stock_quantity <= (product.min_stock_alert || 5)) {
      return {
        color: "bg-yellow-500",
        text: t("sales.stockStatus.lowStock"),
        textColor: "text-yellow-600",
      }
    }
    return {
      color: "bg-green-500",
      text: t("sales.stockStatus.inStock"),
      textColor: "text-green-600",
    }
  }

  const filteredProducts = products.filter((product) => {
    // Category filter
    if (selectedCategoryFilter && product.categories?.id !== selectedCategoryFilter) {
      return false
    }

    // Stock filter
    if (stockFilter === "in_stock" && product.stock_quantity === 0) {
      return false
    }
    if (stockFilter === "low_stock" && product.stock_quantity > (product.min_stock_alert || 5)) {
      return false
    }

    return true
  })

  const activeFiltersCount = (selectedCategoryFilter ? 1 : 0) + (stockFilter !== "all" ? 1 : 0)

  const clearFilters = () => {
    setSelectedCategoryFilter(null)
    setStockFilter("all")
  }

  return (
    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-3 sm:p-4 bg-neutral-50">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
        <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg" />
          <div className="absolute inset-0 bg-black rounded-lg" />
          <Package className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 text-white" />
        </div>
        {t("sales.addProducts")}
      </h3>

      <div className="mb-3">
        <SearchableSelect
          items={filteredProducts}
          value={selectedProduct}
          onValueChange={onProductChange}
          placeholder={t("sales.selectProduct")}
          searchPlaceholder={t("common.search")}
          emptyMessage={t("products.noProducts")}
          getItemId={(product) => product.id}
          getItemSearchText={(product) => `${product.name} ${product.sku || ""}`}
          renderFilterButton={() => (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFilterModalOpen(true)}
              className="relative flex-shrink-0 h-10 w-10 bg-transparent"
            >
              <Filter className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          )}
          renderItem={(product) => {
            const stockStatus = getStockStatus(product)
            const category = product.categories

            return (
              <div className="flex items-center gap-2 sm:gap-3 py-1">
                {product.image_url ? (
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-gradient-to-br from-black to-neutral-600 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    {category && (
                      <Badge
                        style={{
                          backgroundColor: category.color,
                          color: getContrastColor(category.color),
                        }}
                        className="text-[10px] px-1.5 py-0 h-5 rounded-full flex-shrink-0"
                      >
                        {category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-semibold">${product.price.toFixed(2)}</span>
                    <span className="opacity-40">•</span>
                    <span className={`${stockStatus.textColor} font-medium`}>
                      {stockStatus.text}: {product.stock_quantity}
                    </span>
                  </div>
                </div>
              </div>
            )
          }}
        />
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          placeholder={t("sales.qty")}
          className="h-10 w-24 flex-shrink-0"
        />
        <Button
          type="button"
          onClick={onAddToCart}
          disabled={!selectedProduct || !quantity || Number.parseInt(quantity) <= 0}
          className="h-10 bg-neutral-900 hover:bg-neutral-800 flex-1 sm:flex-initial"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("common.add")}
        </Button>
      </div>

      {activeFiltersCount > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
          <Filter className="w-3 h-3" />
          <span>
            {t("sales.showingFiltered", {
              count: filteredProducts.length,
              total: products.length,
            })}
          </span>
          <button onClick={clearFilters} className="text-blue-600 hover:underline ml-auto">
            {t("sales.clearFilters")}
          </button>
        </div>
      )}

      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              {t("sales.filterProducts")}
            </DialogTitle>
            <DialogDescription>{t("sales.filters.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Category Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">{t("sales.byCategory")}</Label>
              <Select
                value={selectedCategoryFilter || "all"}
                onValueChange={(value) => setSelectedCategoryFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("common.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">{t("sales.byStock")}</Label>
              <RadioGroup value={stockFilter} onValueChange={(value: any) => setStockFilter(value)}>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-50">
                  <RadioGroupItem value="all" id="stock-all" />
                  <Label htmlFor="stock-all" className="flex-1 cursor-pointer">
                    {t("common.all")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-50">
                  <RadioGroupItem value="in_stock" id="stock-in" />
                  <Label htmlFor="stock-in" className="flex-1 cursor-pointer flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                    {t("sales.filters.inStock")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-50">
                  <RadioGroupItem value="low_stock" id="stock-low" />
                  <Label htmlFor="stock-low" className="flex-1 cursor-pointer flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" />
                    {t("sales.filters.lowStock")}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-4 border-t">
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters} className="flex-1 bg-transparent">
                <X className="w-4 h-4 mr-2" />
                {t("sales.clearFilters")}
              </Button>
            )}
            <Button onClick={() => setFilterModalOpen(false)} className="flex-1 bg-neutral-900 hover:bg-neutral-800">
              {t("common.apply")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
