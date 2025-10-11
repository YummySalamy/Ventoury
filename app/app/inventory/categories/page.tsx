"use client"
import { useState } from "react"
import type React from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Tag,
  Package,
  TrendingUp,
  Edit,
  Trash2,
  Loader2,
  X,
  ImageIcon,
  ChevronRight,
  ChevronDown,
  Eye,
} from "lucide-react"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCategories } from "@/hooks/useCategories"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/useTranslation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default function CategoriesPage() {
  const { t } = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "tag",
    color: "#3b82f6",
    parent_id: null as string | null,
    show_in_marketplace: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  const [valuationModalOpen, setValuationModalOpen] = useState(false)
  const [selectedCategoryForValuation, setSelectedCategoryForValuation] = useState<any>(null)

  const { categories, loading, error, createCategory, updateCategory, deleteCategory, uploadCategoryImage } =
    useCategories()
  const { toast } = useToast()

  const parentCategories = categories.filter((c) => !c.parent_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      let imageUrl = editingCategory?.image_url || null

      if (imageFile) {
        const uploadedUrl = await uploadCategoryImage(imageFile)
        if (uploadedUrl) imageUrl = uploadedUrl
      }

      const categoryData = {
        ...formData,
        image_url: imageUrl,
        is_active: true,
      }

      if (editingCategory) {
        const { error } = await updateCategory(editingCategory.id, categoryData)
        if (error) throw new Error(error)
        toast({
          title: t("categories.notifications.updated"),
          description: t("categories.notifications.updatedDesc", { name: formData.name }),
        })
      } else {
        const { error } = await createCategory(categoryData)
        if (error) throw new Error(error)
        toast({
          title: t("categories.notifications.created"),
          description: t("categories.notifications.createdDesc", { name: formData.name }),
        })
      }

      setFormData({
        name: "",
        description: "",
        icon: "tag",
        color: "#3b82f6",
        parent_id: null,
        show_in_marketplace: false,
      })
      setImageFile(null)
      setImagePreview(null)
      setEditingCategory(null)
      setIsDialogOpen(false)
    } catch (err: any) {
      toast({
        title: editingCategory
          ? t("categories.notifications.updateFailed")
          : t("categories.notifications.createFailed"),
        description: err.message || t("categories.notifications.saveFailed"),
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "tag",
      color: category.color || "#3b82f6",
      parent_id: category.parent_id || null,
      show_in_marketplace: category.show_in_marketplace || false,
    })
    setImagePreview(category.image_url || null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(t("categories.notifications.deleteConfirm", { name: categoryName }))) return

    setIsDeleting(categoryId)

    try {
      const { error } = await deleteCategory(categoryId)
      if (error) throw new Error(error)

      toast({
        title: t("categories.notifications.deleted"),
        description: t("categories.notifications.deletedDesc", { name: categoryName }),
      })
    } catch (err: any) {
      toast({
        title: t("categories.notifications.deleteFailed"),
        description: err.message || t("categories.notifications.deleteError"),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const totalCategories = categories.length
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0)
  const totalValue = categories.reduce((sum, cat) => sum + (cat.valuation?.at_retail || 0), 0)

  const filteredCategories = parentCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleViewValuation = (category: any) => {
    setSelectedCategoryForValuation(category)
    setValuationModalOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">
              {t("categories.title")}{" "}
              <span className="italic font-light text-neutral-600">{t("categories.subtitle")}</span>
            </h1>
            <p className="text-neutral-600 mt-2">{t("categories.description")}</p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setEditingCategory(null)
                setFormData({
                  name: "",
                  description: "",
                  icon: "tag",
                  color: "#3b82f6",
                  parent_id: null,
                  show_in_marketplace: false,
                })
                setImageFile(null)
                setImagePreview(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-neutral-900 hover:bg-neutral-800">
                <Plus className="w-4 h-4 mr-2" />
                {t("categories.addCategory")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? t("categories.editCategory") : t("categories.addCategory")}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory ? t("categories.description") : t("categories.description")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>{t("categories.categoryImage")}</Label>
                    <div className="flex items-center gap-4">
                      {imagePreview ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-neutral-200">
                          <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null)
                              setImagePreview(null)
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center bg-neutral-50">
                          <ImageIcon className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
                        <p className="text-xs text-neutral-500 mt-1">{t("products.imageFormat")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="categoryName">{t("categories.categoryName")} *</Label>
                    <Input
                      id="categoryName"
                      placeholder={t("categories.categoryNamePlaceholder")}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">{t("categories.description")}</Label>
                    <textarea
                      id="description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder={t("categories.descriptionPlaceholder")}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>{t("categories.parentCategory")}</Label>
                    <Select
                      value={formData.parent_id || "none"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, parent_id: value === "none" ? null : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("categories.noneTopLevel")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("categories.noneTopLevel")}</SelectItem>
                        {parentCategories
                          .filter((c) => c.id !== editingCategory?.id)
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-neutral-500">{t("categories.parentCategoryHelp")}</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="color">{t("categories.categoryColor")}</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-10 rounded border border-neutral-300 cursor-pointer"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-neutral-500">{t("categories.categoryColorHelp")}</p>
                  </div>

                  <div className="flex items-center space-x-2 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                    <Checkbox
                      id="marketplace"
                      checked={formData.show_in_marketplace}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, show_in_marketplace: checked as boolean })
                      }
                    />
                    <div className="flex-1">
                      <label htmlFor="marketplace" className="text-sm font-medium cursor-pointer">
                        {t("categories.showInMarketplace")}
                      </label>
                      <p className="text-xs text-neutral-500">{t("categories.showInMarketplaceDesc")}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" className="bg-neutral-900 hover:bg-neutral-800" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingCategory ? t("categories.updating") : t("categories.creating")}
                      </>
                    ) : editingCategory ? (
                      t("categories.updateCategory")
                    ) : (
                      t("categories.createCategory")
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">{t("categories.totalCategories")}</p>
                <p className="text-2xl font-bold text-neutral-900">{totalCategories}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">{t("categories.totalProducts")}</p>
                <p className="text-2xl font-bold text-neutral-900">{totalProducts}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">{t("categories.totalValue")}</p>
                <p className="text-2xl font-bold text-neutral-900">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mb-4 sm:mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder={t("categories.searchPlaceholder")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </GlassCard>

        {loading && (
          <GlassCard>
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">{t("categories.loadingCategories")}</p>
            </div>
          </GlassCard>
        )}

        {error && (
          <GlassCard>
            <div className="text-center py-12">
              <p className="text-red-600">
                {t("common.error")}: {error}
              </p>
            </div>
          </GlassCard>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full">
                <GlassCard>
                  <div className="text-center py-12 text-neutral-600">
                    {searchQuery ? t("categories.noMatch") : t("categories.noCategories")}
                  </div>
                </GlassCard>
              </div>
            ) : (
              filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {category.image_url ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                            <Image
                              src={category.image_url || "/placeholder.svg"}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="p-3 rounded-xl"
                            style={{
                              background: `linear-gradient(135deg, ${category.color || "#3b82f6"}, ${category.color || "#3b82f6"}dd)`,
                            }}
                          >
                            <Tag className="w-6 h-6 text-white" />
                          </div>
                        )}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <button
                            onClick={() => toggleExpanded(category.id)}
                            className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="w-4 h-4 text-neutral-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-neutral-600" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={isDeleting === category.id}
                        >
                          {isDeleting === category.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="text-xl font-bold text-neutral-900 flex-1">{category.name}</h3>
                      {category.show_in_marketplace && (
                        <Badge variant="secondary" className="text-xs">
                          {t("categories.marketplace")}
                        </Badge>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{category.description}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">{t("categories.products")}</span>
                        <span className="font-semibold text-neutral-900">{category.product_count || 0}</span>
                      </div>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">{t("categories.subcategories")}</span>
                          <span className="font-semibold text-neutral-900">{category.subcategories.length}</span>
                        </div>
                      )}
                      {category.valuation && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">{t("categories.valuation.totalStock")}</span>
                            <span className="font-semibold text-neutral-900">
                              {category.valuation.total_stock || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">{t("categories.valuation.atRetail")}</span>
                            <span className="font-semibold text-green-600">
                              ${(category.valuation.at_retail || 0).toFixed(2)}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 bg-transparent"
                            onClick={() => handleViewValuation(category)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t("categories.valuation.viewReport")}
                          </Button>
                        </>
                      )}
                    </div>

                    {expandedCategories.has(category.id) &&
                      category.subcategories &&
                      category.subcategories.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2">
                          <p className="text-xs font-semibold text-neutral-500 uppercase">
                            {t("categories.subcategoriesLabel")}
                          </p>
                          {category.subcategories.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: sub.color || category.color || "#3b82f6" }}
                                />
                                <span className="text-sm font-medium text-neutral-700">{sub.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-neutral-500">
                                  {sub.product_count || 0} {t("categories.products").toLowerCase()}
                                </span>
                                <button
                                  onClick={() => handleEdit(sub)}
                                  className="p-1 hover:bg-neutral-200 rounded transition-colors"
                                >
                                  <Edit className="w-3 h-3 text-neutral-600" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>

      <Dialog open={valuationModalOpen} onOpenChange={setValuationModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t("categories.valuation.reportTitle")} - {selectedCategoryForValuation?.name}
            </DialogTitle>
            <DialogDescription>{t("categories.valuation.reportDescription")}</DialogDescription>
          </DialogHeader>

          {selectedCategoryForValuation?.valuation && (
            <div className="space-y-4 py-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">{t("categories.valuation.investment")}</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${(selectedCategoryForValuation.valuation.at_cost || 0).toFixed(2)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm text-purple-700 mb-1">{t("categories.valuation.wholesaleValue")}</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${(selectedCategoryForValuation.valuation.at_wholesale || 0).toFixed(2)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-700 mb-1">{t("categories.valuation.retailValue")}</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${(selectedCategoryForValuation.valuation.at_retail || 0).toFixed(2)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-700 mb-1">{t("categories.valuation.totalStock")}</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {selectedCategoryForValuation.valuation.total_stock || 0}
                  </p>
                </div>
              </div>

              {/* Profit Potential */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-lg">{t("categories.valuation.profitPotential")}</h3>

                <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-cyan-700">{t("categories.valuation.wholesaleProfit")}</span>
                    <span className="text-xl font-bold text-cyan-900">
                      ${(selectedCategoryForValuation.valuation.potential_profit_wholesale || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-emerald-700">{t("categories.valuation.retailProfit")}</span>
                    <span className="text-xl font-bold text-emerald-900">
                      ${(selectedCategoryForValuation.valuation.potential_profit_retail || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
