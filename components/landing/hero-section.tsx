"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Zap, Shield, TrendingUp } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { BlurPanel } from "@/components/blur-panel"
import Link from "next/link"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 0.95])
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -50])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

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
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{ scale: imageScale, y: imageY }}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <Image
          src="https://images.unsplash.com/photo-1671159593357-ee577a598f71?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxhY2slMjBncmFkaWVudHxlbnwwfHwwfHx8MA%3D%3D"
          alt="Ventoury - Modern inventory management platform"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>

      <motion.div
        className="relative z-10 h-full flex items-center justify-center px-6 sm:px-8 md:px-12"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="container mx-auto max-w-7xl text-center text-white">
          <Reveal>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight mb-6 sm:mb-8 px-4">
              <AnimatedText text="Manage your " delay={0.5} />
              <span className="font-black bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                <AnimatedText text="Inventory" delay={0.9} />
              </span>
              <br />
              <span className="italic font-light">
                <AnimatedText text="with confidence." delay={1.3} />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 sm:mb-12 leading-relaxed max-w-3xl mx-auto px-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              Complete platform for inventory, sales, customers, and analytics — everything you need to grow your
              business.
            </motion.p>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <Link
              href="/auth/register"
              className="inline-block px-8 sm:px-10 py-4 sm:py-5 bg-white text-neutral-900 rounded-full text-lg sm:text-xl font-medium hover:bg-white/90 transition-colors shadow-xl"
            >
              Start free trial
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 z-20 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <BlurPanel className="mx-4 sm:mx-6 mb-4 sm:mb-6 px-4 sm:px-6 py-3 sm:py-4 bg-black/24 backdrop-blur-md border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Real-time updates</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Secure & reliable</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Grow faster</span>
            </div>
          </div>
        </BlurPanel>
      </motion.div>
    </section>
  )
}
