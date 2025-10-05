"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"

interface ModuleCardProps {
  module: {
    id: string
    name: string
    category: string
    image: string
    badge: "Popular" | "New" | "Essential"
    features: string[]
    highlights: Array<{ name: string; color: string }>
  }
  onViewDetails: (module: any) => void
}

export function ModuleCard({ module, onViewDetails }: ModuleCardProps) {
  const badgeVariants = {
    Popular: "bg-blue-100 text-blue-900 border-blue-200",
    New: "bg-green-100 text-green-900 border-green-200",
    Essential: "bg-purple-100 text-purple-900 border-purple-200",
  }

  return (
    <motion.div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      whileHover={{ y: -8 }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-50">
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}>
          <Image
            src={module.image || "/placeholder.svg"}
            alt={module.name}
            fill
            className="object-cover"
            sizes="400px"
          />
        </motion.div>

        {/* Badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className={`${badgeVariants[module.badge]} border`}>{module.badge}</Badge>
        </div>

        {/* Quick View Button */}
        <motion.button
          onClick={() => onViewDetails(module)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <motion.div
            className="flex items-center gap-2 text-white text-sm font-medium px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4" />
            View Details
          </motion.div>
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{module.category}</p>
          <h3 className="text-2xl font-bold text-neutral-900">{module.name}</h3>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-4">
          {module.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
              <div className="w-1 h-1 rounded-full bg-neutral-400" />
              {feature}
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="flex gap-2 flex-wrap">
          {module.highlights.map((highlight, index) => (
            <div
              key={index}
              className="px-3 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: `${highlight.color}15`,
                borderColor: `${highlight.color}30`,
                color: highlight.color,
              }}
            >
              {highlight.name}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
