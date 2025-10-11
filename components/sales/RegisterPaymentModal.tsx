"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { FaCreditCard, FaMoneyBillWave, FaUniversity, FaFileInvoiceDollar, FaEllipsisH } from "react-icons/fa"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/useTranslation"
import { useAuth } from "@/contexts/AuthContext"
import type { Installment } from "@/hooks/useInstallments"

interface RegisterPaymentModalProps {
  sale: any
  installments: Installment[]
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RegisterPaymentModal({ sale, installments, open, onClose, onSuccess }: RegisterPaymentModalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])

  // Calculate totals
  const totalPending = installments
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + (i.remaining_amount || i.amount), 0)
  const pendingCount = installments.filter((i) => i.status !== "paid").length

  // Calculate preview when amount changes
  useEffect(() => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      setPreview([])
      return
    }

    let remaining = Number.parseFloat(amount)
    const newPreview: any[] = []

    for (const installment of installments.filter((i) => i.status !== "paid")) {
      if (remaining <= 0) break

      const remainingAmount = installment.remaining_amount || installment.amount
      const toApply = Math.min(remaining, remainingAmount)

      newPreview.push({
        installment_number: installment.payment_number,
        will_pay: toApply,
        will_be_paid: toApply >= remainingAmount,
        remaining: remainingAmount,
      })

      remaining -= toApply
    }

    setPreview(newPreview)
  }, [amount, installments])

  const handleSubmit = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: t("common.error"),
        description: t("sales.payment.invalidAmount"),
        variant: "destructive",
      })
      return
    }

    if (!paymentMethod) {
      toast({
        title: t("common.error"),
        description: t("sales.payment.selectMethod"),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.rpc("apply_payment_to_sale", {
        p_sale_id: sale.id,
        p_user_id: user?.id,
        p_amount: Number.parseFloat(amount),
        p_payment_method: paymentMethod,
        p_notes: notes || "",
      })

      if (error) throw error

      toast({
        title: t("sales.payment.success"),
        description: data.message,
      })

      if (data.remaining_amount > 0) {
        toast({
          title: t("sales.payment.excessAmount"),
          description: t("sales.payment.excessAmountDesc", { amount: data.remaining_amount.toFixed(2) }),
          variant: "default",
        })
      }

      onSuccess()
      onClose()
      setAmount("")
      setPaymentMethod("")
      setNotes("")
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("sales.payment.failed"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {t("sales.payment.registerPayment")} - {sale?.sale_number}
          </DialogTitle>
          <DialogDescription>{t("sales.payment.description")}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-6">
          {/* Context Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="relative overflow-hidden rounded-xl bg-white border border-neutral-200/50 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-medium text-neutral-600">{t("sales.payment.totalSale")}</p>
              </div>
              <p className="text-2xl font-bold text-neutral-900">${sale?.total_amount.toFixed(2)}</p>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white border border-orange-200/50 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <p className="text-xs font-medium text-neutral-600">{t("sales.payment.totalPending")}</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">${totalPending.toFixed(2)}</p>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white border border-green-200/50 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-xs font-medium text-neutral-600">{t("sales.payment.pendingInstallments")}</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{pendingCount}</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-sm font-medium">
                {t("sales.payment.amountToPay")} *
              </Label>
              <div className="relative mt-1.5">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 text-lg font-semibold"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod" className="text-sm font-medium">
                {t("sales.payment.paymentMethod")} *
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t("sales.payment.selectMethod")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <FaMoneyBillWave className="h-4 w-4 text-green-600" />
                      <span>{t("sales.payment.methods.cash")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="transfer">
                    <div className="flex items-center gap-2">
                      <FaUniversity className="h-4 w-4 text-blue-600" />
                      <span>{t("sales.payment.methods.transfer")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <FaCreditCard className="h-4 w-4 text-purple-600" />
                      <span>{t("sales.payment.methods.card")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="check">
                    <div className="flex items-center gap-2">
                      <FaFileInvoiceDollar className="h-4 w-4 text-orange-600" />
                      <span>{t("sales.payment.methods.check")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <FaEllipsisH className="h-4 w-4 text-neutral-600" />
                      <span>{t("sales.payment.methods.other")}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                {t("sales.payment.notes")}
              </Label>
              <Textarea
                id="notes"
                placeholder={t("sales.payment.notesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="border rounded-lg p-4 bg-neutral-50">
              <h4 className="font-semibold text-sm mb-3">{t("sales.payment.applicationPreview")}</h4>
              <div className="space-y-2">
                {preview.map((p) => (
                  <div
                    key={p.installment_number}
                    className="flex items-center justify-between p-2 bg-white rounded border border-neutral-200/50"
                  >
                    <div className="flex items-center gap-2">
                      {p.will_be_paid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-sm font-medium">
                        {t("sales.payment.installment")} #{p.installment_number}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">${p.will_pay.toFixed(2)}</p>
                      <p className="text-xs text-neutral-500">
                        {p.will_be_paid ? t("sales.payment.willBePaid") : t("sales.payment.partialPayment")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {Number.parseFloat(amount) > totalPending && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {t("sales.payment.excessWarning", {
                      amount: (Number.parseFloat(amount) - totalPending).toFixed(2),
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !amount || Number.parseFloat(amount) <= 0 || !paymentMethod}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("sales.payment.processing")}
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {t("sales.payment.registerPayment")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
