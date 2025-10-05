"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Reveal } from "@/components/reveal"
import { Package, Users, ShoppingCart, BarChart3, Settings, FileText, Calendar, MessageSquare } from "lucide-react"

const modules = [
  {
    id: "inventory",
    name: "INVENTORY",
    icon: Package,
    description: "Stock management",
  },
  {
    id: "customers",
    name: "CUSTOMERS",
    icon: Users,
    description: "CRM & contacts",
  },
  {
    id: "sales",
    name: "SALES",
    icon: ShoppingCart,
    description: "Orders & invoices",
  },
  {
    id: "analytics",
    name: "ANALYTICS",
    icon: BarChart3,
    description: "Reports & insights",
  },
  {
    id: "settings",
    name: "SETTINGS",
    icon: Settings,
    description: "Configuration",
  },
  {
    id: "documents",
    name: "DOCUMENTS",
    icon: FileText,
    description: "File management",
  },
  {
    id: "calendar",
    name: "CALENDAR",
    icon: Calendar,
    description: "Schedule & tasks",
  },
  {
    id: "messaging",
    name: "MESSAGING",
    icon: MessageSquare,
    description: "Team communication",
  },
]

export function ModulesStrip() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const x = useTransform(scrollYProgress, [0, 1], [0, -100])

  const itemWidth = 280
  const totalWidth = modules.length * (itemWidth + 32) - 32
  const containerWidth = typeof window !== "undefined" ? window.innerWidth : 1200
  const maxDrag = Math.max(0, totalWidth - containerWidth + 48)

  return (
    <section ref={containerRef} className="py-20 lg:py-32 overflow-hidden bg-neutral-100">
      <div className="mb-12">
        <Reveal>
          <div className="container-custom text-center">
            <h2 className="text-neutral-900 mb-4 text-6xl font-normal">Powerful Modules</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Integrated tools that work together seamlessly to power your business operations.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="relative">
        <motion.div
          className="flex gap-8 px-6"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.1}
        >
          {modules.map((module) => (
            <motion.div
              key={module.id}
              className="flex-shrink-0 w-[280px] group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <div className="bg-white rounded-2xl p-8 h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-neutral-900 rounded-xl flex items-center justify-center mb-6">
                  <module.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold tracking-wider mb-2 text-neutral-900">{module.name}</h3>
                <p className="text-sm text-neutral-600">{module.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-neutral-500">← Drag to explore modules →</p>
      </div>
    </section>
  )
}
