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

interface FormTutorialDialogProps {
  isOpen: boolean
  onClose: () => void
  t: (key: string) => string
}

export const FormTutorialDialog = ({ isOpen, onClose, t }: FormTutorialDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{t("products.tutorialTitle")}</DialogTitle>
        <DialogDescription>{t("products.tutorialDescription")}</DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">{t("products.addingProducts")}</h3>
          <p className="text-sm text-neutral-600">{t("products.addingProductsDesc")}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t("products.pricingTiers")}</h3>
          <p className="text-sm text-neutral-600 mb-2">{t("products.pricingTiersDesc")}</p>
          <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
            <li>
              <strong>{t("products.costPrice")}:</strong> {t("products.costPriceDesc")}
            </li>
            <li>
              <strong>{t("products.salePrice")}:</strong> {t("products.salePriceDesc")}
            </li>
            <li>
              <strong>{t("products.retailPrice")}:</strong> {t("products.retailPriceDesc")}
            </li>
            <li>
              <strong>{t("products.wholesalePrice")}:</strong> {t("products.wholesalePriceDesc")}
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t("products.stockManagement")}</h3>
          <p className="text-sm text-neutral-600 mb-2">{t("products.stockManagementDesc")}</p>
          <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
            <li>
              <strong>{t("products.minStockAlert")}:</strong> {t("products.minStockAlertDesc")}
            </li>
            <li>
              <strong>{t("products.maxStockTarget")}:</strong> {t("products.maxStockTargetDesc")}
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t("products.productHistory")}</h3>
          <p className="text-sm text-neutral-600">{t("products.productHistoryDesc")}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t("products.filteringSearching")}</h3>
          <p className="text-sm text-neutral-600">{t("products.filteringSearchingDesc")}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t("products.viewModes")}</h3>
          <p className="text-sm text-neutral-600">{t("products.viewModesDesc")}</p>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onClose}>{t("products.gotIt")}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
