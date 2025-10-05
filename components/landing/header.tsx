"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function Header() {
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
        "backdrop-blur-md border-b border-white/[0.02]",
        isScrolled ? "bg-white/[0.02]" : "bg-white/[0.02]",
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-12 lg:h-16">
          <motion.div className="flex-shrink-0" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <a
              href="#"
              className={cn(
                "text-xl lg:text-2xl font-bold tracking-tight transition-colors",
                isScrolled ? "text-neutral-900 hover:text-neutral-700" : "text-white hover:text-white/80",
              )}
              aria-label="Ventoury Home"
            >
              Ventoury
            </a>
          </motion.div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className={cn(
                "text-sm font-medium transition-colors",
                isScrolled ? "text-neutral-900 hover:text-neutral-700" : "text-white hover:text-white/80",
              )}
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-white text-neutral-900 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
