"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { en } from "@/locales/en/index"
import { es } from "@/locales/es/index"

type Locale = "en" | "es"

type TranslationFunction = (key: string, variables?: Record<string, string | number>) => string

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationFunction
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

const translations = {
  en,
  es,
}

function getNestedTranslation(obj: any, path: string): string {
  const keys = path.split(".")
  let result = obj

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key]
    } else {
      console.warn(`[v0] Translation key not found: ${path}`)
      return path // Return the key itself if not found
    }
  }

  return typeof result === "string" ? result : path
}

function interpolate(text: string, variables?: Record<string, string | number>): string {
  if (!variables) return text

  let result = text
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value))
  })

  return result
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const savedLocale = localStorage.getItem("ventoury-locale") as Locale
      if (savedLocale && (savedLocale === "en" || savedLocale === "es")) {
        return savedLocale
      }
    }
    return "en"
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ventoury-locale", locale)
    }
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
  }

  const t: TranslationFunction = (key: string, variables?: Record<string, string | number>) => {
    const translation = getNestedTranslation(translations[locale], key)
    return interpolate(translation, variables)
  }

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        t,
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
