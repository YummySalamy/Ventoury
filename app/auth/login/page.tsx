"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      })
      router.push("/app")
    } catch (err: any) {
      console.error("[v0] Login error:", err)

      const errorMessage =
        err.message === "Invalid login credentials"
          ? "Invalid email or password. Please check your credentials and try again."
          : err.message || "An unexpected error occurred. Please try again."

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleContactSupport = () => {
    const message = `Hello Ventoury Support,

I'm experiencing an issue while trying to sign in to my account.

Error Details:
${error || "Unable to sign in"}

Email: ${email || "Not provided"}

Could you please help me resolve this issue?

Thank you!`

    window.open(`https://wa.me/573216371230?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <motion.div
      className="w-full max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-panel rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12" style={{ backgroundColor: "#ffffff" }}>
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-bold text-neutral-900 tracking-tight">Ventoury</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">Welcome back</h1>
          <p className="text-neutral-600 text-base sm:text-lg">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-4"
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
                disabled={loading}
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
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
            className="w-full bg-neutral-900 text-white py-4 rounded-xl font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
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
