"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface Alert {
  id: string
  user_id: string
  type: "low_stock" | "overdue_payment" | "upcoming_payment"
  title: string
  message: string
  reference_id?: string
  reference_type?: "product" | "sale" | "installment"
  is_read: boolean
  created_at: string
}

export function useAlerts() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(
    async (onlyUnread = false) => {
      if (!user) return { data: null, error: "Not authenticated" }

      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from("alerts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50)

        if (onlyUnread) {
          query = query.eq("is_read", false)
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        setAlerts(data || [])
        setUnreadCount(data?.filter((a) => !a.is_read).length || 0)
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

  const markAsRead = async (alertId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { data, error: updateError } = await supabase
        .from("alerts")
        .update({ is_read: true })
        .eq("id", alertId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setAlerts((prev) => prev.map((a) => (a.id === alertId ? data : a)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const markAllAsRead = async () => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { error: updateError } = await supabase
        .from("alerts")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (updateError) throw updateError

      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })))
      setUnreadCount(0)
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  const deleteAlert = async (alertId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const alert = alerts.find((a) => a.id === alertId)
      const wasUnread = alert && !alert.is_read

      const { error: deleteError } = await supabase.from("alerts").delete().eq("id", alertId).eq("user_id", user.id)

      if (deleteError) throw deleteError

      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  const generateAlerts = async () => {
    try {
      // Generate all types of alerts
      await supabase.rpc("generate_low_stock_alerts")
      await supabase.rpc("generate_overdue_payment_alerts")
      await supabase.rpc("generate_upcoming_payment_alerts")
      await supabase.rpc("update_overdue_installments")

      // Refresh alerts
      await fetchAlerts()
    } catch (err) {
      console.error("Error generating alerts:", err)
    }
  }

  // Real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("alerts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAlerts((prev) => [payload.new as Alert, ...prev])
            if (!(payload.new as Alert).is_read) {
              setUnreadCount((prev) => prev + 1)
            }
          } else if (payload.eventType === "UPDATE") {
            setAlerts((prev) => prev.map((a) => (a.id === (payload.new as Alert).id ? (payload.new as Alert) : a)))
          } else if (payload.eventType === "DELETE") {
            const deletedAlert = alerts.find((a) => a.id === (payload.old as Alert).id)
            setAlerts((prev) => prev.filter((a) => a.id !== (payload.old as Alert).id))
            if (deletedAlert && !deletedAlert.is_read) {
              setUnreadCount((prev) => Math.max(0, prev - 1))
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, alerts])

  useEffect(() => {
    if (user) {
      fetchAlerts()
    }
  }, [user, fetchAlerts])

  return {
    alerts,
    unreadCount,
    loading,
    error,
    fetchAlerts,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    generateAlerts,
  }
}
