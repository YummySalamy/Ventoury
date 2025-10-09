"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Store, Package, ArrowLeft, ShoppingCart, Mail, Phone, ChevronDown, ChevronUp, X } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { FiSearch } from "react-icons/fi"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { ProductDetailModal } from "./product-detail-modal"
import { CartSidebar } from "./cart-sidebar"
import { StoreHeader } from "./store-header"
import { Footer } from "@/components/landing/footer"
import { useCart } from "@/contexts/CartContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
  category_id: string | null
}

interface Business {
  id: string
  name: string
  description: string
  logo_url: string
  whatsapp: string
  email: string
  phone: string
  address: string
  theme: {
    primaryColor: string
    secondaryColor: string
  }
  slug: string
}

interface StoreData {
  business: Business
  categories: any[]
  products: Product[]
}

interface StoreViewProps {
  storeId: string
}

export function StoreView({ storeId }: StoreViewProps) {
  const [storeData, setStoreData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const [mobileCategorySelectorOpen, setMobileCategorySelectorOpen] = useState(false)

  const { setCurrentStoreId } = useCart()

  useEffect(() => {
    async function fetchStoreData() {
      const { data, error } = await supabase.rpc("get_marketplace_store", {
        store_identifier: storeId,
      })

      if (error || !data) {
        console.error("Error fetching store:", error)
        notFound()
      }

      setStoreData(data)
      setCurrentStoreId(data.business.id)

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", data.business.id)
        .eq("show_in_marketplace", true)
        .eq("is_active", true)
        .is("parent_id", null)
        .order("name")

      setCategories(categoriesData || [])
      setLoading(false)
    }

    fetchStoreData()
  }, [storeId, setCurrentStoreId])

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setProductModalOpen(true)
  }

  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return ""
    const category = categories.find((c: any) => c.id === categoryId)
    return category?.name || ""
  }

  const getCategoryColor = (categoryId: string | null): string => {
    if (!categoryId) return "#3b82f6"
    const category = categories.find((c: any) => c.id === categoryId)
    return category?.color || "#3b82f6"
  }

  if (loading) {
    return (
      <>
        <StoreHeader />
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="mb-8 h-32 animate-pulse rounded-3xl bg-muted" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!storeData) {
    notFound()
  }

  const { business, products } = storeData
  let filteredProducts = products

  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter((p: any) => selectedCategories.includes(p.category_id))
  }

  if (searchQuery.trim()) {
    filteredProducts = filteredProducts.filter(
      (p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  const MAX_VISIBLE_CATEGORIES = 6
  const visibleCategories = categoriesExpanded ? categories : categories.slice(0, MAX_VISIBLE_CATEGORIES)
  const hiddenCategoriesCount = categories.length - MAX_VISIBLE_CATEGORIES

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const clearAllCategories = () => {
    setSelectedCategories([])
  }

  return (
    <>
      <StoreHeader />
      <div
        className="min-h-screen bg-white pt-16"
        style={
          {
            "--color-primary": business.theme.primaryColor,
            "--color-secondary": business.theme.secondaryColor,
          } as React.CSSProperties
        }
      >
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Store Header */}
          <div className="mb-8">
            <Link href="/store">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Stores
              </Button>
            </Link>

            <Card className="overflow-hidden">
              <div
                className="relative h-48 md:h-64 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${business.theme.primaryColor}, ${business.theme.secondaryColor})`,
                }}
              >
                {/* Wave pattern overlay */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path
                      fill="white"
                      fillOpacity="0.3"
                      d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                  </svg>
                </div>

                <div className="absolute left-6 md:left-8 bottom-6 md:bottom-8 p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl">
                  {business.logo_url ? (
                    <div className="relative h-20 w-20 md:h-28 md:w-28 rounded-xl overflow-hidden bg-white">
                      <Image
                        src={business.logo_url || "/placeholder.svg"}
                        alt={business.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 80px, 112px"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 md:h-28 md:w-28 rounded-xl bg-white/90 flex items-center justify-center">
                      <Store className="h-10 w-10 md:h-14 md:w-14 text-neutral-400" />
                    </div>
                  )}
                </div>
              </div>

              <CardHeader className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2 flex items-center gap-2 text-2xl md:text-3xl">{business.name}</CardTitle>
                    {business.description && (
                      <CardDescription className="text-sm md:text-base">{business.description}</CardDescription>
                    )}
                    {business.address && <p className="mt-2 text-sm text-muted-foreground">{business.address}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Package className="h-3 w-3" />
                      {products.length} {products.length === 1 ? "Product" : "Products"}
                    </Badge>
                  </div>
                </div>

                {(business.whatsapp || business.email || business.phone) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {business.whatsapp && (
                      <Button
                        size="sm"
                        className="gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white"
                        onClick={() => window.open(`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`, "_blank")}
                      >
                        <FaWhatsapp className="h-4 w-4" />
                        WhatsApp
                      </Button>
                    )}
                    {business.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 bg-transparent"
                        onClick={() => window.open(`mailto:${business.email}`, "_blank")}
                      >
                        <Mail className="h-4 w-4" />
                        {business.email}
                      </Button>
                    )}
                    {business.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 bg-transparent"
                        onClick={() => window.open(`tel:${business.phone}`, "_blank")}
                      >
                        <Phone className="h-4 w-4" />
                        {business.phone}
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>
            </Card>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 backdrop-blur-md bg-white/60 border-neutral-200/50 rounded-full shadow-sm focus:bg-white/80 transition-all"
              />
            </div>
          </div>

          {/* Categories Section */}
          {!loading && categories.length > 0 && (
            <>
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-neutral-600">Browse by Category</h3>

                {/* Desktop View */}
                <div className="hidden md:block">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={clearAllCategories}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategories.length === 0
                          ? "bg-neutral-900 text-white shadow-lg"
                          : "backdrop-blur-md bg-white/60 border border-neutral-200 text-neutral-700 hover:bg-white/80"
                      }`}
                    >
                      All Products
                      <span className="ml-2 text-xs opacity-70">({products.length})</span>
                    </button>

                    <AnimatePresence>
                      {visibleCategories.map((category: any) => {
                        const categoryProducts = products.filter((p: any) => p.category_id === category.id)
                        const isSelected = selectedCategories.includes(category.id)
                        return (
                          <motion.button
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => toggleCategory(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                              isSelected
                                ? "text-white shadow-lg"
                                : "backdrop-blur-md bg-white/60 border border-neutral-200 text-neutral-700 hover:bg-white/80"
                            }`}
                            style={
                              isSelected
                                ? {
                                    background: `linear-gradient(135deg, ${category.color || "#3b82f6"}, ${category.color || "#3b82f6"}dd)`,
                                  }
                                : {}
                            }
                          >
                            {category.image_url && (
                              <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                <Image
                                  src={category.image_url || "/placeholder.svg"}
                                  alt={category.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            {category.name}
                            <span className="text-xs opacity-70">({categoryProducts.length})</span>
                          </motion.button>
                        )
                      })}
                    </AnimatePresence>

                    {/* Expand/Collapse Button */}
                    {categories.length > MAX_VISIBLE_CATEGORIES && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                        className="px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md bg-white/60 border border-neutral-200 text-neutral-700 hover:bg-white/80 transition-all flex items-center gap-2"
                      >
                        {categoriesExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            +{hiddenCategoriesCount}
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  {categories.length > 5 ? (
                    <>
                      <Dialog open={mobileCategorySelectorOpen} onOpenChange={setMobileCategorySelectorOpen}>
                        <DialogTrigger asChild>
                          <button className="w-full h-12 backdrop-blur-md bg-white/60 border border-neutral-200/50 rounded-full px-4 flex items-center justify-between text-sm font-medium text-neutral-700 hover:bg-white/80 transition-all">
                            <span>
                              {selectedCategories.length === 0
                                ? "All Products"
                                : selectedCategories.length === 1
                                  ? categories.find((c) => c.id === selectedCategories[0])?.name
                                  : `${selectedCategories.length} Categories Selected`}
                            </span>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                              <span>Select Categories</span>
                              {selectedCategories.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={clearAllCategories}
                                  className="text-xs text-neutral-500 hover:text-neutral-700"
                                >
                                  Clear All
                                </Button>
                              )}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="max-h-[60vh] overflow-y-auto space-y-2 pt-4 pr-2">
                            {/* All Products Button */}
                            <button
                              onClick={() => {
                                clearAllCategories()
                                setMobileCategorySelectorOpen(false)
                              }}
                              className={`w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-between ${
                                selectedCategories.length === 0
                                  ? "bg-neutral-900 text-white shadow-lg"
                                  : "backdrop-blur-md bg-white/60 border border-neutral-200 text-neutral-700 hover:bg-white/80"
                              }`}
                            >
                              <span>All Products</span>
                              <span className="text-xs opacity-70">({products.length})</span>
                            </button>

                            {/* Category Buttons */}
                            {categories.map((category: any) => {
                              const categoryProducts = products.filter((p: any) => p.category_id === category.id)
                              const isSelected = selectedCategories.includes(category.id)
                              return (
                                <button
                                  key={category.id}
                                  onClick={() => toggleCategory(category.id)}
                                  className={`w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all flex items-center gap-3 ${
                                    isSelected
                                      ? "text-white shadow-lg"
                                      : "backdrop-blur-md bg-white/60 border border-neutral-200 text-neutral-700 hover:bg-white/80"
                                  }`}
                                  style={
                                    isSelected
                                      ? {
                                          background: `linear-gradient(135deg, ${category.color || "#3b82f6"}, ${category.color || "#3b82f6"}dd)`,
                                        }
                                      : {}
                                  }
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    {category.image_url && (
                                      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                                        <Image
                                          src={category.image_url || "/placeholder.svg"}
                                          alt={category.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    )}
                                    <span className="flex-1 text-left">{category.name}</span>
                                  </div>
                                  <span className="text-xs opacity-70">({categoryProducts.length})</span>
                                </button>
                              )
                            })}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Selected Categories Pills */}
                      {selectedCategories.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedCategories.map((categoryId) => {
                            const category = categories.find((c) => c.id === categoryId)
                            if (!category) return null
                            return (
                              <button
                                key={categoryId}
                                onClick={() => toggleCategory(categoryId)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-md flex items-center gap-2 transition-all hover:shadow-lg"
                                style={{
                                  background: `linear-gradient(135deg, ${category.color || "#3b82f6"}, ${category.color || "#3b82f6"}dd)`,
                                }}
                              >
                                {category.name}
                                <X className="h-3 w-3" />
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={clearAllCategories}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedCategories.length === 0
                            ? "bg-neutral-900 text-white shadow-lg"
                            : "backdrop-blur-md bg-white/60 border border-neutral-200 text-neutral-700 hover:bg-white/80"
                        }`}
                      >
                        All Products
                        <span className="ml-2 text-xs opacity-70">({products.length})</span>
                      </button>

                      {categories.map((category: any) => {
                        const categoryProducts = products.filter((p: any) => p.category_id === category.id)
                        const isSelected = selectedCategories.includes(category.id)
                        return (
                          <button
                            key={category.id}
                            onClick={() => toggleCategory(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                              isSelected
                                ? "text-white shadow-lg"
                                : "backdrop-blur-md bg-white/60 border border-neutral-200 text-neutral-700 hover:bg-white/80"
                            }`}
                            style={
                              isSelected
                                ? {
                                    background: `linear-gradient(135deg, ${category.color || "#3b82f6"}, ${category.color || "#3b82f6"}dd)`,
                                  }
                                : {}
                            }
                          >
                            {category.image_url && (
                              <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                <Image
                                  src={category.image_url || "/placeholder.svg"}
                                  alt={category.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            {category.name}
                            <span className="text-xs opacity-70">({categoryProducts.length})</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <Separator className="my-6" />
            </>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="col-span-full">
              <div className="backdrop-blur-md bg-white/60 border border-neutral-200/50 rounded-3xl p-12 text-center shadow-lg">
                <div className="max-w-md mx-auto">
                  <div className="mb-6 inline-flex p-4 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200">
                    <Package className="h-12 w-12 text-neutral-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                    {searchQuery.trim()
                      ? "No Results Found"
                      : selectedCategories.length === 0
                        ? "No Products Yet"
                        : "Nothing Here"}
                  </h3>
                  <p className="text-neutral-600 mb-2">
                    {searchQuery.trim()
                      ? `No products match "${searchQuery}". Try a different search term.`
                      : selectedCategories.length === 0
                        ? "This store is setting up their catalog."
                        : "No products available in selected categories at the moment."}
                  </p>
                  {!searchQuery.trim() && selectedCategories.length === 0 && (
                    <p className="text-sm text-neutral-500 italic">Check back soon for new arrivals</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card
                    className="group h-full overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={product.image_url || "/placeholder.svg?height=400&width=400"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {product.stock_quantity === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 text-base md:text-lg">{product.name}</CardTitle>
                        {product.category_id && (
                          <Badge
                            variant="outline"
                            className="shrink-0 text-xs border-0"
                            style={{
                              backgroundColor: `${getCategoryColor(product.category_id)}20`,
                              color: getCategoryColor(product.category_id),
                            }}
                          >
                            {getCategoryName(product.category_id)}
                          </Badge>
                        )}
                      </div>
                      {product.description && (
                        <CardDescription className="line-clamp-2 text-xs md:text-sm">
                          {product.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold md:text-2xl">${product.price.toFixed(2)}</span>
                        <Button
                          size="sm"
                          disabled={product.stock_quantity === 0}
                          className="gap-2"
                          onClick={(e: any) => {
                            e.stopPropagation()
                            handleProductClick(product)
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span className="hidden sm:inline">Add</span>
                        </Button>
                      </div>
                      {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                          Only {product.stock_quantity} left in stock
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <ProductDetailModal product={selectedProduct} open={productModalOpen} onOpenChange={setProductModalOpen} />

        {business.whatsapp && <CartSidebar businessWhatsApp={business.whatsapp} businessName={business.name} />}
      </div>
      <Footer />
    </>
  )
}
