"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock_quantity: number
  category_id?: string
  image_url?: string
  description?: string
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
  categories?: {
    id: string
    name: string
    icon?: string
  }
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
        let query = supabase
          .from("products")
          .select(`
          *,
          categories (
            id,
            name,
            icon
          )
        `)
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        // Apply filters
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
      // 1. Insert product first (without image_url)
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          ...productData,
          user_id: user.id,
        })
        .select()
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
          // If update fails, delete the uploaded image
          await deleteProductImage(imageUrl)
          throw updateError
        }
      }

      // 4. Update local state
      const productWithImage = { ...product, image_url: imageUrl }
      setProducts((prev) => [productWithImage, ...prev])

      return { data: productWithImage, error: null }
    } catch (err: any) {
      console.error("Error creating product:", err)
      return { data: null, error: err.message }
    }
  }

  // Update product (with image handling)
  const updateProduct = async (productId: string, updates: Partial<Product>, newImageFile?: File | null) => {
    if (!user) throw new Error("User not authenticated")

    try {
      let imageUrl = updates.image_url

      // If there's a new image
      if (newImageFile) {
        // Delete old image if exists
        if (updates.image_url) {
          await deleteProductImage(updates.image_url)
        }

        // Upload new image
        imageUrl = await uploadProductImage(newImageFile, productId, user.id)
      }

      // Update product
      const { data, error: updateError } = await supabase
        .from("products")
        .update({
          ...updates,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId)
        .eq("user_id", user.id)
        .select(`
          *,
          categories (id, name, icon)
        `)
        .single()

      if (updateError) throw updateError

      // Update local state
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
      const { error: deleteError } = await supabase
        .from("products")
        .update({ is_active: false })
        .eq("id", productId)
        .eq("user_id", user.id)

      if (deleteError) throw deleteError

      // Update local state
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
        const { data, error } = await supabase
          .from("products")
          .select(`
          *,
          categories (id, name, icon)
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

  // Real-time subscription
  useEffect(() => {
    if (!user) return

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
  }
}

// ============================================
// STORAGE HELPER FUNCTIONS
// ============================================

async function uploadProductImage(file: File, productId: string, userId: string): Promise<string> {
  try {
    // Validations
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must not exceed 5MB")
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${productId}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload to Storage
    const { data, error } = await supabase.storage.from("product-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Replace if exists
    })

    if (error) throw error

    // Get public URL
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
    // Extract path from URL
    const urlParts = imageUrl.split("/product-images/")
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    const { error } = await supabase.storage.from("product-images").remove([filePath])

    if (error) throw error
  } catch (err) {
    console.error("Error deleting image:", err)
    // Don't throw error here to not interrupt the flow
  }
}
