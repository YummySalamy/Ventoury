"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ModuleCard } from "./module-card"
import { ModuleModal } from "./module-modal"
import { Reveal } from "@/components/reveal"

const featuredModules = [
  {
    id: "inventory-pro",
    name: "Inventory Pro",
    category: "Stock Management",
    image:
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    badge: "Popular" as const,
    features: ["Real-time tracking", "Low stock alerts", "Multi-location support"],
    highlights: [
      { name: "Automated", color: "#355E3B" },
      { name: "Scalable", color: "#9CAF88" },
      { name: "Efficient", color: "#B87333" },
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1694261321131-8157dce8e288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    description: "Track inventory levels across multiple locations with automated reordering and real-time alerts.",
  },
  {
    id: "sales-hub",
    name: "Sales Hub",
    category: "Revenue Tracking",
    image:
      "https://images.unsplash.com/photo-1694261321131-8157dce8e288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    badge: "New" as const,
    features: ["Order processing", "Payment tracking", "Sales analytics"],
    highlights: [
      { name: "Fast", color: "#E2725B" },
      { name: "Reliable", color: "#CC5500" },
      { name: "Integrated", color: "#B87333" },
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1694261321131-8157dce8e288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1694261321131-8157dce8e288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    description: "Process orders, track payments, and analyze sales performance all in one powerful dashboard.",
  },
  {
    id: "customer-360",
    name: "Customer 360",
    category: "CRM Suite",
    image:
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    badge: "Essential" as const,
    features: ["Contact management", "Purchase history", "Communication logs"],
    highlights: [
      { name: "Comprehensive", color: "#9CAF88" },
      { name: "Insightful", color: "#355E3B" },
      { name: "Connected", color: "#B87333" },
    ],
    screenshots: [
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1694261321131-8157dce8e288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    description: "Build lasting relationships with comprehensive customer profiles and interaction history tracking.",
  },
]

export function FeaturedModules() {
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewDetails = (module: any) => {
    setSelectedModule(module)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedModule(null)
  }

  return (
    <section className="py-20 lg:py-32" id="featured-modules">
      <div className="container-custom">
        <Reveal>
          <div className="text-left mb-16">
            <h2 className="text-4xl text-neutral-900 mb-4 lg:text-6xl">
              Core <span className="italic font-light">Modules</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Powerful modules designed to streamline your operations, each crafted with precision and attention to
              detail.
            </p>
          </div>
        </Reveal>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.3,
              },
            },
          }}
        >
          {featuredModules.map((module, index) => (
            <motion.div
              key={module.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  },
                },
              }}
            >
              <Reveal delay={index * 0.1}>
                <ModuleCard module={module} onViewDetails={handleViewDetails} />
              </Reveal>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <ModuleModal module={selectedModule} isOpen={isModalOpen} onClose={closeModal} />
    </section>
  )
}
