"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Edit, Trash2, Package } from "lucide-react"
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

const products = [
  {
    id: 1,
    name: "Wireless Mouse",
    category: "Electronics",
    stock: 45,
    price: "$29.99",
    status: "In Stock",
    sku: "WM-001",
  },
  { id: 2, name: "USB Cable", category: "Accessories", stock: 120, price: "$9.99", status: "In Stock", sku: "UC-002" },
  { id: 3, name: "Laptop Stand", category: "Furniture", stock: 8, price: "$49.99", status: "Low Stock", sku: "LS-003" },
  {
    id: 4,
    name: "Keyboard",
    category: "Electronics",
    stock: 0,
    price: "$79.99",
    status: "Out of Stock",
    sku: "KB-004",
  },
  { id: 5, name: "Monitor", category: "Electronics", stock: 23, price: "$299.99", status: "In Stock", sku: "MN-005" },
]

export default function ProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">
              Products <span className="italic font-light text-neutral-600">Management</span>
            </h1>
            <p className="text-neutral-600 mt-2">Manage your product catalog and inventory</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neutral-900 hover:bg-neutral-800">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Create a new product in your inventory</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" placeholder="Enter product name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="Enter SKU" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" placeholder="Category" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" type="number" placeholder="0.00" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Product description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-neutral-900 hover:bg-neutral-800" onClick={() => setIsDialogOpen(false)}>
                  Create Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Products</p>
                <p className="text-2xl font-bold text-neutral-900">196</p>
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
                <p className="text-2xl font-bold text-neutral-900">168</p>
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
                <p className="text-2xl font-bold text-neutral-900">28</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mb-6">
          <div className="flex gap-4">
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

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">SKU</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Product</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Category</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Stock</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Price</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-neutral-100 hover:bg-neutral-900 group transition-all duration-300"
                  >
                    <td className="py-4 px-4 text-neutral-600 group-hover:text-neutral-300 transition-colors">
                      {product.sku}
                    </td>
                    <td className="py-4 px-4 font-medium text-neutral-900 group-hover:text-white transition-colors">
                      {product.name}
                    </td>
                    <td className="py-4 px-4 text-neutral-600 group-hover:text-neutral-300 transition-colors">
                      {product.category}
                    </td>
                    <td className="py-4 px-4 text-neutral-600 group-hover:text-neutral-300 transition-colors">
                      {product.stock}
                    </td>
                    <td className="py-4 px-4 font-semibold text-neutral-900 group-hover:text-white transition-colors">
                      {product.price}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.status === "In Stock"
                            ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                            : product.status === "Low Stock"
                              ? "bg-yellow-100 text-yellow-700 group-hover:bg-yellow-200"
                              : "bg-red-100 text-red-700 group-hover:bg-red-200"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors group-hover:text-white">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-red-500 rounded-lg transition-colors group-hover:text-white">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
