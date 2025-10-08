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
  tax_id?: string
  date_of_birth?: string
  customer_type?: "regular" | "vip" | "wholesale"
  credit_limit?: number
  discount_value?: number
  discount_type?: "none" | "percentage" | "fixed"
  tags?: string[]
  social_media?: Record<string, string>
  created_at: string
  updated_at: string
}

export interface CustomerStats {
  total_purchases: number
  total_spent: number
  pending_amount: number
  avg_purchase: number
  first_purchase?: string
  last_purchase?: string
}

export interface CustomerWithStats extends Customer {
  stats?: CustomerStats
}

export interface DashboardStats {
  total_customers: number
  total_revenue: number
  avg_customer_value: number
}

export function useCustomers() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getDashboardStats = async (): Promise<DashboardStats | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase.rpc("get_customers_overview", {
        user_uuid: user.id,
      })

      if (error) throw error
      return data || { total_customers: 0, total_revenue: 0, avg_customer_value: 0 }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      return null
    }
  }

  const fetchCustomers = useCallback(
    async (search?: string, offset = 0, limit = 20) => {
      if (!user) return { data: null, error: "Not authenticated", totalCount: 0 }

      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase.rpc("get_customers_with_stats", {
          user_uuid: user.id,
          search_query: search || null,
          offset_val: offset,
          limit_val: limit,
        })

        if (fetchError) throw fetchError

        setCustomers(data?.customers || [])
        return { data: data?.customers || [], error: null, totalCount: data?.total_count || 0 }
      } catch (err: any) {
        setError(err.message)
        return { data: null, error: err.message, totalCount: 0 }
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
          customer_type: customerData.customer_type || "regular",
          discount_type: customerData.discount_type || "none",
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
      return data || { total_purchases: 0, total_spent: 0, pending_amount: 0, avg_purchase: 0 }
    } catch (err) {
      console.error("Error fetching customer stats:", err)
      return null
    }
  }

  const getCustomerSalesHistory = async (customerId: string) => {
    try {
      const { data, error } = await supabase.rpc("get_customer_sales_with_items", {
        customer_uuid: customerId,
      })

      if (error) throw error
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const checkCreditLimit = async (customerId: string, saleAmount: number): Promise<boolean> => {
    try {
      const customer = customers.find((c) => c.id === customerId)
      if (!customer || !customer.credit_limit) return true

      const stats = await getCustomerStats(customerId)
      if (!stats) return true

      const totalOwed = stats.pending_amount
      return totalOwed + saleAmount <= customer.credit_limit
    } catch (err) {
      console.error("Error checking credit limit:", err)
      return true
    }
  }

  const calculateDiscount = (customerId: string, amount: number): number => {
    const customer = customers.find((c) => c.id === customerId)
    if (!customer || !customer.discount_value || customer.discount_type === "none") return 0

    if (customer.discount_type === "percentage") {
      return (amount * customer.discount_value) / 100
    } else {
      return customer.discount_value
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
    getDashboardStats,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats,
    getCustomerSalesHistory,
    checkCreditLimit,
    calculateDiscount,
  }
}
