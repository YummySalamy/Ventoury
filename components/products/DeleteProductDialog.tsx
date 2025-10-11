"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FiAlertTriangle } from "react-icons/fi"

interface DeleteProductDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
  isDeleting: boolean
  t: (key: string, params?: Record<string, any>) => string
}

export function DeleteProductDialog({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isDeleting,
  t,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">{t("products.deleteConfirmTitle")}</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {t("products.deleteConfirmDesc")} <span className="font-semibold text-neutral-900">"{productName}"</span>?
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">{t("products.deleteConfirmAction")}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 sm:flex-initial bg-transparent"
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? t("products.deleting") : t("products.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
