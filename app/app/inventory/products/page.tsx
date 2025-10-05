"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { Plus, Search, Filter, Edit, Trash2, Package, Grid3x3, List, ImageIcon } from "lucide-react"
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
import { useProducts } from "@/hooks/useProducts"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function ProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock_quantity: "",
    description: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { products, loading, error, createProduct, deleteProduct } = useProducts()
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data, error } = await createProduct(
        {
          name: formData.name,
          sku: formData.sku,
          price: Number.parseFloat(formData.price),
          stock_quantity: Number.parseInt(formData.stock_quantity),
          description: formData.description,
          is_active: true,
        },
        imageFile,
      )

      if (error) throw new Error(error)

      toast({
        title: "Product created!",
        description: `${formData.name} has been added to your inventory.`,
      })

      // Reset form
      setFormData({
        name: "",
        sku: "",
        category: "",
        price: "",
        stock_quantity: "",
        description: "",
      })
      setImageFile(null)
      setImagePreview(null)
      setIsDialogOpen(false)
    } catch (err: any) {
      console.error("[v0] Error creating product:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to create product",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete ${productName}?`)) return

    try {
      const { error } = await deleteProduct(productId)
      if (error) throw new Error(error)

      toast({
        title: "Product deleted",
        description: `${productName} has been removed from your inventory.`,
      })
    } catch (err: any) {
      console.error("[v0] Error deleting product:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const totalProducts = products.length
  const inStock = products.filter((p) => p.stock_quantity > 10).length
  const lowStock = products.filter((p) => p.stock_quantity <= 10 && p.stock_quantity > 0).length

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900">
              Products <span className="italic font-light text-neutral-600">Management</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">Manage your product catalog and inventory</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "bg-neutral-900 text-white" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-neutral-900 text-white" : ""}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-neutral-900 hover:bg-neutral-800 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>Create a new product in your inventory</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="image">Product Image (Optional)</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="flex-1"
                        />
                        {imagePreview && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-neutral-200">
                            <Image
                              src={imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500">Max 5MB, JPG/PNG</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter product name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        placeholder="Enter SKU"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stock">Initial Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          placeholder="0"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Product description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-neutral-900 hover:bg-neutral-800">
                      Create Product
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
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
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">In Stock</p>
                <p className="text-2xl font-bold text-neutral-900">{inStock}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Low Stock</p>
                <p className="text-2xl font-bold text-neutral-900">{lowStock}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </GlassCard>

        {loading && (
          <GlassCard>
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading products...</p>
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

        {!loading && !error && viewMode === "table" && (
          <GlassCard>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                        Image
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                        SKU
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                        Product
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                        Stock
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                        Price
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-neutral-600">
                          No products yet. Create your first product to get started!
                        </td>
                      </tr>
                    ) : (
                      products.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-neutral-100 hover:bg-neutral-900 group transition-all duration-300"
                        >
                          <td className="py-3 sm:py-4 px-2 sm:px-4">
                            {product.image_url ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                <Image
                                  src={product.image_url || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-neutral-400" />
                              </div>
                            )}
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-300 transition-colors">
                            {product.sku}
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium text-neutral-900 group-hover:text-white transition-colors">
                            {product.name}
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-300 transition-colors">
                            {product.stock_quantity}
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-white transition-colors">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4">
                            <div className="flex gap-1 sm:gap-2">
                              <button className="p-1.5 sm:p-2 hover:bg-neutral-800 rounded-lg transition-colors group-hover:text-white">
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="p-1.5 sm:p-2 hover:bg-red-500 rounded-lg transition-colors group-hover:text-white"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>
        )}

        {!loading && !error && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.length === 0 ? (
              <div className="col-span-full">
                <GlassCard>
                  <div className="text-center py-12 text-neutral-600">
                    No products yet. Create your first product to get started!
                  </div>
                </GlassCard>
              </div>
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="hover:shadow-xl transition-shadow">
                    <div className="aspect-square relative rounded-lg overflow-hidden mb-4 bg-neutral-100">
                      {product.image_url ? (
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-neutral-300" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-neutral-900 line-clamp-2">{product.name}</h3>
                      </div>
                      <p className="text-xs text-neutral-500">SKU: {product.sku}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-neutral-900">${product.price.toFixed(2)}</p>
                        <p className="text-sm text-neutral-600">Stock: {product.stock_quantity}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 hover:bg-red-500 hover:text-white hover:border-red-500 bg-transparent"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
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
