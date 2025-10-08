"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface Category {
  id: string
  user_id: string
  name: string
  description?: string
  icon?: string
  image_url?: string
  color?: string
  parent_id?: string
  show_in_marketplace: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  product_count?: number
  total_value?: number
  subcategories?: Category[]
}

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!user) return { data: null, error: "Not authenticated" }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase.rpc("get_categories_with_counts", {
        user_uuid: user.id,
      })

      if (fetchError) throw fetchError

      setCategories(data || [])
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [user])

  const createCategory = async (categoryData: Partial<Category>) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { data, error: createError } = await supabase
        .from("categories")
        .insert({
          ...categoryData,
          user_id: user.id,
        })
        .select()
        .single()

      if (createError) throw createError

      await fetchCategories()
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { data, error: updateError } = await supabase
        .from("categories")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", categoryId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchCategories()
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      // Check if category has products
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", categoryId)
        .eq("is_active", true)
        .limit(1)

      if (products && products.length > 0) {
        return { error: "Cannot delete category with associated products" }
      }

      // Soft delete
      const { error: deleteError } = await supabase
        .from("categories")
        .update({ is_active: false })
        .eq("id", categoryId)
        .eq("user_id", user.id)

      if (deleteError) throw deleteError

      await fetchCategories()
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  const uploadCategoryImage = async (file: File): Promise<string | null> => {
    if (!user) return null

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("category-images").upload(fileName, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("category-images").getPublicUrl(fileName)

      return publicUrl
    } catch (err) {
      console.error("Error uploading image:", err)
      return null
    }
  }

  // Real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("categories-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCategories()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchCategories])

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user, fetchCategories])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage,
  }
}
