"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ModuleModalProps {
  module: any
  isOpen: boolean
  onClose: () => void
}

export function ModuleModal({ module, isOpen, onClose }: ModuleModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setCurrentImageIndex(0)
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!module) return null

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % module.screenshots.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + module.screenshots.length) % module.screenshots.length)
  }

  const badgeVariants = {
    Popular: "bg-blue-100 text-blue-900 border-blue-200",
    New: "bg-green-100 text-green-900 border-green-200",
    Essential: "bg-purple-100 text-purple-900 border-purple-200",
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-5 h-5 text-neutral-900" />
            </button>

            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Gallery */}
              <div className="relative aspect-square bg-neutral-50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={module.screenshots[currentImageIndex] || "/placeholder.svg"}
                      alt={`${module.name} screenshot ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                      sizes="600px"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {module.screenshots.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5 text-neutral-900" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5 text-neutral-900" />
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {module.screenshots.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col">
                <div className="mb-6">
                  <Badge className={`${badgeVariants[module.badge]} border mb-3`}>{module.badge}</Badge>
                  <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">{module.category}</p>
                  <h2 className="text-4xl font-bold text-neutral-900 mb-4">{module.name}</h2>
                  <p className="text-lg text-neutral-600 leading-relaxed">{module.description}</p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">Key Features</h3>
                  <div className="space-y-3">
                    {module.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-neutral-900" />
                        </div>
                        <span className="text-neutral-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">Highlights</h3>
                  <div className="flex gap-2 flex-wrap">
                    {module.highlights.map((highlight: any, index: number) => (
                      <div
                        key={index}
                        className="px-4 py-2 rounded-full text-sm font-medium border"
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

                {/* CTA */}
                <motion.button
                  className="w-full bg-neutral-900 text-white py-4 rounded-full font-medium hover:bg-neutral-800 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
