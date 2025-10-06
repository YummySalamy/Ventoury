"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface Installment {
  id: string
  sale_id: string
  payment_number: number // Changed from installment_number
  amount: number
  due_date: string
  paid_date?: string
  status: "pending" | "paid" | "late" | "cancelled" // Added 'late' and 'cancelled'
  created_at: string
}

export function useInstallments() {
  const { user } = useAuth()
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInstallments = useCallback(
    async (filters: { sale_id?: string; status?: string } = {}) => {
      if (!user) return { data: null, error: "Not authenticated" }

      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from("installment_payments")
          .select(
            `
          *,
          sales (
            sale_number,
            customer_id,
            customers (name)
          )
        `,
          )
          .order("due_date", { ascending: true })

        if (!filters.sale_id) {
          const { data: userSales } = await supabase.from("sales").select("id").eq("user_id", user.id)

          const saleIds = userSales?.map((s) => s.id) || []
          query = query.in("sale_id", saleIds)
        }

        if (filters.sale_id) {
          query = query.eq("sale_id", filters.sale_id)
        }

        if (filters.status) {
          query = query.eq("status", filters.status)
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        setInstallments(data || [])
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

  const markAsPaid = async (installmentId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { data, error: updateError } = await supabase
        .from("installment_payments")
        .update({
          status: "paid",
          paid_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", installmentId)
        .select()
        .single()

      if (updateError) throw updateError

      setInstallments((prev) => prev.map((i) => (i.id === installmentId ? data : i)))
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const getOverdueInstallments = async () => {
    if (!user) return { data: null, error: "Not authenticated" }

    try {
      const { data: userSales } = await supabase.from("sales").select("id").eq("user_id", user.id)

      const saleIds = userSales?.map((s) => s.id) || []

      const { data, error } = await supabase
        .from("installment_payments")
        .select(
          `
          *,
          sales (
            sale_number,
            customers (name)
          )
        `,
        )
        .in("sale_id", saleIds)
        .eq("status", "late")
        .order("due_date", { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const getUpcomingInstallments = async (days = 7) => {
    if (!user) return { data: null, error: "Not authenticated" }

    try {
      const { data: userSales } = await supabase.from("sales").select("id").eq("user_id", user.id)

      const saleIds = userSales?.map((s) => s.id) || []

      const today = new Date().toISOString().split("T")[0]
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)
      const futureDateStr = futureDate.toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("installment_payments")
        .select(
          `
          *,
          sales (
            sale_number,
            customers (name)
          )
        `,
        )
        .in("sale_id", saleIds)
        .eq("status", "pending")
        .gte("due_date", today)
        .lte("due_date", futureDateStr)
        .order("due_date", { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("installments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "installment_payments",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setInstallments((prev) => [...prev, payload.new as Installment])
          } else if (payload.eventType === "UPDATE") {
            setInstallments((prev) =>
              prev.map((i) => (i.id === (payload.new as Installment).id ? (payload.new as Installment) : i)),
            )
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
      fetchInstallments()
    }
  }, [user, fetchInstallments])

  return {
    installments,
    loading,
    error,
    fetchInstallments,
    markAsPaid,
    getOverdueInstallments,
    getUpcomingInstallments,
  }
}
