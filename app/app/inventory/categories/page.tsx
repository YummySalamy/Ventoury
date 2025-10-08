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
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default function CategoriesPage() {
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
          title: "Category updated!",
          description: `${formData.name} has been updated.`,
        })
      } else {
        const { error } = await createCategory(categoryData)
        if (error) throw new Error(error)
        toast({
          title: "Category created!",
          description: `${formData.name} has been added.`,
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
        title: editingCategory ? "Error updating category" : "Error creating category",
        description: err.message || "Failed to save category",
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
    if (!confirm(`Are you sure you want to delete ${categoryName}?`)) return

    setIsDeleting(categoryId)

    try {
      const { error } = await deleteCategory(categoryId)
      if (error) throw new Error(error)

      toast({
        title: "Category deleted",
        description: `${categoryName} has been removed.`,
      })
    } catch (err: any) {
      toast({
        title: "Error deleting category",
        description: err.message || "Failed to delete category",
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
  const totalValue = categories.reduce((sum, cat) => sum + (cat.total_value || 0), 0)

  const filteredCategories = parentCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">
              Categories <span className="italic font-light text-neutral-600">Management</span>
            </h1>
            <p className="text-neutral-600 mt-2">Organize products with categories and subcategories</p>
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
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit" : "Add New"} Category</DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Update category information" : "Create a new product category"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Category Image (optional)</Label>
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
                        <p className="text-xs text-neutral-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="categoryName">Category Name *</Label>
                    <Input
                      id="categoryName"
                      placeholder="Enter category name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Category description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Parent Category (optional)</Label>
                    <Select
                      value={formData.parent_id || "none"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, parent_id: value === "none" ? null : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None (Top Level)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
                        {parentCategories
                          .filter((c) => c.id !== editingCategory?.id)
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-neutral-500">Select a parent to create a subcategory</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="color">Category Color</Label>
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
                    <p className="text-xs text-neutral-500">Used for badges and marketplace filters</p>
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
                        Show in Marketplace
                      </label>
                      <p className="text-xs text-neutral-500">Display this category in your public store</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-neutral-900 hover:bg-neutral-800" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingCategory ? "Updating..." : "Creating..."}
                      </>
                    ) : editingCategory ? (
                      "Update Category"
                    ) : (
                      "Create Category"
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
                <p className="text-sm text-neutral-600">Total Categories</p>
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
                <p className="text-sm text-neutral-600">Total Products</p>
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
                <p className="text-sm text-neutral-600">Total Value</p>
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
                placeholder="Search categories..."
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
              <p className="text-neutral-600">Loading categories...</p>
            </div>
          </GlassCard>
        )}

        {error && (
          <GlassCard>
            <div className="text-center py-12">
              <p className="text-red-600">Error: {error}</p>
            </div>
          </GlassCard>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full">
                <GlassCard>
                  <div className="text-center py-12 text-neutral-600">
                    {searchQuery
                      ? "No categories match your search."
                      : "No categories yet. Create your first category to get started!"}
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
                            className="p-1 hover:bg-neutral-100 rounded transition-colors"
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
                          Marketplace
                        </Badge>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{category.description}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Products</span>
                        <span className="font-semibold text-neutral-900">{category.product_count || 0}</span>
                      </div>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Subcategories</span>
                          <span className="font-semibold text-neutral-900">{category.subcategories.length}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Total Value</span>
                        <span className="font-semibold text-neutral-900">
                          ${(category.total_value || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {expandedCategories.has(category.id) &&
                      category.subcategories &&
                      category.subcategories.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2">
                          <p className="text-xs font-semibold text-neutral-500 uppercase">Subcategories</p>
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
                                <span className="text-xs text-neutral-500">{sub.product_count || 0} products</span>
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
    </div>
  )
}
