"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Tag, Package, TrendingUp } from "lucide-react"
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

const categories = [
  { id: 1, name: "Electronics", products: 45, value: "$12,450", growth: "+12.5%", color: "from-blue-500 to-cyan-600" },
  { id: 2, name: "Accessories", products: 120, value: "$8,230", growth: "+8.3%", color: "from-purple-500 to-pink-600" },
  { id: 3, name: "Furniture", products: 28, value: "$15,670", growth: "+15.2%", color: "from-orange-500 to-red-600" },
  {
    id: 4,
    name: "Office Supplies",
    products: 89,
    value: "$5,890",
    growth: "+5.7%",
    color: "from-green-500 to-emerald-600",
  },
]

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input id="categoryName" placeholder="Enter category name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Category description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-neutral-900 hover:bg-neutral-800" onClick={() => setIsDialogOpen(false)}>
                  Create Category
                </Button>
              </div>
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
                <p className="text-2xl font-bold text-neutral-900">12</p>
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
                <p className="text-2xl font-bold text-neutral-900">282</p>
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
                <p className="text-2xl font-bold text-neutral-900">$42,240</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${category.color} rounded-xl`}>
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-green-600">{category.growth}</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{category.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Products</span>
                    <span className="font-semibold text-neutral-900">{category.products}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Total Value</span>
                    <span className="font-semibold text-neutral-900">{category.value}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
