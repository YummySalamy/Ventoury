"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/app")
  }

  return (
    <motion.div
      className="w-full max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-panel rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-bold text-neutral-900 tracking-tight">Ventoury</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">Welcome back</h1>
          <p className="text-neutral-600 text-base sm:text-lg">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-neutral-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="mr-2 w-4 h-4 rounded border-neutral-300" />
              <span className="text-neutral-700">Remember me</span>
            </label>
            <Link href="#" className="text-neutral-900 font-medium hover:underline">
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            className="w-full bg-neutral-900 text-white py-4 rounded-xl font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign in
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>

        <p className="text-center text-sm text-neutral-600 mt-8">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-neutral-900 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
