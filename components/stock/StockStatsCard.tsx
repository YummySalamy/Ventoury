"use client"

import { motion } from "framer-motion"
import type { IconType } from "react-icons"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Skeleton } from "@/components/ui/skeleton"

interface StockStatsCardProps {
  title: string
  value: string | number
  icon: IconType
  gradient: string
  loading?: boolean
}

export function StockStatsCard({ title, value, icon: Icon, gradient, loading }: StockStatsCardProps) {
  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </GlassCard>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <GlassCard>
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-neutral-600">{title}</p>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
