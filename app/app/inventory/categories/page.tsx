"use client"
import { useState } from "react"
import type React from "react"
import { motion } from "framer-motion"
import { Plus, Search, Tag, Package, TrendingUp, Edit, Trash2, Loader2 } from "lucide-react"
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
import { useCategories } from "@/hooks/useCategories"
import { useToast } from "@/hooks/use-toast"

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "tag",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const { categories, loading, error, createCategory, deleteCategory } = useCategories()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsCreating(true)

    try {
      const { error } = await createCategory({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        is_active: true,
      })

      if (error) throw new Error(error)

      toast({
        title: "Category created!",
        description: `${formData.name} has been added.`,
      })

      setFormData({ name: "", description: "", icon: "tag" })
      setIsDialogOpen(false)
    } catch (err: any) {
      toast({
        title: "Error creating category",
        description: err.message || "Failed to create category",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
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

  const totalCategories = categories.length
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0)
  const totalValue = categories.reduce((sum, cat) => sum + (cat.total_value || 0), 0)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">
              Categories <span className="italic font-light text-neutral-600">Overview</span>
            </h1>
            <p className="text-neutral-600 mt-2">Organize and manage product categories</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neutral-900 hover:bg-neutral-800">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>Create a new product category</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="categoryName">Category Name</Label>
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
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-neutral-900 hover:bg-neutral-800" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
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
              <Input placeholder="Search categories..." className="pl-10" />
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
            {categories.length === 0 ? (
              <div className="col-span-full">
                <GlassCard>
                  <div className="text-center py-12 text-neutral-600">
                    No categories yet. Create your first category to get started!
                  </div>
                </GlassCard>
              </div>
            ) : (
              categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                        <Tag className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={isDeleting === category.id}
                        >
                          {isDeleting === category.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600" />
                          )}
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{category.description}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Products</span>
                        <span className="font-semibold text-neutral-900">{category.product_count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Total Value</span>
                        <span className="font-semibold text-neutral-900">
                          ${(category.total_value || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
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
