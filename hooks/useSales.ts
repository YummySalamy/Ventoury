"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface SaleItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Sale {
  id: string
  user_id: string
  customer_id?: string
  total_amount: number
  payment_type: "cash" | "credit" | "debit" | "transfer"
  status: "pending" | "partial" | "paid" | "cancelled"
  total_installments?: number
  paid_installments?: number
  notes?: string
  sale_date: string
  sale_number?: string // Added sale_number field
  public_token?: string // Added public_token field for invoice sharing
  created_at: string
  discount_type?: "none" | "percentage" | "fixed"
  discount_value?: number
  discount_amount?: number
  subtotal_before_discount?: number
}

export interface CreateSaleData {
  customer_id?: string
  items: SaleItem[]
  payment_type: "cash" | "credit" | "debit" | "transfer"
  notes?: string
  discount_type?: "none" | "percentage" | "fixed"
  discount_value?: number
  installments?: {
    count: number
    first_due_date: string
    frequency?: "weekly" | "biweekly" | "monthly" | "custom"
    custom_interval_days?: number
  }
}

export function useSales() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = useCallback(
    async (filters: { customer_id?: string; start_date?: string; end_date?: string } = {}) => {
      if (!user) return { data: null, error: "Not authenticated" }

      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from("sales")
          .select(
            `
          *,
          customers (name, email, phone),
          sale_items (
            *,
            products (name, sku, image_url)
          )
        `,
          )
          .eq("user_id", user.id)
          .order("sale_date", { ascending: false })

        if (filters.customer_id) {
          query = query.eq("customer_id", filters.customer_id)
        }

        if (filters.start_date) {
          query = query.gte("sale_date", filters.start_date)
        }

        if (filters.end_date) {
          query = query.lte("sale_date", filters.end_date)
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        setSales(data || [])
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

  const createSale = async (saleData: CreateSaleData) => {
    if (!user) throw new Error("User not authenticated")

    try {
      for (const item of saleData.items) {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock_quantity, name")
          .eq("id", item.product_id)
          .single()

        if (productError) throw new Error(`Product not found: ${item.product_name}`)

        if (!product || product.stock_quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product?.name || item.product_name}. Available: ${product?.stock_quantity || 0}, Requested: ${item.quantity}`,
          )
        }
      }

      const subtotal = saleData.items.reduce((sum, item) => sum + item.subtotal, 0)

      let discountAmount = 0
      const discountType = saleData.discount_type || "none"
      const discountValue = saleData.discount_value || 0

      if (discountType === "percentage") {
        discountAmount = subtotal * (discountValue / 100)
      } else if (discountType === "fixed") {
        discountAmount = Math.min(discountValue, subtotal) // Cannot be greater than subtotal
      }

      const totalAmount = subtotal - discountAmount

      if (saleData.payment_type === "credit" && saleData.installments) {
        const { data, error } = await supabase.rpc("create_sale_with_installments", {
          p_user_id: user.id,
          p_customer_id: saleData.customer_id,
          p_sale_number: `V-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          p_total_amount: totalAmount,
          p_discount_type: discountType,
          p_discount_value: discountValue,
          p_subtotal_before_discount: subtotal,
          p_num_installments: saleData.installments.count,
          p_installment_frequency: saleData.installments.frequency || "monthly",
          p_installment_interval_days: saleData.installments.custom_interval_days || null,
          p_start_date: saleData.installments.first_due_date,
          p_notes: saleData.notes || "",
        })

        if (error) throw error

        const saleId = data.sale_id

        for (const item of saleData.items) {
          await supabase.from("sale_items").insert({
            sale_id: saleId,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          })

          await supabase.rpc("update_product_stock", {
            product_uuid: item.product_id,
            quantity_sold: item.quantity,
          })
        }

        const { data: sale } = await supabase
          .from("sales")
          .select(
            `
            *,
            customers (name, email, phone),
            sale_items (
              *,
              products (name, sku, image_url)
            )
          `,
          )
          .eq("id", saleId)
          .single()

        if (sale) {
          setSales((prev) => [sale, ...prev])
        }

        return { data: sale, error: null }
      } else {
        const { data: sale, error: saleError } = await supabase
          .from("sales")
          .insert({
            user_id: user.id,
            customer_id: saleData.customer_id,
            total_amount: totalAmount,
            payment_type: saleData.payment_type,
            status: saleData.payment_type === "cash" ? "paid" : "pending",
            total_installments: null,
            paid_installments: null,
            discount_type: discountType,
            discount_value: discountValue,
            discount_amount: discountAmount,
            subtotal_before_discount: subtotal,
            notes: saleData.notes,
            sale_number: `V-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          })
          .select()
          .single()

        if (saleError) throw saleError

        const saleItems = saleData.items.map((item) => ({
          sale_id: sale.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        }))

        const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)

        if (itemsError) throw itemsError

        for (const item of saleData.items) {
          await supabase.rpc("update_product_stock", {
            product_uuid: item.product_id,
            quantity_sold: item.quantity,
          })
        }

        setSales((prev) => [sale, ...prev])
        return { data: sale, error: null }
      }
    } catch (err: any) {
      console.error("Error creating sale:", err)
      return { data: null, error: err.message }
    }
  }

  const cancelSale = async (saleId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      // Get sale items
      const { data: saleItems, error: itemsError } = await supabase
        .from("sale_items")
        .select("product_id, quantity")
        .eq("sale_id", saleId)

      if (itemsError) throw itemsError

      // Restore stock
      for (const item of saleItems || []) {
        const { data: product } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.product_id)
          .single()

        if (product) {
          await supabase
            .from("products")
            .update({
              stock_quantity: product.stock_quantity + item.quantity,
            })
            .eq("id", item.product_id)
        }
      }

      // Update sale status
      const { data, error: updateError } = await supabase
        .from("sales")
        .update({ status: "cancelled" })
        .eq("id", saleId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (updateError) throw updateError

      await supabase
        .from("installment_payments")
        .update({ status: "cancelled" })
        .eq("sale_id", saleId)
        .eq("status", "pending")

      setSales((prev) => prev.map((s) => (s.id === saleId ? data : s)))
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("sales-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sales",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSales((prev) => [payload.new as Sale, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setSales((prev) => prev.map((s) => (s.id === (payload.new as Sale).id ? (payload.new as Sale) : s)))
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
      fetchSales()
    }
  }, [user, fetchSales])

  return {
    sales,
    loading,
    error,
    fetchSales,
    createSale,
    cancelSale,
  }
}
