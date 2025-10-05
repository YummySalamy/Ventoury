"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LayoutDashboard, Package, Users, ShoppingCart, BarChart3, Settings, LogOut, Menu, X } from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/app" },
  { icon: Package, label: "Inventory", href: "/app/inventory" },
  { icon: Users, label: "Customers", href: "/app/customers" },
  { icon: ShoppingCart, label: "Sales", href: "/app/sales" },
  { icon: BarChart3, label: "Analytics", href: "/app/analytics" },
  { icon: Settings, label: "Settings", href: "/app/settings" },
]

export function DashboardNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link href="/app" className="text-2xl font-bold text-neutral-900">
            Ventoury
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
            <button className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden bg-white border-t border-neutral-200"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="container-custom py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <button className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors w-full">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
