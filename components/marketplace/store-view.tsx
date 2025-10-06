"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Store, Package, ArrowLeft, ShoppingCart, Mail, Phone } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { ProductDetailModal } from "./product-detail-modal"
import { CartSidebar } from "./cart-sidebar"
import { StoreHeader } from "./store-header"
import { Footer } from "@/components/landing/footer"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
  category: string
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
  categories: string[]
  products: Product[]
}

interface StoreViewProps {
  storeId: string
}

export function StoreView({ storeId }: StoreViewProps) {
  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)

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
      setLoading(false)
    }

    fetchStoreData()
  }, [storeId])

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setProductModalOpen(true)
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

  const { business, categories, products } = storeData
  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((p) => p.category === selectedCategory)

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

          {categories.length > 0 && (
            <>
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Filter by Category</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All Products
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator className="my-6" />
            </>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <Card className="mx-auto max-w-md">
              <CardHeader className="text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <CardTitle>No Products Available</CardTitle>
                <CardDescription>
                  {selectedCategory === "all"
                    ? "This store hasn't listed any products yet."
                    : "No products in this category."}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
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
                        {product.category && (
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {product.category}
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
                          onClick={(e) => {
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
