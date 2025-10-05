"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { AppHeader } from "@/components/dashboard/app-header"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Listen to sidebar state changes for layout adaptation
  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector("aside")
      if (sidebar) {
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
      <Sidebar />
      {/* Content adapts to sidebar state */}
      <div className="transition-all duration-300" style={{ marginLeft: isCollapsed ? "80px" : "280px" }}>
        <AppHeader />
        <main className="pt-20 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
