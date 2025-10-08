"use client"

import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface RealFinancialSummary {
  real_income: {
    cash_sales: number
    paid_installments: number
    total: number
  }
  accounts_receivable: {
    pending_amount: number
    overdue_amount: number
    total_customers_with_debt: number
  }
  profitability: {
    products_with_cost_data: number
    total_cost: number
    total_revenue_with_cost: number
    gross_profit: number
  }
  total_sales: {
    count: number
    amount: number
  }
}

export interface ProductProfitability {
  product_id: string
  product_name: string
  units_sold: number
  total_revenue: number
  total_cost: number | null
  gross_profit: number | null
  profit_margin_avg: number | null
  current_stock: number
  has_cost_data: boolean
}

export interface AccountsReceivableAnalysis {
  summary: {
    total_pending: number
    total_overdue: number
    total_customers: number
    avg_days_overdue: number
  }
  by_customer: Array<{
    customer_id: string
    customer_name: string
    customer_phone: string
    total_debt: number
    overdue_debt: number
    pending_installments: number
    oldest_due_date: string
    days_oldest_overdue: number
  }>
  aging: {
    current_0_30: number
    overdue_1_30: number
    overdue_31_60: number
    overdue_61_90: number
    overdue_90_plus: number
  }
}

export interface IncomeTimelineEntry {
  date: string
  cash_sales: number
  installment_payments: number
  total_income: number
}

export function useSalesReports() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getFinancialSummary = useCallback(
    async (startDate: string, endDate: string) => {
      if (!user) return { data: null, error: "Not authenticated" }

      setLoading(true)
      setError(null)

      try {
        const { data, error: rpcError } = await supabase.rpc("get_real_financial_summary", {
          user_uuid: user.id,
          start_date: startDate,
          end_date: endDate,
        })

        if (rpcError) throw rpcError

        return { data: data as RealFinancialSummary, error: null }
      } catch (err: any) {
        setError(err.message)
        return { data: null, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const getProductProfitability = useCallback(
    async (startDate: string, endDate: string) => {
      if (!user) return { data: null, error: "Not authenticated" }

      setLoading(true)
      setError(null)

      try {
        const { data, error: rpcError } = await supabase.rpc("get_product_profitability_report", {
          user_uuid: user.id,
          start_date: startDate,
          end_date: endDate,
        })

        if (rpcError) throw rpcError

        return { data: data as ProductProfitability[], error: null }
      } catch (err: any) {
        setError(err.message)
        return { data: null, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const getAccountsReceivable = useCallback(async () => {
    if (!user) return { data: null, error: "Not authenticated" }

    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc("get_accounts_receivable_analysis", {
        user_uuid: user.id,
      })

      if (rpcError) throw rpcError

      return { data: data as AccountsReceivableAnalysis, error: null }
    } catch (err: any) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [user])

  const getIncomeTimeline = useCallback(
    async (startDate: string, endDate: string, groupBy: "day" | "week" | "month") => {
      if (!user) return { data: null, error: "Not authenticated" }

      setLoading(true)
      setError(null)

      try {
        const { data, error: rpcError } = await supabase.rpc("get_income_timeline", {
          user_uuid: user.id,
          start_date: startDate,
          end_date: endDate,
          group_by: groupBy,
        })

        if (rpcError) throw rpcError

        return { data: data as IncomeTimelineEntry[], error: null }
      } catch (err: any) {
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
    getFinancialSummary,
    getProductProfitability,
    getAccountsReceivable,
    getIncomeTimeline,
  }
}
