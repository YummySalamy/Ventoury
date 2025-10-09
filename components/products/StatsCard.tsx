import type React from "react"
import { GlassCard } from "@/components/dashboard/glass-card"

interface StatsCardProps {
  icon: React.ReactNode
  label: string
  value: number
  loading: boolean
  gradient: string
}

export const StatsCard = ({ icon, label, value, loading, gradient }: StatsCardProps) => (
  <GlassCard>
    <div className="flex items-center gap-4">
      <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shrink-0`}>
        <div className="text-white flex items-center justify-center">{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-neutral-600 truncate">{label}</p>
        <p className="text-2xl font-bold text-neutral-900">{loading ? "..." : value}</p>
      </div>
    </div>
  </GlassCard>
)
