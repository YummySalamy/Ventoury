import type React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-6 border border-white/20",
        hover && "hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
        className,
      )}
    >
      {children}
    </div>
  )
}
