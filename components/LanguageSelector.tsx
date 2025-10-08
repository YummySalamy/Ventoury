"use client"

import { useState } from "react"
import { Languages } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "@/hooks/useTranslation"

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: "en" as const, label: "English", shortLabel: "EN" },
    { code: "es" as const, label: "Español", shortLabel: "ES" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === locale)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl glass-panel hover:bg-white/80 transition-all duration-200 border border-neutral-200/50"
      >
        <Languages className="w-4 h-4 text-neutral-700" />
        <span className="text-sm font-semibold text-neutral-700">{currentLanguage?.shortLabel}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 glass-panel rounded-xl shadow-xl border border-neutral-200/50 py-2 z-20 overflow-hidden"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLocale(lang.code)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    locale === lang.code ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <span className="font-bold text-xs">{lang.shortLabel}</span>
                  <span className="font-medium">{lang.label}</span>
                  {locale === lang.code && (
                    <motion.div
                      layoutId="active-language"
                      className="ml-auto w-2 h-2 rounded-full bg-green-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
