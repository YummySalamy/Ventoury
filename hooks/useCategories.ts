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
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryStats {
  product_count: number
  total_value: number
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
      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name", { ascending: true })

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

      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
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

      setCategories((prev) => prev.map((c) => (c.id === categoryId ? data : c)))
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

      setCategories((prev) => prev.filter((c) => c.id !== categoryId))
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  const getCategoryStats = async (categoryId: string): Promise<CategoryStats | null> => {
    try {
      const { data, error } = await supabase.rpc("get_category_stats", {
        category_uuid: categoryId,
      })

      if (error) throw error
      return data[0] || { product_count: 0, total_value: 0 }
    } catch (err) {
      console.error("Error fetching category stats:", err)
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
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCategories((prev) => [...prev, payload.new as Category].sort((a, b) => a.name.localeCompare(b.name)))
          } else if (payload.eventType === "UPDATE") {
            setCategories((prev) =>
              prev.map((c) => (c.id === (payload.new as Category).id ? (payload.new as Category) : c)),
            )
          } else if (payload.eventType === "DELETE") {
            setCategories((prev) => prev.filter((c) => c.id !== (payload.old as Category).id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

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
    getCategoryStats,
  }
}
