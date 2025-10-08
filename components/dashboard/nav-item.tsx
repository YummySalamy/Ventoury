"use client"
import { useState } from "react"
import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import type { NavItem } from "./sidebar-items"
import { useTranslation } from "@/hooks/useTranslation"

interface NavItemProps {
  item: NavItem
  isCollapsed: boolean
  onNavigate?: () => void // Added optional callback for mobile menu close
}

export function NavItemComponent({ item, isCollapsed, onNavigate }: NavItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useTranslation()

  const hasSubItems = item.subItems && item.subItems.length > 0
  const isSubItemActive = hasSubItems && item.subItems?.some((subItem) => pathname === subItem.href)
  const isActive = !hasSubItems && pathname === item.href

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubItems && !isCollapsed) {
      setIsOpen(!isOpen)
    }
  }

  const itemClasses = `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
    isActive
      ? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white shadow-lg"
      : isSubItemActive
        ? "bg-gradient-to-r from-white via-neutral-50 to-neutral-200 text-neutral-900 font-medium"
        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
  } ${isCollapsed ? "justify-center" : ""}`

  const itemContent = (
    <>
      {isActive && !isCollapsed && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/20 to-transparent"
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}
      <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? "text-white" : ""}`} />
      {!isCollapsed && (
        <>
          <span className="font-medium relative z-10">{t(item.translationKey)}</span>
          {hasSubItems && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 ml-auto"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          )}
        </>
      )}
    </>
  )

  return (
    <div>
      {hasSubItems ? (
        <button onClick={handleClick} className={`${itemClasses} w-full`}>
          {itemContent}
        </button>
      ) : (
        <Link href={item.href} className={itemClasses} onClick={onNavigate}>
          {itemContent}
        </Link>
      )}

      {/* Sub-items dropdown */}
      {hasSubItems && !isCollapsed && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className={`ml-4 mt-1 space-y-1 border-l-2 pl-4 rounded-r-xl transition-all ${
                  isSubItemActive
                    ? "bg-gradient-to-r from-white via-neutral-50 to-neutral-200 border-neutral-300"
                    : "border-neutral-200"
                }`}
              >
                {item.subItems?.map((subItem) => {
                  const isSubActive = pathname === subItem.href
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative overflow-hidden group ${
                        isSubActive
                          ? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white font-medium shadow-md"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      {isSubActive && (
                        <motion.div
                          className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/20 to-transparent"
                          initial={{ x: 50 }}
                          animate={{ x: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      )}
                      <subItem.icon
                        className={`w-4 h-4 flex-shrink-0 relative z-10 ${isSubActive ? "text-white" : ""}`}
                      />
                      <span className="relative z-10">{t(subItem.translationKey)}</span>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
