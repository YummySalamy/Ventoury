"use client"

import { useState, useCallback } from "react"
import { getSupabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface ProductHistory {
  id: string
  change_type: "creation" | "price_update" | "stock_update" | "restock"
  cost_price: number | null
  wholesale_price: number | null
  retail_price: number | null
  price: number | null
  stock_before: number | null
  stock_after: number | null
  quantity_added: number | null
  notes: string | null
  created_at: string
}

export interface InventoryMovement {
  product_id: string
  product_name: string
  sku: string
  change_type: string
  stock_before: number
  stock_after: number
  quantity_changed: number
  cost_price: number | null
  date: string
}

export function useInventory() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getProductHistory = useCallback(
    async (productId: string): Promise<{ data: ProductHistory[] | null; error: string | null }> => {
      if (!user) return { data: null, error: "Not authenticated" }

      setLoading(true)
      setError(null)

      try {
        const supabase = getSupabase()
        const { data, error: rpcError } = await supabase.rpc("get_product_history", {
          product_uuid: productId,
        })

        if (rpcError) throw rpcError

        return { data, error: null }
      } catch (err: any) {
        console.error("[v0] Error fetching product history:", err)
        setError(err.message)
        return { data: null, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const getInventoryMovements = useCallback(
    async (startDate: string, endDate: string): Promise<{ data: InventoryMovement[] | null; error: string | null }> => {
      if (!user) return { data: null, error: "Not authenticated" }

      setLoading(true)
      setError(null)

      try {
        const supabase = getSupabase()
        const { data, error: rpcError } = await supabase.rpc("get_inventory_movements", {
          user_uuid: user.id,
          start_date: startDate,
          end_date: endDate,
        })

        if (rpcError) throw rpcError

        return { data, error: null }
      } catch (err: any) {
        console.error("[v0] Error fetching inventory movements:", err)
        setError(err.message)
        return { data: null, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  return {
    loading,
    error,
    getProductHistory,
    getInventoryMovements,
  }
}
