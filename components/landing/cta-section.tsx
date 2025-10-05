"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Mail, ArrowRight } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { BlurPanel } from "@/components/blur-panel"
import Link from "next/link"

export function CTASection() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isValid, setIsValid] = useState(true)

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateEmail(email)) {
      setIsSubmitted(true)
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }

  return (
    <section className="py-20 lg:py-32">
      <div className="container-custom">
        <Reveal>
          <div className="max-w-2xl mx-auto">
            <BlurPanel className="p-8 lg:p-12 bg-white/40 backdrop-blur-md grain-texture">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-4 leading-tight">
                  <span className="block">Ready to transform</span>
                  <span className="block italic font-light">your business?</span>
                </h2>
                <p className="text-base sm:text-lg text-neutral-600 mb-6">
                  Start your free 14-day trial. No credit card required.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors text-sm sm:text-base"
                >
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="border-t border-neutral-200 pt-8 mt-8">
                <p className="text-center text-sm text-neutral-600 mb-4">
                  Or subscribe to our newsletter for tips and updates
                </p>

                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail size={20} className="text-neutral-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setIsValid(true)
                        }}
                        placeholder="Enter your email address"
                        className={`w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border rounded-full text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all duration-200 ${
                          !isValid ? "border-red-300 focus:ring-red-500" : "border-neutral-200"
                        }`}
                      />
                    </div>

                    {!isValid && (
                      <motion.p
                        className="text-sm text-red-600 text-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        Please enter a valid email address
                      </motion.p>
                    )}

                    <motion.button
                      type="submit"
                      className="w-full bg-neutral-900 text-white py-4 rounded-full font-medium hover:bg-neutral-800 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Subscribe to Newsletter
                    </motion.button>
                  </form>
                ) : (
                  <motion.div
                    className="text-center py-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check size={20} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">Thanks for subscribing!</h3>
                    <p className="text-sm text-neutral-600">
                      You'll receive our newsletter with business tips and product updates.
                    </p>
                  </motion.div>
                )}
              </div>

              <p className="text-xs text-neutral-500 text-center mt-6">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </BlurPanel>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
