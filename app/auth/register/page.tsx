"use client"
import { useState } from "react"
import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Building, ArrowRight, ArrowLeft, Check, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match. Please make sure both passwords are identical.")
        return
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.")
        return
      }

      setLoading(true)

      try {
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              company: formData.company,
            },
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/app`,
          },
        })

        if (authError) throw authError

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        })

        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } catch (err: any) {
        console.error("[v0] Registration error:", err)

        let errorMessage = "An unexpected error occurred. Please try again."

        if (err.message?.includes("already registered") || err.message?.includes("already exists")) {
          errorMessage = "This email is already registered. Please try signing in instead."
        } else if (err.message?.includes("invalid email")) {
          errorMessage = "Please enter a valid email address."
        } else if (err.message?.includes("weak password")) {
          errorMessage = "Password is too weak. Please use a stronger password with at least 8 characters."
        } else if (err.message) {
          errorMessage = err.message
        }

        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleContactSupport = () => {
    const message = `Hello Ventoury Support,

I'm experiencing an issue while trying to create an account.

Error Details:
${error || "Unable to complete registration"}

Email: ${formData.email || "Not provided"}
Name: ${formData.name || "Not provided"}
Company: ${formData.company || "Not provided"}

Could you please help me resolve this issue?

Thank you!`

    window.open(`https://wa.me/573216371230?text=${encodeURIComponent(message)}`, "_blank")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Company Details" },
    { number: 3, title: "Security" },
  ]

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-panel rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12" style={{ backgroundColor: "#ffffff" }}>
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-bold text-neutral-900 tracking-tight">Ventoury</span>
          </Link>
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Get started</h1>
          <p className="text-neutral-600 text-lg">Create your account in 3 simple steps</p>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center w-full">
                  <motion.div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      currentStep >= step.number ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"
                    }`}
                    animate={{
                      scale: currentStep === step.number ? 1.1 : 1,
                    }}
                  >
                    {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                  </motion.div>
                  <span
                    className={`text-xs sm:text-sm mt-2 font-medium text-center ${
                      currentStep >= step.number ? "text-neutral-900" : "text-neutral-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="relative flex-1 h-0.5 bg-neutral-200 mx-2 -mt-6">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-neutral-900"
                      initial={{ width: "0%" }}
                      animate={{ width: currentStep > step.number ? "100%" : "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-4 mb-5"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-red-900">{error}</p>
                  <button
                    type="button"
                    onClick={handleContactSupport}
                    className="text-sm font-semibold text-red-700 hover:text-red-800 underline underline-offset-2 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-neutral-900 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-neutral-900 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                      placeholder="Your Company"
                      required
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">This will be used to set up your workspace</p>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-neutral-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">Must be at least 8 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-900 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <motion.button
                type="button"
                onClick={goBack}
                className="flex-1 bg-neutral-100 text-neutral-900 py-4 rounded-xl font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </motion.button>
            )}
            <motion.button
              type="submit"
              className="flex-1 bg-neutral-900 text-white py-4 rounded-xl font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              disabled={loading}
            >
              {loading ? "Creating account..." : currentStep === 3 ? "Create account" : "Continue"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </form>

        <p className="text-center text-sm text-neutral-600 mt-8">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-neutral-900 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
