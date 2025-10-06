"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface CustomField {
  id: string
  user_id: string
  name: string
  field_type: "text" | "number" | "select"
  options?: string[] // For select type
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useCustomFields() {
  const { user } = useAuth()
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomFields = useCallback(async () => {
    if (!user) return { data: null, error: "Not authenticated" }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name", { ascending: true })

      if (fetchError) throw fetchError

      setCustomFields(data || [])
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [user])

  const createCustomField = async (fieldData: Partial<CustomField>) => {
    if (!user) throw new Error("User not authenticated")

    try {
      // Validate select type has options
      if (fieldData.field_type === "select" && (!fieldData.options || fieldData.options.length === 0)) {
        return { data: null, error: "Select type must have at least one option" }
      }

      const { data, error: createError } = await supabase
        .from("custom_fields")
        .insert({
          ...fieldData,
          user_id: user.id,
        })
        .select()
        .single()

      if (createError) throw createError

      setCustomFields((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const updateCustomField = async (fieldId: string, updates: Partial<CustomField>) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { data, error: updateError } = await supabase
        .from("custom_fields")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", fieldId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setCustomFields((prev) => prev.map((f) => (f.id === fieldId ? data : f)))
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const deleteCustomField = async (fieldId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { error: deleteError } = await supabase
        .from("custom_fields")
        .update({ is_active: false })
        .eq("id", fieldId)
        .eq("user_id", user.id)

      if (deleteError) throw deleteError

      setCustomFields((prev) => prev.filter((f) => f.id !== fieldId))
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  // Validate custom data against field definitions
  const validateCustomData = (customData: Record<string, any>): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    customFields.forEach((field) => {
      const value = customData[field.name]

      if (value !== undefined && value !== null && value !== "") {
        // Type validation
        if (field.field_type === "number" && isNaN(Number(value))) {
          errors.push(`${field.name} must be a number`)
        }

        if (field.field_type === "select" && field.options && !field.options.includes(value)) {
          errors.push(`${field.name} must be one of: ${field.options.join(", ")}`)
        }
      }
    })

    return { valid: errors.length === 0, errors }
  }

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("custom-fields-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "custom_fields",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCustomFields((prev) =>
              [...prev, payload.new as CustomField].sort((a, b) => a.name.localeCompare(b.name)),
            )
          } else if (payload.eventType === "UPDATE") {
            setCustomFields((prev) =>
              prev.map((f) => (f.id === (payload.new as CustomField).id ? (payload.new as CustomField) : f)),
            )
          } else if (payload.eventType === "DELETE") {
            setCustomFields((prev) => prev.filter((f) => f.id !== (payload.old as CustomField).id))
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
      fetchCustomFields()
    }
  }, [user, fetchCustomFields])

  return {
    customFields,
    loading,
    error,
    fetchCustomFields,
    createCustomField,
    updateCustomField,
    deleteCustomField,
    validateCustomData,
  }
}
