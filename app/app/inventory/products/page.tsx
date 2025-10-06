"use client"
import { useState } from "react"
import type React from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  Grid3x3,
  List,
  ImageIcon,
  Upload,
  X,
  Loader2,
  Globe,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/hooks/useProducts"
import { useCategories } from "@/hooks/useCategories"
import { useCustomFields } from "@/hooks/useCustomFields"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

type Product = {
  id: string
  name: string
  sku: string
  price: number
  cost_price: number | null
  stock_quantity: number
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  category_id: string | null
  custom_data: Record<string, any> | null
  show_in_marketplace: boolean
  marketplace_order: number
}

export default function ProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    price: "",
    cost_price: "", // NEW
    stock_quantity: "",
    description: "",
    show_in_marketplace: false, // NEW
    marketplace_order: 0, // NEW
  })
  const [customFieldsData, setCustomFieldsData] = useState<Array<{ key: string; value: string }>>([]) // NEW: Dynamic custom fields
  const [customData, setCustomData] = useState<Record<string, any>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<{ id: string; name: string } | null>(null) // Added delete confirmation state

  const { products, loading, error, createProduct, deleteProduct, fetchProducts, updateProduct } = useProducts() // Added updateProduct
  const { categories } = useCategories()
  const { customFields, validateCustomData } = useCustomFields()
  const { toast } = useToast()

  const [priceSuggestions, setPriceSuggestions] = useState<Array<{ label: string; value: string }>>([])

  const calculatePriceSuggestions = (costPrice: string) => {
    const cost = Number.parseFloat(costPrice)
    if (!cost || cost <= 0) {
      setPriceSuggestions([])
      return
    }

    setPriceSuggestions([
      { label: "Low margin (20%)", value: (cost * 1.2).toFixed(2) },
      { label: "Standard margin (50%)", value: (cost * 1.5).toFixed(2) },
      { label: "High margin (100%)", value: (cost * 2.0).toFixed(2) },
    ])
  }

  const calculateProfitMargin = () => {
    const cost = Number.parseFloat(formData.cost_price)
    const price = Number.parseFloat(formData.price)
    if (!cost || !price || cost <= 0) return null
    return (((price - cost) / cost) * 100).toFixed(1)
  }

  const addCustomField = () => {
    setCustomFieldsData([...customFieldsData, { key: "", value: "" }])
  }

  const updateCustomField = (index: number, field: "key" | "value", value: string) => {
    const updated = [...customFieldsData]
    updated[index][field] = value
    setCustomFieldsData(updated)
  }

  const removeCustomField = (index: number) => {
    setCustomFieldsData(customFieldsData.filter((_, i) => i !== index))
  }

  const toggleMarketplace = async (productId: string, currentValue: boolean) => {
    try {
      // Assuming you have supabase and user context available here
      // const { error } = await supabase
      //   .from('products')
      //   .update({ show_in_marketplace: !currentValue })
      //   .eq('id', productId)
      //   .eq('user_id', user?.id)

      // if (error) throw error

      // Placeholder for actual API call
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

      toast({
        title: !currentValue ? "Added to marketplace" : "Removed from marketplace",
        description: "Product visibility updated successfully",
      })

      // Refresh products
      fetchProducts()
    } catch (err: any) {
      toast({
        title: "Error updating marketplace status",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        })
        return
      }
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

    const customDataObject = customFieldsData.reduce(
      (acc, field) => {
        if (field.key.trim()) {
          acc[field.key.trim()] = field.value
        }
        return acc
      },
      {} as Record<string, any>,
    )

    // Merge with existing custom data from custom_fields
    const finalCustomData = { ...customData, ...customDataObject }

    const validation = validateCustomData(customData)
    if (!validation.valid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(", "),
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const { data, error } = await createProduct(
        {
          name: formData.name,
          sku: formData.sku,
          category_id: formData.category_id || null,
          price: Number.parseFloat(formData.price),
          cost_price: formData.cost_price ? Number.parseFloat(formData.cost_price) : null, // NEW
          stock_quantity: Number.parseInt(formData.stock_quantity),
          description: formData.description,
          show_in_marketplace: formData.show_in_marketplace, // NEW
          marketplace_order: formData.marketplace_order, // NEW
          custom_data: Object.keys(finalCustomData).length > 0 ? finalCustomData : null,
          is_active: true,
        },
        imageFile,
      )

      if (error) throw new Error(error)

      toast({
        title: "Product created!",
        description: `${formData.name} has been added to your inventory.`,
      })

      setFormData({
        name: "",
        sku: "",
        category_id: "",
        price: "",
        cost_price: "",
        stock_quantity: "",
        description: "",
        show_in_marketplace: false,
        marketplace_order: 0,
      })
      setCustomData({})
      setCustomFieldsData([])
      setPriceSuggestions([])
      setImageFile(null)
      setImagePreview(null)
      setIsDialogOpen(false)
    } catch (err: any) {
      console.error("[v0] Error creating product:", err)
      toast({
        title: "Error creating product",
        description: err.message || "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id || "",
      price: product.price.toString(),
      cost_price: product.cost_price?.toString() || "",
      stock_quantity: product.stock_quantity.toString(),
      description: product.description || "",
      show_in_marketplace: product.show_in_marketplace || false,
      marketplace_order: product.marketplace_order || 0,
    })

    // Convert custom_data to array format
    if (product.custom_data) {
      const fields = Object.entries(product.custom_data).map(([key, value]) => ({
        key,
        value: String(value),
      }))
      setCustomFieldsData(fields)
    } else {
      setCustomFieldsData([])
    }

    setImagePreview(product.image_url || null)
    calculatePriceSuggestions(product.cost_price?.toString() || "")
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingProduct) return

    const customDataObject = customFieldsData.reduce(
      (acc, field) => {
        if (field.key.trim()) {
          acc[field.key.trim()] = field.value
        }
        return acc
      },
      {} as Record<string, any>,
    )

    const finalCustomData = { ...customData, ...customDataObject }

    const validation = validateCustomData(customData)
    if (!validation.valid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(", "),
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      const { data, error } = await updateProduct(
        editingProduct.id,
        {
          name: formData.name,
          sku: formData.sku,
          category_id: formData.category_id || null,
          price: Number.parseFloat(formData.price),
          cost_price: formData.cost_price ? Number.parseFloat(formData.cost_price) : null,
          stock_quantity: Number.parseInt(formData.stock_quantity),
          description: formData.description,
          show_in_marketplace: formData.show_in_marketplace,
          marketplace_order: formData.marketplace_order,
          custom_data: Object.keys(finalCustomData).length > 0 ? finalCustomData : null,
        },
        imageFile,
      )

      if (error) throw new Error(error)

      toast({
        title: "Product updated!",
        description: `${formData.name} has been updated successfully.`,
      })

      setFormData({
        name: "",
        sku: "",
        category_id: "",
        price: "",
        cost_price: "",
        stock_quantity: "",
        description: "",
        show_in_marketplace: false,
        marketplace_order: 0,
      })
      setCustomData({})
      setCustomFieldsData([])
      setPriceSuggestions([])
      setImageFile(null)
      setImagePreview(null)
      setEditingProduct(null)
      setIsEditDialogOpen(false)
    } catch (err: any) {
      console.error("[v0] Error updating product:", err)
      toast({
        title: "Error updating product",
        description: err.message || "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const confirmDelete = (productId: string, productName: string) => {
    setDeleteConfirmProduct({ id: productId, name: productName })
  }

  const handleDelete = async () => {
    if (!deleteConfirmProduct) return

    setIsDeleting(deleteConfirmProduct.id)

    try {
      const { error } = await deleteProduct(deleteConfirmProduct.id)
      if (error) throw new Error(error)

      toast({
        title: "Product deleted",
        description: `${deleteConfirmProduct.name} has been removed from your inventory.`,
      })
      setDeleteConfirmProduct(null)
    } catch (err: any) {
      console.error("[v0] Error deleting product:", err)
      toast({
        title: "Error deleting product",
        description: err.message || "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-neutral-900 hover:bg-neutral-800 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>Create a new product in your inventory</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-1 max-h-[calc(90vh-200px)]">
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="image" className="font-semibold">
                          Product Image
                        </Label>
                        <div className="border-2 border-dashed border-neutral-300 rounded-lg hover:border-neutral-400 transition-colors bg-neutral-50">
                          {imagePreview ? (
                            <div className="relative p-4">
                              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white">
                                <Image
                                  src={imagePreview || "/placeholder.svg"}
                                  alt="Preview"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setImageFile(null)
                                  setImagePreview(null)
                                }}
                                className="absolute top-6 right-6 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor="image"
                              className="flex flex-col items-center justify-center cursor-pointer py-12 px-4"
                            >
                              <div className="p-4 bg-neutral-900 rounded-full mb-3">
                                <Upload className="w-8 h-8 text-white" />
                              </div>
                              <p className="text-sm text-neutral-900 font-semibold">Click to upload product image</p>
                              <p className="text-xs text-neutral-500 mt-2">PNG, JPG up to 5MB</p>
                            </label>
                          )}
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter product name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="sku">SKU *</Label>
                          <Input
                            id="sku"
                            placeholder="Enter SKU"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.category_id}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category_id: value === "none" ? "" : value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Category</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="cost_price">Cost Price (Optional)</Label>
                        <Input
                          id="cost_price"
                          type="number"
                          step="0.01"
                          placeholder="How much did it cost you?"
                          value={formData.cost_price}
                          onChange={(e) => {
                            setFormData({ ...formData, cost_price: e.target.value })
                            calculatePriceSuggestions(e.target.value)
                          }}
                        />
                        <p className="text-xs text-neutral-500">Enter your cost to see suggested sale prices</p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="price">Sale Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />

                        {priceSuggestions.length > 0 && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-semibold text-blue-900 mb-2">Suggested prices:</p>
                            <div className="flex flex-wrap gap-2">
                              {priceSuggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, price: suggestion.value })}
                                  className="px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-md hover:bg-blue-100 transition-colors font-medium"
                                >
                                  {suggestion.label}: ${suggestion.value}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {calculateProfitMargin() !== null && (
                          <p className="text-sm text-green-600 font-medium">
                            Profit margin: {calculateProfitMargin()}%
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="stock">Initial Stock *</Label>
                        <Input
                          id="stock"
                          type="number"
                          placeholder="0"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                          required
                        />
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

                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-neutral-50">
                        <input
                          type="checkbox"
                          id="show_in_marketplace"
                          checked={formData.show_in_marketplace}
                          onChange={(e) => setFormData({ ...formData, show_in_marketplace: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="show_in_marketplace"
                            className="font-semibold cursor-pointer flex items-center gap-2"
                          >
                            <Globe className="w-4 h-4" />
                            Display in Web Store
                          </Label>
                          <p className="text-xs text-neutral-500 mt-1">
                            Make this product visible in your public marketplace
                          </p>
                        </div>
                      </div>

                      {customFields.length > 0 && (
                        <div className="border-t pt-4 mt-2">
                          <h3 className="font-semibold text-neutral-900 mb-3">Predefined Custom Fields</h3>
                          <div className="grid gap-4">
                            {customFields.map((field) => (
                              <div key={field.id} className="grid gap-2">
                                <Label htmlFor={`custom-${field.id}`}>{field.name}</Label>
                                {field.field_type === "text" && (
                                  <Input
                                    id={`custom-${field.id}`}
                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                    value={customData[field.name] || ""}
                                    onChange={(e) => setCustomData({ ...customData, [field.name]: e.target.value })}
                                  />
                                )}
                                {field.field_type === "number" && (
                                  <Input
                                    id={`custom-${field.id}`}
                                    type="number"
                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                    value={customData[field.name] || ""}
                                    onChange={(e) => setCustomData({ ...customData, [field.name]: e.target.value })}
                                  />
                                )}
                                {field.field_type === "select" && field.options && (
                                  <Select
                                    value={customData[field.name] || ""}
                                    onValueChange={(value) => setCustomData({ ...customData, [field.name]: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4 mt-2">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-neutral-900">Additional Custom Fields</h3>
                            <p className="text-xs text-neutral-500 mt-1">
                              Add custom attributes like Size, Color, Material, etc.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={addCustomField}
                            className="p-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                            title="Add custom field"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {customFieldsData.length > 0 && (
                          <div className="space-y-3">
                            {customFieldsData.map((field, index) => (
                              <div key={index} className="flex gap-2 items-start p-3 bg-neutral-50 rounded-lg">
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <Input
                                    type="text"
                                    placeholder="Field name (e.g., Size)"
                                    value={field.key}
                                    onChange={(e) => updateCustomField(index, "key", e.target.value)}
                                  />
                                  <Input
                                    type="text"
                                    placeholder="Value (e.g., Large)"
                                    value={field.value}
                                    onChange={(e) => updateCustomField(index, "value", e.target.value)}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeCustomField(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {customFieldsData.length === 0 && (
                          <p className="text-sm text-neutral-500 text-center py-4">
                            No custom fields added yet. Click + to add one.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-neutral-900 hover:bg-neutral-800" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Product"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>Update product information</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="flex flex-col flex-1 overflow-hidden">
                  {/* Same form fields as create, but with handleUpdate */}
                  <div className="flex-1 overflow-y-auto px-1 max-h-[calc(90vh-200px)]">
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="image" className="font-semibold">
                          Product Image
                        </Label>
                        <div className="border-2 border-dashed border-neutral-300 rounded-lg hover:border-neutral-400 transition-colors bg-neutral-50">
                          {imagePreview ? (
                            <div className="relative p-4">
                              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white">
                                <Image
                                  src={imagePreview || "/placeholder.svg"}
                                  alt="Preview"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setImageFile(null)
                                  setImagePreview(null)
                                }}
                                className="absolute top-6 right-6 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor="image"
                              className="flex flex-col items-center justify-center cursor-pointer py-12 px-4"
                            >
                              <div className="p-4 bg-neutral-900 rounded-full mb-3">
                                <Upload className="w-8 h-8 text-white" />
                              </div>
                              <p className="text-sm text-neutral-900 font-semibold">Click to upload product image</p>
                              <p className="text-xs text-neutral-500 mt-2">PNG, JPG up to 5MB</p>
                            </label>
                          )}
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter product name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="sku">SKU *</Label>
                          <Input
                            id="sku"
                            placeholder="Enter SKU"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.category_id}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category_id: value === "none" ? "" : value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Category</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="cost_price">Cost Price (Optional)</Label>
                        <Input
                          id="cost_price"
                          type="number"
                          step="0.01"
                          placeholder="How much did it cost you?"
                          value={formData.cost_price}
                          onChange={(e) => {
                            setFormData({ ...formData, cost_price: e.target.value })
                            calculatePriceSuggestions(e.target.value)
                          }}
                        />
                        <p className="text-xs text-neutral-500">Enter your cost to see suggested sale prices</p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="price">Sale Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />

                        {priceSuggestions.length > 0 && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-semibold text-blue-900 mb-2">Suggested prices:</p>
                            <div className="flex flex-wrap gap-2">
                              {priceSuggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, price: suggestion.value })}
                                  className="px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-md hover:bg-blue-100 transition-colors font-medium"
                                >
                                  {suggestion.label}: ${suggestion.value}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {calculateProfitMargin() !== null && (
                          <p className="text-sm text-green-600 font-medium">
                            Profit margin: {calculateProfitMargin()}%
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="stock">Initial Stock *</Label>
                        <Input
                          id="stock"
                          type="number"
                          placeholder="0"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                          required
                        />
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

                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-neutral-50">
                        <input
                          type="checkbox"
                          id="show_in_marketplace"
                          checked={formData.show_in_marketplace}
                          onChange={(e) => setFormData({ ...formData, show_in_marketplace: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="show_in_marketplace"
                            className="font-semibold cursor-pointer flex items-center gap-2"
                          >
                            <Globe className="w-4 h-4" />
                            Display in Web Store
                          </Label>
                          <p className="text-xs text-neutral-500 mt-1">
                            Make this product visible in your public marketplace
                          </p>
                        </div>
                      </div>

                      {customFields.length > 0 && (
                        <div className="border-t pt-4 mt-2">
                          <h3 className="font-semibold text-neutral-900 mb-3">Predefined Custom Fields</h3>
                          <div className="grid gap-4">
                            {customFields.map((field) => (
                              <div key={field.id} className="grid gap-2">
                                <Label htmlFor={`custom-${field.id}`}>{field.name}</Label>
                                {field.field_type === "text" && (
                                  <Input
                                    id={`custom-${field.id}`}
                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                    value={customData[field.name] || ""}
                                    onChange={(e) => setCustomData({ ...customData, [field.name]: e.target.value })}
                                  />
                                )}
                                {field.field_type === "number" && (
                                  <Input
                                    id={`custom-${field.id}`}
                                    type="number"
                                    placeholder={`Enter ${field.name.toLowerCase()}`}
                                    value={customData[field.name] || ""}
                                    onChange={(e) => setCustomData({ ...customData, [field.name]: e.target.value })}
                                  />
                                )}
                                {field.field_type === "select" && field.options && (
                                  <Select
                                    value={customData[field.name] || ""}
                                    onValueChange={(value) => setCustomData({ ...customData, [field.name]: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4 mt-2">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-neutral-900">Additional Custom Fields</h3>
                            <p className="text-xs text-neutral-500 mt-1">
                              Add custom attributes like Size, Color, Material, etc.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={addCustomField}
                            className="p-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                            title="Add custom field"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {customFieldsData.length > 0 && (
                          <div className="space-y-3">
                            {customFieldsData.map((field, index) => (
                              <div key={index} className="flex gap-2 items-start p-3 bg-neutral-50 rounded-lg">
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <Input
                                    type="text"
                                    placeholder="Field name (e.g., Size)"
                                    value={field.key}
                                    onChange={(e) => updateCustomField(index, "key", e.target.value)}
                                  />
                                  <Input
                                    type="text"
                                    placeholder="Value (e.g., Large)"
                                    value={field.value}
                                    onChange={(e) => updateCustomField(index, "value", e.target.value)}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeCustomField(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {customFieldsData.length === 0 && (
                          <p className="text-sm text-neutral-500 text-center py-4">
                            No custom fields added yet. Click + to add one.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false)
                        setEditingProduct(null)
                      }}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-neutral-900 hover:bg-neutral-800" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Product"
                      )}
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("table")}
                className={viewMode === "table" ? "wave-gradient" : ""}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "wave-gradient" : ""}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-initial bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                <span className="sm:inline">Filter</span>
              </Button>
            </div>
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
                      {/* Added marketplace column header */}
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                        Marketplace
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-neutral-600">
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
                          onClick={() => setPreviewProduct(product)}
                          className="border-b border-neutral-100 hover:bg-neutral-900 hover:text-white group transition-all duration-300 cursor-pointer" // Changed hover from bg-neutral-50 to bg-neutral-900
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleMarketplace(product.id, product.show_in_marketplace || false)
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                product.show_in_marketplace
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {product.show_in_marketplace ? "Live" : "Hidden"}
                            </button>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4">
                            <div className="flex gap-1 sm:gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(product)
                                }}
                                className="p-1.5 sm:p-2 hover:bg-neutral-700 rounded-lg transition-colors" // Changed hover color
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4 group-hover:text-white" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  confirmDelete(product.id, product.name) // Use confirmation
                                }}
                                className="p-1.5 sm:p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                              >
                                {isDeleting === product.id ? (
                                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
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
                  onClick={() => setPreviewProduct(product)}
                  className="cursor-pointer"
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(product)
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 hover:bg-red-500 hover:text-white hover:border-red-500 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmDelete(product.id, product.name) // Use confirmation
                            setPreviewProduct(null)
                          }}
                        >
                          {isDeleting === product.id ? (
                            <>
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        )}

        <Dialog open={!!deleteConfirmProduct} onOpenChange={() => setDeleteConfirmProduct(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Product?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{deleteConfirmProduct?.name}</strong>? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDeleteConfirmProduct(null)} disabled={!!isDeleting}>
                Cancel
              </Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white" disabled={!!isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!previewProduct} onOpenChange={() => setPreviewProduct(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{previewProduct?.name}</DialogTitle>
              <DialogDescription>Product Details</DialogDescription>
            </DialogHeader>
            {previewProduct && (
              <div className="space-y-6">
                {previewProduct.image_url && (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-100">
                    <Image
                      src={previewProduct.image_url || "/placeholder.svg"}
                      alt={previewProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">SKU</p>
                    <p className="font-semibold text-neutral-900">{previewProduct.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Price</p>
                    <p className="font-semibold text-neutral-900 text-xl">${previewProduct.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Stock Quantity</p>
                    <p className="font-semibold text-neutral-900">{previewProduct.stock_quantity} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Status</p>
                    <p className="font-semibold text-neutral-900">
                      {previewProduct.stock_quantity > 10 ? (
                        <span className="text-green-600">In Stock</span>
                      ) : previewProduct.stock_quantity > 0 ? (
                        <span className="text-orange-600">Low Stock</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </p>
                  </div>
                </div>
                {previewProduct.description && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-2">Description</p>
                    <p className="text-neutral-900">{previewProduct.description}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Product
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-red-500 hover:text-white hover:border-red-500 bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(previewProduct.id, previewProduct.name)
                      setPreviewProduct(null)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
