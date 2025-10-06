"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface Customer {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomerStats {
  total_purchases: number
  total_spent: number
  pending_amount: number
}

export interface CustomerWithStats extends Customer {
  stats?: CustomerStats
}

export function useCustomers() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = useCallback(
    async (search?: string) => {
      if (!user) return { data: null, error: "Not authenticated" }

      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from("customers")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("name", { ascending: true })

        if (search) {
          query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        setCustomers(data || [])
        return { data, error: null }
      } catch (err: any) {
        setError(err.message)
        return { data: null, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const createCustomer = async (customerData: Partial<Customer>) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { data, error: createError } = await supabase
        .from("customers")
        .insert({
          ...customerData,
          user_id: user.id,
        })
        .select()
        .single()

      if (createError) throw createError

      setCustomers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { data, error: updateError } = await supabase
        .from("customers")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setCustomers((prev) => prev.map((c) => (c.id === customerId ? data : c)))
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const deleteCustomer = async (customerId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      // Check if customer has sales
      const { data: sales } = await supabase.from("sales").select("id").eq("customer_id", customerId).limit(1)

      if (sales && sales.length > 0) {
        return { error: "Cannot delete customer with associated sales" }
      }

      const { error: deleteError } = await supabase
        .from("customers")
        .update({ is_active: false })
        .eq("id", customerId)
        .eq("user_id", user.id)

      if (deleteError) throw deleteError

      setCustomers((prev) => prev.filter((c) => c.id !== customerId))
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  const getCustomerStats = async (customerId: string): Promise<CustomerStats | null> => {
    try {
      const { data, error } = await supabase.rpc("get_customer_stats", {
        customer_uuid: customerId,
      })

      if (error) throw error
      return data[0] || { total_purchases: 0, total_spent: 0, pending_amount: 0 }
    } catch (err) {
      console.error("Error fetching customer stats:", err)
      return null
    }
  }

  const getCustomerSalesHistory = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from("sales")
        .select(
          `
          *,
          sale_items (
            *,
            products (name, sku)
          )
        `,
        )
        .eq("customer_id", customerId)
        .order("sale_date", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("customers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customers",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCustomers((prev) => [...prev, payload.new as Customer].sort((a, b) => a.name.localeCompare(b.name)))
          } else if (payload.eventType === "UPDATE") {
            setCustomers((prev) =>
              prev.map((c) => (c.id === (payload.new as Customer).id ? (payload.new as Customer) : c)),
            )
          } else if (payload.eventType === "DELETE") {
            setCustomers((prev) => prev.filter((c) => c.id !== (payload.old as Customer).id))
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
      fetchCustomers()
    }
  }, [user, fetchCustomers])

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats,
    getCustomerSalesHistory,
  }
}
