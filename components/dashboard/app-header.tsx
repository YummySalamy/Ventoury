"use client"
import { useState } from "react"
import { UserCircle, LogOut, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface AppHeaderProps {
  isCollapsed?: boolean
  isMobile?: boolean
}

export function AppHeader({ isCollapsed = false, isMobile = false }: AppHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  const leftPosition = isMobile ? "left-0" : isCollapsed ? "lg:left-[80px]" : "lg:left-[280px]"

  return (
    <header
      className={`h-20 glass-panel border-b border-neutral-200/50 z-30 fixed top-0 right-0 ${leftPosition} transition-all duration-300`}
    >
      <div className="h-full px-4 sm:px-6 md:px-8 flex items-center justify-between">
        <div className="ml-12 lg:ml-0">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
            Welcome, <span className="italic font-light">dear user!</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 hidden sm:block">Manage your inventory with confidence</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <UserCircle className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-700" />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />

                {/* Dropdown menu */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-20"
                >
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="text-sm font-semibold text-neutral-900">User Account</p>
                    <p className="text-xs text-neutral-600">user@ventoury.com</p>
                  </div>

                  <button
                    onClick={() => {
                      router.push("/app/settings")
                      setIsDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      router.push("/app/settings")
                      setIsDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>

                  <div className="border-t border-neutral-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
