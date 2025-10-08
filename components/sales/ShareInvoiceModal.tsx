"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Share2, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareInvoiceModalProps {
  saleId: string
  saleNumber: string
  open: boolean
  onClose: () => void
}

export function ShareInvoiceModal({ saleId, saleNumber, open, onClose }: ShareInvoiceModalProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const invoiceUrl = typeof window !== "undefined" ? `${window.location.origin}/invoice/${saleId}` : ""

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invoiceUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Invoice link has been copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      })
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice #${saleNumber}`,
          text: "View your invoice",
          url: invoiceUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
      }
    }
  }

  const handleOpenInNewTab = () => {
    window.open(invoiceUrl, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Invoice
          </DialogTitle>
          <DialogDescription>Share this invoice link with your customer</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Invoice Info */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-600 mb-1">Invoice Number</p>
            <p className="font-semibold text-lg">#{saleNumber}</p>
          </div>

          {/* URL Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Invoice Link</label>
            <div className="flex gap-2">
              <Input value={invoiceUrl} readOnly className="font-mono text-sm" />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className={`shrink-0 ${copied ? "bg-green-50 border-green-200" : ""}`}
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleCopy} className="w-full bg-neutral-900 hover:bg-neutral-800">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>

            {navigator.share && (
              <Button onClick={handleNativeShare} variant="outline" className="w-full bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Share via...
              </Button>
            )}

            <Button onClick={handleOpenInNewTab} variant="outline" className="w-full bg-transparent">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-neutral-500 text-center pt-2">
            This link allows anyone to view the invoice details and payment schedule
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
