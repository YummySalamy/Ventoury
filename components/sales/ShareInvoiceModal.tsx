"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Share2, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/useTranslation"

interface ShareInvoiceModalProps {
  publicToken: string
  saleNumber: string
  marketplaceSlug: string // Added marketplaceSlug prop
  open: boolean
  onClose: () => void
}

export function ShareInvoiceModal({ publicToken, saleNumber, marketplaceSlug, open, onClose }: ShareInvoiceModalProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const invoiceUrl =
    typeof window !== "undefined" ? `${window.location.origin}/${marketplaceSlug}/invoice/${publicToken}` : ""

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invoiceUrl)
      setCopied(true)
      toast({
        title: t("sales.shareModal.linkCopied"),
        description: t("sales.shareModal.linkCopiedDesc"),
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: t("sales.shareModal.failedCopy"),
        description: t("sales.shareModal.copyManually"),
        variant: "destructive",
      })
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t("sales.shareModal.invoice")} #${saleNumber}`,
          text: t("sales.shareModal.viewInvoice"),
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
            {t("sales.shareModal.title")}
          </DialogTitle>
          <DialogDescription>{t("sales.shareModal.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-600 mb-1">{t("sales.shareModal.invoiceNumber")}</p>
            <p className="font-semibold text-lg">#{saleNumber}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">{t("sales.shareModal.invoiceLink")}</label>
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

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleCopy} className="w-full bg-neutral-900 hover:bg-neutral-800">
              <Copy className="h-4 w-4 mr-2" />
              {t("sales.shareModal.copyLink")}
            </Button>

            {navigator.share && (
              <Button onClick={handleNativeShare} variant="outline" className="w-full bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                {t("sales.shareModal.shareVia")}
              </Button>
            )}

            <Button onClick={handleOpenInNewTab} variant="outline" className="w-full bg-transparent">
              <ExternalLink className="h-4 w-4 mr-2" />
              {t("sales.shareModal.openNewTab")}
            </Button>
          </div>

          <p className="text-xs text-neutral-500 text-center pt-2">{t("sales.shareModal.infoText")}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
