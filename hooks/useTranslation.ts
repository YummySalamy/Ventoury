"use client"

import { useLocale } from "@/contexts/LocaleContext"

export function useTranslation() {
  const { t, locale, setLocale } = useLocale()
  return { t, locale, setLocale }
}
