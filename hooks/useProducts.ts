"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  cost_price?: number
  wholesale_price?: number // Added wholesale price
  retail_price?: number // Added retail price
  weighted_avg_cost?: number // Added weighted average cost
  profit_margin?: number
  stock_quantity: number
  min_stock_alert?: number // Added custom min stock alert
  max_stock_target?: number // Added max stock target
  category_id?: string
  image_url?: string
  description?: string
  custom_data?: Record<string, any>
  show_in_marketplace?: boolean
  marketplace_order?: number
  low_stock_threshold?: number
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
  last_modified?: string // Added last modified timestamp
  categories?: {
    id: string
    name: string
    icon?: string
    color?: string // Added color for category tags
  }
  is_low_stock?: boolean // Calculated field from RPC
}

export interface InventoryStats {
  total_products: number
  in_stock: number
  out_of_stock: number
  low_stock_custom: number
  inventory_value: {
    at_cost: number
    at_wholesale: number
    at_retail: number
    potential_profit_wholesale: number
    potential_profit_retail: number
  }
}

export interface SearchProductsResult {
  products: Product[]
  total_count: number
}

export function useProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products with optional filters
  const fetchProducts = useCallback(
    async (filters: { category_id?: string; search?: string } = {}) => {
      if (!user) return { data: null, error: "Not authenticated" }

      setLoading(true)
      setError(null)

      try {
        const supabase = getSupabase()
        let query = supabase
          .from("products")
          .select(`
          *,
          categories (
            id,
            name,
            icon,
            color
          )
        `)
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (filters.category_id) {
          query = query.eq("category_id", filters.category_id)
        }

        if (filters.search) {
          query = query.ilike("name", `%${filters.search}%`)
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        setProducts(data || [])
        return { data, error: null }
      } catch (err: any) {
        setError(err.message)
        console.error("Error fetching products:", err)
        return { data: null, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  // Create product with optional image
  const createProduct = async (productData: Partial<Product>, imageFile?: File | null) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const supabase = getSupabase()
      // 1. Insert product first (without image_url)
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          ...productData,
          user_id: user.id,
          custom_data: productData.custom_data || {},
        })
        .select(`
          *,
          categories (id, name, icon, color)
        `)
        .single()

      if (productError) throw productError

      // 2. If there's an image, upload it to Storage
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile, product.id, user.id)

        // 3. Update product with image URL
        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: imageUrl })
          .eq("id", product.id)

        if (updateError) {
          await deleteProductImage(imageUrl)
          throw updateError
        }
      }

      // 4. Update local state
      const productWithImage = { ...product, image_url: imageUrl }
      setProducts((prev) => [productWithImage, ...prev])

      return { data: productWithImage, error: null }
    } catch (err: any) {
      console.error("[v0] Error creating product:", err)
      return { data: null, error: err.message }
    }
  }

  // Update product (with image handling)
  const updateProduct = async (productId: string, updates: Partial<Product>, newImageFile?: File | null) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const supabase = getSupabase()
      let imageUrl = updates.image_url

      if (newImageFile) {
        if (updates.image_url) {
          await deleteProductImage(updates.image_url)
        }
        imageUrl = await uploadProductImage(newImageFile, productId, user.id)
      }

      const { data, error: updateError } = await supabase
        .from("products")
        .update({
          ...updates,
          image_url: imageUrl,
          custom_data: updates.custom_data || {},
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId)
        .eq("user_id", user.id)
        .select(`
          *,
          categories (id, name, icon, color)
        `)
        .single()

      if (updateError) throw updateError

      setProducts((prev) => prev.map((p) => (p.id === productId ? data : p)))

      return { data, error: null }
    } catch (err: any) {
      console.error("Error updating product:", err)
      return { data: null, error: err.message }
    }
  }

  // Soft delete
  const deleteProduct = async (productId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const supabase = getSupabase()
      const { error: deleteError } = await supabase
        .from("products")
        .update({ is_active: false })
        .eq("id", productId)
        .eq("user_id", user.id)

      if (deleteError) throw deleteError

      setProducts((prev) => prev.filter((p) => p.id !== productId))

      return { error: null }
    } catch (err: any) {
      console.error("Error deleting product:", err)
      return { error: err.message }
    }
  }

  // Get product by ID
  const getProductById = useCallback(
    async (productId: string) => {
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from("products")
          .select(`
          *,
          categories (id, name, icon, color)
        `)
          .eq("id", productId)
          .eq("user_id", user?.id)
          .single()

        if (error) throw error

        return { data, error: null }
      } catch (err: any) {
        console.error("Error fetching product:", err)
        return { data: null, error: err.message }
      }
    },
    [user],
  )

  const getInventoryStats = useCallback(async (): Promise<{ data: InventoryStats | null; error: string | null }> => {
    if (!user) return { data: null, error: "Not authenticated" }

    try {
      const supabase = getSupabase()
      const { data, error: rpcError } = await supabase.rpc("get_inventory_stats", {
        user_uuid: user.id,
      })

      if (rpcError) throw rpcError

      return { data, error: null }
    } catch (err: any) {
      console.error("[v0] Error fetching inventory stats:", err)
      return { data: null, error: err.message }
    }
  }, [user])

  const searchProducts = useCallback(
    async (filters: {
      search?: string
      category?: string | null
      stockFilter?: "all" | "in_stock" | "out_of_stock" | "low_stock"
      dateFrom?: string | null
      dateTo?: string | null
      offset?: number
      limit?: number
    }): Promise<{ data: SearchProductsResult | null; error: string | null }> => {
      if (!user) return { data: null, error: "Not authenticated" }

      try {
        const supabase = getSupabase()
        const { data, error: rpcError } = await supabase.rpc("search_products", {
          user_uuid: user.id,
          search_query: filters.search || null,
          category_filter: filters.category || null,
          stock_filter: filters.stockFilter || "all",
          date_from: filters.dateFrom || null,
          date_to: filters.dateTo || null,
          offset_val: filters.offset || 0,
          limit_val: filters.limit || 30,
        })

        if (rpcError) throw rpcError

        return { data, error: null }
      } catch (err: any) {
        console.error("[v0] Error searching products:", err)
        return { data: null, error: err.message }
      }
    },
    [user],
  )

  // Real-time subscription
  useEffect(() => {
    if (!user) return

    const supabase = getSupabase()
    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("[v0] Product change detected:", payload.eventType)
          if (payload.eventType === "INSERT") {
            setProducts((prev) => [payload.new as Product, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setProducts((prev) =>
              prev.map((p) => (p.id === (payload.new as Product).id ? (payload.new as Product) : p)),
            )
          } else if (payload.eventType === "DELETE") {
            setProducts((prev) => prev.filter((p) => p.id !== (payload.old as Product).id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Fetch initial products
  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user, fetchProducts])

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getInventoryStats, // Exported new function
    searchProducts, // Exported new function
  }
}

// ============================================
// STORAGE HELPER FUNCTIONS
// ============================================

async function uploadProductImage(file: File, productId: string, userId: string): Promise<string> {
  try {
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must not exceed 5MB")
    }

    const supabase = getSupabase()
    const fileExt = file.name.split(".").pop()
    const fileName = `${productId}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { data, error } = await supabase.storage.from("product-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath)

    return publicUrl
  } catch (err) {
    console.error("Error uploading image:", err)
    throw err
  }
}

async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    const urlParts = imageUrl.split("/product-images/")
    if (urlParts.length < 2) return

    const filePath = urlParts[1]
    const supabase = getSupabase()

    const { error } = await supabase.storage.from("product-images").remove([filePath])

    if (error) throw error
  } catch (err) {
    console.error("Error deleting image:", err)
  }
}
