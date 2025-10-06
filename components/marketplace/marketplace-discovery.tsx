"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, Package, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

interface StoreData {
  id: string
  name: string
  description: string
  logo_url: string
  slug: string
  theme: {
    primaryColor: string
    secondaryColor: string
  }
  product_count: number
}

export function MarketplaceDiscovery() {
  const [stores, setStores] = useState<StoreData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStores() {
      const { data, error } = await supabase.rpc("get_active_stores")

      if (error) {
        console.error("Error fetching stores:", error)
      } else if (data) {
        setStores(data)
      }

      setLoading(false)
    }

    fetchStores()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-3xl bg-muted" />
        ))}
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <Store className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <CardTitle>No Stores Yet</CardTitle>
          <CardDescription>Check back soon for new stores and products!</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stores.map((store, index) => (
        <motion.div
          key={store.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Link href={`/store/${store.slug || store.id}`}>
            <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
              <div
                className="relative h-32 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${store.theme.primaryColor}, ${store.theme.secondaryColor})`,
                }}
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                  {store.logo_url ? (
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-white">
                      <Image
                        src={store.logo_url || "/placeholder.svg"}
                        alt={store.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-white/90 flex items-center justify-center">
                      <Store className="h-10 w-10 text-neutral-400" />
                    </div>
                  )}
                </div>
              </div>
              <CardHeader className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2 line-clamp-1 group-hover:text-primary">{store.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {store.description || "Discover unique products from this store"}
                    </CardDescription>
                  </div>
                  <ArrowRight className="ml-2 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="gap-1">
                  <Package className="h-3 w-3" />
                  {store.product_count} {store.product_count === 1 ? "Product" : "Products"}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
