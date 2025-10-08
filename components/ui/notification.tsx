"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationProps {
  open: boolean
  onClose: () => void
  type: "success" | "error"
  title: string
  content: string
}

export function Notification({ open, onClose, type, title, content }: NotificationProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 right-4 z-50 w-full max-w-md"
        >
          <div
            className={cn(
              "relative rounded-xl p-4 shadow-2xl backdrop-blur-xl border",
              type === "success"
                ? "bg-green-500/10 border-green-500/20 shadow-green-500/10"
                : "bg-red-500/10 border-red-500/20 shadow-red-500/10",
            )}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-neutral-600" />
            </button>

            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg", type === "success" ? "bg-green-500/20" : "bg-red-500/20")}>
                {type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>

              <div className="flex-1 pr-6">
                <h3
                  className={cn("font-semibold text-sm mb-1", type === "success" ? "text-green-900" : "text-red-900")}
                >
                  {title}
                </h3>
                <p className="text-sm text-neutral-700">{content}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
