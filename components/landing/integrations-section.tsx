"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Reveal } from "@/components/reveal"
import { cn } from "@/lib/utils"

const integrations = [
  {
    id: "accounting",
    name: "Accounting",
    description: "Sync with QuickBooks, Xero, and other accounting platforms",
    image:
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    backgroundImage:
      "https://images.unsplash.com/photo-1671159593278-d1fb07a378c2?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tint: "bg-blue-50",
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Connect with Shopify, WooCommerce, and major platforms",
    image:
      "https://images.unsplash.com/photo-1694261321131-8157dce8e288?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    backgroundImage:
      "https://images.unsplash.com/photo-1750586256779-cc096cb64e28?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2hpdGUlMjBncmFkaWVudHxlbnwwfHwwfHx8MA%3D%3D",
    tint: "bg-purple-50",
  },
  {
    id: "shipping",
    name: "Shipping",
    description: "Integrate with FedEx, UPS, DHL for seamless logistics",
    image:
      "https://images.unsplash.com/photo-1624139283078-74a0492f2ee3?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    backgroundImage:
      "https://images.unsplash.com/photo-1619252584172-a83a949b6efd?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2hpdGUlMjBncmFkaWVudHxlbnwwfHwwfHx8MA%3D%3D",
    tint: "bg-orange-50",
  },
]

export function IntegrationsSection() {
  const [activeIntegration, setActiveIntegration] = useState("accounting")

  const activeIntegrationData = integrations.find((i) => i.id === activeIntegration) || integrations[0]

  const AnimatedText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
    return (
      <span>
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: delay + index * 0.03,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            style={{ display: char === " " ? "inline" : "inline-block" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" id="integrations">
      <div className="absolute inset-0 z-0">
        {integrations.map((integration) => (
          <motion.div
            key={integration.id}
            className="absolute inset-0"
            initial={{ opacity: integration.id === activeIntegration ? 1 : 0 }}
            animate={{ opacity: integration.id === activeIntegration ? 1 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Image
              src={integration.backgroundImage || "/placeholder.svg"}
              alt={`${integration.name} integration`}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="absolute top-[120px] left-0 right-0 z-10">
        <div className="container-custom text-white">
          <Reveal>
            <div>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={activeIntegration}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="font-bold mb-6 text-7xl"
                >
                  <AnimatedText text={activeIntegrationData.name} delay={0.2} />
                </motion.h2>
              </AnimatePresence>
              <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
                Connect Ventoury with your favorite tools and platforms. Seamless integrations that keep your data
                synchronized and your workflow efficient.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="container-custom">
          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-3">
              {integrations.map((integration) => (
                <motion.button
                  key={integration.id}
                  className={cn(
                    "px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md",
                    activeIntegration === integration.id
                      ? "bg-white text-neutral-900"
                      : "bg-white/20 text-white hover:bg-white/30",
                  )}
                  onClick={() => setActiveIntegration(integration.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {integration.name}
                </motion.button>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
