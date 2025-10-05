"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import Image from "next/image"
import { Reveal } from "@/components/reveal"

const categories = [
  {
    id: "inventory-management",
    name: "INVENTORY MANAGEMENT",
    image:
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    count: "12 features",
  },
  {
    id: "sales-tracking",
    name: "SALES TRACKING",
    image:
      "https://images.unsplash.com/photo-1694261321131-8157dce8e288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    count: "8 features",
  },
  {
    id: "customer-relations",
    name: "CUSTOMER RELATIONS",
    image:
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    count: "10 features",
  },
  {
    id: "analytics-reports",
    name: "ANALYTICS & REPORTS",
    image:
      "https://images.unsplash.com/photo-1694261321131-8157dce8e288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    count: "15 features",
  },
  {
    id: "integrations",
    name: "INTEGRATIONS",
    image:
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    count: "20+ apps",
  },
  {
    id: "automation",
    name: "AUTOMATION",
    image:
      "https://images.unsplash.com/photo-1694261321131-8157dce8e288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    count: "6 workflows",
  },
  {
    id: "team-collaboration",
    name: "TEAM COLLABORATION",
    image:
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    count: "9 tools",
  },
  {
    id: "mobile-access",
    name: "MOBILE ACCESS",
    image:
      "https://images.unsplash.com/photo-1694261321131-8157dce8e288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    count: "iOS & Android",
  },
  {
    id: "security-compliance",
    name: "SECURITY & COMPLIANCE",
    image:
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    count: "Enterprise-grade",
  },
  {
    id: "custom-workflows",
    name: "CUSTOM WORKFLOWS",
    image:
      "https://images.unsplash.com/photo-1694261321131-8157dce8e288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    count: "Unlimited",
  },
]

export function CategoriesStrip() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)

  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && scrollContainerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
        setContentWidth(scrollContainerRef.current.scrollWidth)
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const itemWidth = 320
  const gap = 32
  const totalWidth = categories.length * (itemWidth + gap) - gap
  const maxDrag = Math.max(0, totalWidth - containerWidth + 96)

  return (
    <section className="py-20 lg:py-32 overflow-hidden">
      <div className="mb-12">
        <Reveal>
          <div className="container-custom text-center">
            <h2 className="text-neutral-900 mb-4 text-6xl font-normal">Feature Categories</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Explore our comprehensive feature set, organized by category to help you find exactly what you need.
            </p>
          </div>
        </Reveal>
      </div>

      <div ref={containerRef} className="relative">
        <motion.div
          ref={scrollContainerRef}
          className="flex gap-8 px-6 cursor-grab active:cursor-grabbing"
          style={{ x: springX }}
          drag="x"
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className="flex-shrink-0 w-80 group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4">
                <motion.div
                  className="relative w-full h-full"
                  whileHover={{ filter: "blur(1px)" }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
                </motion.div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    className="text-center text-white"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-3xl font-bold tracking-wider mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.count}</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-neutral-500">← Drag to explore categories →</p>
      </div>
    </section>
  )
}
