"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface TutorialDialogProps {
  isOpen: boolean
  onClose: () => void
  t: (key: string) => string
}

export const TutorialDialog = ({ isOpen, onClose, t }: TutorialDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{t("products.tutorialTitle")}</DialogTitle>
        <DialogDescription>{t("products.tutorialDescription")}</DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">{t("products.overview")}</h3>
          <p className="text-sm text-neutral-600">{t("products.overviewDesc")}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t("products.inventoryManagement")}</h3>
          <p className="text-sm text-neutral-600">{t("products.inventoryManagementDesc")}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t("products.productDetails")}</h3>
          <p className="text-sm text-neutral-600">{t("products.productDetailsDesc")}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t("products.searchingFiltering")}</h3>
          <p className="text-sm text-neutral-600">{t("products.searchingFilteringDesc")}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t("products.actions")}</h3>
          <p className="text-sm text-neutral-600">{t("products.actionsDesc")}</p>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onClose}>{t("products.gotIt")}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
