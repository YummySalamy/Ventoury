"use client"
import { useState, createContext, useContext, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Package, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { sidebarItems } from "./sidebar-items"
import { NavItemComponent } from "./nav-item"

const SidebarContext = createContext({ isCollapsed: false })

export const useSidebar = () => useContext(SidebarContext)

interface SidebarProps {
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
}

export function Sidebar({ isMobileMenuOpen = false, setIsMobileMenuOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-neutral-200 z-40 flex-col shadow-sm"
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

        {/* Logout button */}
        <div className="p-3 border-t border-neutral-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      <motion.aside
        initial={false}
        animate={{
          x: isMobileMenuOpen ? 0 : -280,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="lg:hidden fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-neutral-200 z-40 flex flex-col shadow-2xl"
      >
        {/* Header with logo */}
        <div className="h-20 flex items-center px-4 border-b border-neutral-200">
          <Link href="/app" className="text-2xl font-bold text-neutral-900">
            Ventoury
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                isCollapsed={false}
                onNavigate={() => setIsMobileMenuOpen?.(false)}
              />
            ))}
          </div>
        </nav>

        {/* Logout button */}
        <div className="p-3 border-t border-neutral-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>
    </SidebarContext.Provider>
  )
}

export { SidebarContext }
