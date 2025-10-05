"use client"
import { useState, createContext, useContext } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Package } from "lucide-react"
import Link from "next/link"
import { sidebarItems } from "./sidebar-items"
import { NavItemComponent } from "./nav-item"

const SidebarContext = createContext({ isCollapsed: false })

export const useSidebar = () => useContext(SidebarContext)

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen bg-white border-r border-neutral-200 z-40 flex flex-col shadow-sm"
      >
        {/* Header with logo and collapse button */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-neutral-200">
          {isCollapsed ? (
            <Link href="/app" className="flex items-center justify-center w-full">
              <Package className="w-7 h-7 text-neutral-900" />
            </Link>
          ) : (
            <Link href="/app" className="text-2xl font-bold text-neutral-900">
              Ventoury
            </Link>
          )}
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg hover:bg-neutral-100 transition-colors ${isCollapsed ? "absolute -right-3 top-7 bg-white border border-neutral-200 shadow-md" : ""}`}
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </motion.button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <NavItemComponent key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>
        </nav>
      </motion.aside>
    </SidebarContext.Provider>
  )
}

export { SidebarContext }
