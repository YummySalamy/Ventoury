"use client"

import { X } from "lucide-react"
import { FaPencilAlt } from "react-icons/fa"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Store } from "lucide-react"

interface StoreBannerPreviewProps {
  logoUrl: string | null
  logoPreview: string | null
  businessName: string
  primaryColor: string
  secondaryColor: string
  onUpload: () => void
  onRemove: () => void
  uploading?: boolean
}

export function StoreBannerPreview({
  logoUrl,
  logoPreview,
  businessName,
  primaryColor,
  secondaryColor,
  onUpload,
  onRemove,
  uploading = false,
}: StoreBannerPreviewProps) {
  const displayLogo = logoPreview || logoUrl

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
      {/* Banner with gradient and wave effect */}
      <div
        className="relative h-48 md:h-64 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        }}
      >
        {/* Wave pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path
              fill="white"
              fillOpacity="0.3"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>

        {/* Logo with frosted glass frame */}
        <div className="absolute left-6 md:left-8 bottom-6 md:bottom-8 flex items-center gap-3">
          <div className="p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl">
            {displayLogo ? (
              <div className="relative h-20 w-20 md:h-28 md:w-28 rounded-xl overflow-hidden bg-white">
                <Image
                  src={displayLogo || "/placeholder.svg"}
                  alt={businessName || "Logo"}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
            ) : (
              <div className="h-20 w-20 md:h-28 md:w-28 rounded-xl bg-white/90 flex items-center justify-center">
                <Store className="h-10 w-10 md:h-14 md:w-14 text-neutral-400" />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onUpload}
              disabled={uploading}
              className="backdrop-blur-md bg-white/90 hover:bg-white text-neutral-900 border border-white/50 shadow-lg rounded-full h-10 w-10 p-0"
            >
              <FaPencilAlt className="h-4 w-4" />
            </Button>

            {displayLogo && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={onRemove}
                disabled={uploading}
                className="backdrop-blur-md bg-red-500/90 hover:bg-red-600 text-white border border-red-400/50 shadow-lg rounded-full h-10 w-10 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Store name preview */}
      <div className="bg-white p-6">
        <h3 className="text-2xl font-bold text-neutral-900">{businessName || "Your Store Name"}</h3>
        <p className="text-sm text-neutral-500 mt-1">Preview of your store banner</p>
      </div>
    </div>
  )
}
