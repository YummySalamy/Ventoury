"use client"

import type React from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  FiUpload,
  FiX,
  FiInfo,
  FiZap,
  FiDollarSign,
  FiPercent,
  FiAlertTriangle,
  FiTrendingUp,
  FiGlobe,
  FiPlus,
} from "react-icons/fi"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { ProductHistory } from "@/hooks/useInventory"

interface ProductFormDialogProps {
  isOpen: boolean
  onClose: () => void
  formData: any
  setFormData: (data: any) => void
  customFields: Array<{ key: string; value: string }>
  setCustomFields: (fields: Array<{ key: string; value: string }>) => void
  imagePreview: string | null
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  isCreating: boolean
  categories: any[]
  generateSKU: () => string
  isEdit: boolean
  productHistory?: ProductHistory[]
  suggestedPrices: Array<{ margin: number; price: number }>
  onOpenFormTutorial: () => void
  t: (key: string) => string
}

export const ProductFormDialog = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  customFields,
  setCustomFields,
  imagePreview,
  handleImageChange,
  handleSubmit,
  isCreating,
  categories,
  generateSKU,
  isEdit,
  productHistory,
  suggestedPrices,
  onOpenFormTutorial,
  t,
}: ProductFormDialogProps) => {
  const calculateMargin = (price: number) => {
    if (!formData.cost_price || Number.parseFloat(formData.cost_price) === 0) return 0
    const cost = Number.parseFloat(formData.cost_price)
    return ((price - cost) / cost) * 100
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{isEdit ? t("products.editProduct") : t("products.createProduct")}</DialogTitle>
              <DialogDescription>
                {isEdit ? t("products.updateProductInfo") : t("products.addProduct")}
              </DialogDescription>
            </div>
            <Button variant="outline" size="icon" onClick={onOpenFormTutorial} className="shrink-0 bg-transparent">
              <FiInfo className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1 max-h-[calc(90vh-200px)]">
            <div className="grid gap-6 py-4">
              {/* Image Upload */}
              <div className="grid gap-2">
                <Label htmlFor="image" className="font-semibold">
                  {t("products.productImage")}
                </Label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg hover:border-neutral-400 transition-colors bg-neutral-50">
                  {imagePreview ? (
                    <div className="relative p-4">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white">
                        <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image_url: null })
                          handleImageChange({ target: { files: [] } } as any)
                        }}
                        className="absolute top-6 right-6 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center cursor-pointer py-12 px-4"
                    >
                      <div className="p-4 bg-neutral-900 rounded-full mb-3">
                        <FiUpload className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm text-neutral-900 font-semibold">{t("products.clickToUpload")}</p>
                      <p className="text-xs text-neutral-500 mt-2">{t("products.imageFormat")}</p>
                    </label>
                  )}
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid gap-2">
                <Label htmlFor="name">{t("products.productName")} *</Label>
                <Input
                  id="name"
                  placeholder={t("products.productName")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* SKU and Generate Button */}
              <div className="grid gap-2">
                <Label htmlFor="sku">{t("products.sku")} *</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    placeholder={t("products.sku")}
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => setFormData({ ...formData, sku: generateSKU() })}
                    className="rounded-full bg-black hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-shadow duration-300 px-6"
                  >
                    <FiZap className="w-4 h-4 mr-2" />
                    {t("products.generateSKU")}
                  </Button>
                </div>
              </div>

              {/* Category Selector - Full Width */}
              <div className="grid gap-2">
                <Label htmlFor="category">{t("products.category")}</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("products.noCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("products.noCategory")}</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full backdrop-blur-sm border"
                            style={{
                              backgroundColor: `${category.color}40`,
                              borderColor: category.color,
                            }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900">{t("products.pricing")}</h3>

                {/* Cost Price */}
                <div className="grid gap-2">
                  <Label htmlFor="cost_price" className="flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-900 rounded-md">
                      <FiDollarSign className="w-3 h-3 text-white" />
                    </div>
                    {t("products.costPrice")}
                  </Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  />
                </div>

                <AnimatePresence>
                  {suggestedPrices.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-neutral-600">{t("products.suggestedPrices")}</p>
                      <div className="grid grid-cols-3 gap-3">
                        {suggestedPrices.map((suggestion) => (
                          <button
                            key={suggestion.margin}
                            type="button"
                            onClick={() => setFormData({ ...formData, price: suggestion.price.toFixed(2) })}
                            className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-neutral-200 hover:border-neutral-400 hover:shadow-lg transition-all duration-300 text-center group"
                          >
                            <div className="text-xs text-neutral-600 mb-1">{suggestion.margin}%</div>
                            <div className="text-lg font-bold text-neutral-900">${suggestion.price.toFixed(2)}</div>
                            <div className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                              <FiPercent className="w-3 h-3" />
                              {suggestion.margin}% {t("products.profitMargin")}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Price */}
                <div className="grid gap-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-900 rounded-md">
                      <FiDollarSign className="w-3 h-3 text-white" />
                    </div>
                    {t("products.salePrice")} *
                    {formData.price && formData.cost_price && (
                      <span className="text-xs text-green-600 ml-auto">
                        {calculateMargin(Number.parseFloat(formData.price)).toFixed(1)}% margin
                      </span>
                    )}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="rounded-lg bg-black p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="retail_price" className="text-white flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500 rounded-md">
                          <FiDollarSign className="w-3 h-3 text-white" />
                        </div>
                        {t("products.retailPrice")}
                      </Label>
                      <Input
                        id="retail_price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.retail_price}
                        onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="wholesale_price" className="text-white flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500 rounded-md">
                          <FiDollarSign className="w-3 h-3 text-white" />
                        </div>
                        {t("products.wholesalePrice")}
                      </Label>
                      <Input
                        id="wholesale_price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.wholesale_price}
                        onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Management */}
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900">{t("products.stockManagement")}</h3>

                <div className="grid gap-2">
                  <Label htmlFor="stock_quantity">{t("products.stockQuantity")} *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="min_stock_alert" className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500 rounded-md">
                        <FiAlertTriangle className="w-3 h-3 text-white" />
                      </div>
                      {t("products.minStockAlert")}
                    </Label>
                    <Input
                      id="min_stock_alert"
                      type="number"
                      min="0"
                      placeholder="5"
                      value={formData.min_stock_alert}
                      onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                      className="border-amber-300 focus:border-amber-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_stock_target" className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500 rounded-md">
                        <FiTrendingUp className="w-3 h-3 text-white" />
                      </div>
                      {t("products.maxStockTarget")}
                    </Label>
                    <Input
                      id="max_stock_target"
                      type="number"
                      min="0"
                      placeholder="100"
                      value={formData.max_stock_target}
                      onChange={(e) => setFormData({ ...formData, max_stock_target: e.target.value })}
                      className="border-blue-300 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">{t("products.description")}</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder={t("products.description")}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Marketplace Toggle */}
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-neutral-50">
                <input
                  type="checkbox"
                  id="show_in_marketplace"
                  checked={formData.show_in_marketplace}
                  onChange={(e) => setFormData({ ...formData, show_in_marketplace: e.target.checked })}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <Label htmlFor="show_in_marketplace" className="font-semibold cursor-pointer flex items-center gap-2">
                    <FiGlobe className="w-4 h-4" />
                    {t("products.displayInWebStore")}
                  </Label>
                  <p className="text-xs text-neutral-500 mt-1">{t("products.displayInWebStoreDesc")}</p>
                </div>
              </div>

              {/* Custom Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900">{t("products.customFields")}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomFields([...customFields, { key: "", value: "" }])}
                    className="bg-transparent"
                  >
                    <FiPlus className="w-4 h-4 mr-1" />
                    {t("products.addCustomField")}
                  </Button>
                </div>

                {customFields.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-4">{t("products.noCustomFields")}</p>
                ) : (
                  <div className="space-y-3">
                    {customFields.map((field, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={t("products.fieldName")}
                          value={field.key}
                          onChange={(e) => {
                            const newFields = [...customFields]
                            newFields[index].key = e.target.value
                            setCustomFields(newFields)
                          }}
                          className="flex-1"
                        />
                        <Input
                          placeholder={t("products.fieldValue")}
                          value={field.value}
                          onChange={(e) => {
                            const newFields = [...customFields]
                            newFields[index].value = e.target.value
                            setCustomFields(newFields)
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newFields = customFields.filter((_, i) => i !== index)
                            setCustomFields(newFields)
                          }}
                          className="shrink-0"
                        >
                          <FiX className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product History */}
              {isEdit && productHistory && productHistory.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-neutral-900">{t("products.changeHistory")}</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3 bg-neutral-50">
                    {productHistory.slice(0, 5).map((entry: ProductHistory) => (
                      <div key={entry.id} className="text-xs p-2 bg-white rounded border">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.change_type}
                          </Badge>
                          <span className="text-neutral-500">{new Date(entry.created_at).toLocaleDateString()}</span>
                        </div>
                        {entry.notes && <p className="text-neutral-600">{entry.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" className="bg-neutral-900 hover:bg-neutral-800" disabled={isCreating}>
              {isCreating ? (
                <>
                  <span className="animate-spin mr-2">⚙️</span>
                  {isEdit ? t("products.updating") : t("products.creating")}
                </>
              ) : (
                `${isEdit ? t("products.updateProduct") : t("products.createProduct")}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
