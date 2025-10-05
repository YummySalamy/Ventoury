"use client"

import Link from "next/link"
import { ArrowLeft, Frown } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Sad face icon with gradient background */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-900 rounded-full blur-2xl opacity-20" />
            <div className="relative bg-gradient-to-br from-neutral-100 to-white p-8 rounded-full border-2 border-neutral-200 shadow-xl">
              <Frown className="w-24 h-24 text-neutral-800" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Oops text */}
        <h1 className="text-6xl font-bold text-neutral-900 mb-4">
          <span className="font-bold">Oops</span>
          <span className="italic">...</span>
        </h1>

        <h2 className="text-2xl font-semibold text-neutral-700 mb-3">Page Not Found</h2>

        <p className="text-neutral-600 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 group relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <ArrowLeft className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Back to Previous Page</span>
        </button>

        {/* Alternative link to dashboard */}
        <div className="mt-6">
          <Link
            href="/app"
            className="text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-4 transition-colors"
          >
            Or go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
