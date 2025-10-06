"use client"
import { useState } from "react"
import { UserCircle, LogOut, Settings, User, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAlerts } from "@/hooks/useAlerts"
import { useAuth } from "@/contexts/AuthContext"

interface AppHeaderProps {
  isCollapsed?: boolean
  isMobile?: boolean
}

export function AppHeader({ isCollapsed = false, isMobile = false }: AppHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const router = useRouter()
  const { alerts, loading, markAsRead, deleteAlert } = useAlerts()
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
  }

  const leftPosition = isMobile ? "left-0" : isCollapsed ? "lg:left-[80px]" : "lg:left-[280px]"

  const unreadCount = alerts.filter((a) => !a.is_read).length

  return (
    <header
      className={`h-20 glass-panel border-b border-neutral-200/50 z-30 fixed top-0 right-0 ${leftPosition} transition-all duration-300 backdrop-blur-xl bg-white/70`}
    >
      <div className="h-full px-4 sm:px-6 md:px-8 flex items-center justify-between">
        <div className="ml-12 lg:ml-0">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
            Welcome, <span className="italic font-light">{user?.email?.split("@")[0] || "dear user"}!</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 hidden sm:block">Manage your inventory with confidence</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors relative"
            >
              <Bell className="w-6 h-6 text-neutral-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-20 max-h-96 overflow-y-auto"
                  >
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-900">Notifications</p>
                      <p className="text-xs text-neutral-600">{unreadCount} unread</p>
                    </div>

                    {loading ? (
                      <div className="px-4 py-8 text-center text-sm text-neutral-600">Loading notifications...</div>
                    ) : alerts.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-neutral-600">No notifications yet</div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`px-4 py-3 hover:bg-neutral-50 transition-colors ${
                              !alert.is_read ? "bg-blue-50/50" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-neutral-900">{alert.title}</p>
                                <p className="text-xs text-neutral-600 mt-1">{alert.message}</p>
                                <p className="text-xs text-neutral-400 mt-1">
                                  {new Date(alert.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {!alert.is_read && (
                                  <button
                                    onClick={() => markAsRead(alert.id)}
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                  >
                                    Mark read
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteAlert(alert.id)}
                                  className="text-xs text-red-600 hover:text-red-700 ml-2"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
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
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-20"
                  >
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-900">User Account</p>
                      <p className="text-xs text-neutral-600">{user?.email || "user@ventoury.com"}</p>
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
      </div>
    </header>
  )
}
