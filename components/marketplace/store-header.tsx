"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function StoreHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "backdrop-blur-md border-b border-neutral-200/50",
        isScrolled ? "bg-white/80" : "bg-white/80",
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12 lg:h-16">
          <motion.div className="flex-shrink-0" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Link
              href="/"
              className="text-xl lg:text-2xl font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors"
              aria-label="Ventoury Home"
            >
              Ventoury
            </Link>
          </motion.div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-neutral-900 hover:text-neutral-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
