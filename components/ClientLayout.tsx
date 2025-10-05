"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { AppHeader } from "@/components/dashboard/app-header"
import { Menu, X } from "lucide-react"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector("aside")
      if (sidebar && window.innerWidth >= 1024) {
        const width = sidebar.offsetWidth
        setIsCollapsed(width <= 80)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    const observer = new MutationObserver(handleResize)
    const sidebar = document.querySelector("aside")
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ["style"] })
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50">
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-5 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-lg border border-neutral-200"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <div className={`transition-all duration-300 ${isMobile ? "" : isCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"}`}>
        <AppHeader isCollapsed={isCollapsed} isMobile={isMobile} />
        <main className="pt-20 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
