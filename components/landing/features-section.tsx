"use client"

import { motion } from "framer-motion"
import { Package, Users, ShoppingCart, BarChart3, Zap, Shield } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Package,
    title: "Inventory Management",
    description: "Track stock levels, manage suppliers, and automate reordering with intelligent alerts.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Users,
    title: "Customer Relations",
    description: "Build lasting relationships with comprehensive customer profiles and interaction history.",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: ShoppingCart,
    title: "Sales Tracking",
    description: "Monitor sales performance, process orders, and manage transactions seamlessly.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Make data-driven decisions with powerful insights and customizable reports.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: Zap,
    title: "Automation",
    description: "Save time with automated workflows, notifications, and recurring tasks.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance with industry standards to protect your data.",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32" id="features">
      <div className="container-custom">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl text-neutral-900 mb-4 lg:text-6xl">
              Everything you need to <span className="italic font-light">succeed</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your operations and accelerate growth.
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
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
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
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                </Card>
              </Reveal>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
