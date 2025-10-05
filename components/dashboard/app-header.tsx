"use client"
import { UserCircle } from "lucide-react"

export function AppHeader() {
  return (
    <header className="h-20 glass-panel border-b border-neutral-200/50 z-30">
      <div className="h-full px-6 md:px-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Welcome, <span className="italic font-light">dear user!</span>
          </h2>
          <p className="text-sm text-neutral-600">Manage your inventory with confidence</p>
        </div>
        <button className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
          <UserCircle className="w-8 h-8 text-neutral-700" />
        </button>
      </div>
    </header>
  )
}
