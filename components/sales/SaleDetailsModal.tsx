"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageCircle, Package, User, Calendar, DollarSign, Loader2, CheckCircle2, Share2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { ShareInvoiceModal } from "./ShareInvoiceModal"
import type { Installment } from "@/hooks/useInstallments"
import { useTranslation } from "@/hooks/useTranslation"

interface SaleDetailsModalProps {
  sale: any | null
  open: boolean
  onClose: () => void
}

export function SaleDetailsModal({ sale, open, onClose }: SaleDetailsModalProps) {
  const { t } = useTranslation()
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loadingInstallments, setLoadingInstallments] = useState(false)
  const [payingInstallment, setPayingInstallment] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadInstallments = async () => {
      if (!sale || sale.payment_type !== "credit") return

      setLoadingInstallments(true)
      try {
        const { data, error } = await supabase
          .from("installment_payments")
          .select("*")
          .eq("sale_id", sale.id)
          .order("payment_number", { ascending: true })

        if (!error && data) {
          setInstallments(data)
        }
      } catch (error) {
        // Error handled silently
      } finally {
        setLoadingInstallments(false)
      }
    }

    if (open && sale) {
      loadInstallments()
    }
  }, [sale, open])

  const handleMarkAsPaid = async (installmentId: string) => {
    setPayingInstallment(installmentId)

    try {
      const { error } = await supabase.rpc("mark_installment_paid", {
        installment_id: installmentId,
        payment_date: new Date().toISOString().split("T")[0],
      })

      if (error) throw error

      const { data } = await supabase
        .from("installment_payments")
        .select("*")
        .eq("sale_id", sale.id)
        .order("payment_number", { ascending: true })

      if (data) {
        setInstallments(data)
      }

      toast({
        title: t("sales.modal.paymentRecorded"),
        description: t("sales.modal.installmentMarkedPaid"),
      })
    } catch (err: any) {
      toast({
        title: t("common.error"),
        description: err.message || t("sales.modal.failedMarkPaid"),
        variant: "destructive",
      })
    } finally {
      setPayingInstallment(null)
    }
  }

  if (!sale) return null

  const statusConfig: Record<string, { label: string; color: string }> = {
    paid: { label: t("sales.paid"), color: "bg-green-100 text-green-800" },
    pending: { label: t("sales.pending"), color: "bg-yellow-100 text-yellow-800" },
    partial: { label: t("sales.partial"), color: "bg-blue-100 text-blue-800" },
    cancelled: { label: t("sales.cancelled"), color: "bg-red-100 text-red-800" },
  }

  const installmentStatusConfig: Record<string, { label: string; color: string }> = {
    paid: { label: t("sales.paid"), color: "bg-green-100 text-green-800" },
    pending: { label: t("sales.pending"), color: "bg-yellow-100 text-yellow-800" },
    late: { label: t("sales.modal.overdue"), color: "bg-red-100 text-red-800" },
    cancelled: { label: t("sales.cancelled"), color: "bg-gray-100 text-gray-800" },
  }

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const openWhatsApp = () => {
    if (!sale.customers?.phone) return
    const cleanPhone = sale.customers.phone.replace(/\D/g, "")
    const message = encodeURIComponent(
      `Hola ${sale.customers.name}, te recordamos que tienes pagos pendientes de tu compra.`,
    )
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank")
  }

  const paidCount = installments.filter((i) => i.status === "paid").length
  const pendingCount = installments.filter((i) => i.status === "pending").length
  const overdueCount = installments.filter((i) => i.status === "late").length

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-4 sm:px-6 pt-6 pb-4 border-b shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <DialogTitle className="text-xl sm:text-2xl">
                {t("sales.modal.title")} - {sale.sale_number}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={statusConfig[sale.status]?.color}>{statusConfig[sale.status]?.label}</Badge>
                <Button size="sm" variant="outline" onClick={() => setShareModalOpen(true)} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("sales.modal.shareInvoice")}</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-500">{t("sales.date")}</p>
                    <p className="font-medium text-sm truncate">{new Date(sale.sale_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-neutral-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-500">{t("sales.total")}</p>
                    <p className="font-medium text-sm truncate">${sale.total_amount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-neutral-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-500">{t("sales.payment")}</p>
                    <p className="font-medium text-sm capitalize truncate">{sale.payment_type}</p>
                  </div>
                </div>
                {sale.customers && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-500">{t("sales.customer")}</p>
                      <p className="font-medium text-sm truncate">{sale.customers.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {sale.customers && (
                <div className="border rounded-lg p-3 sm:p-4 bg-neutral-50">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t("sales.modal.customerInfo")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-500">{t("sales.modal.name")}</p>
                      <p className="font-medium text-sm truncate">{sale.customers.name}</p>
                    </div>
                    {sale.customers.email && (
                      <div className="min-w-0">
                        <p className="text-xs text-neutral-500">{t("sales.modal.email")}</p>
                        <p className="font-medium text-sm truncate">{sale.customers.email}</p>
                      </div>
                    )}
                    {sale.customers.phone && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-neutral-500">{t("sales.modal.phone")}</p>
                          <p className="font-medium text-sm truncate">{sale.customers.phone}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={openWhatsApp}
                          className="text-green-600 bg-transparent hover:bg-green-50 shrink-0"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t("sales.modal.products")}
                </h3>
                <div className="space-y-2">
                  {sale.sale_items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 bg-neutral-50 rounded">
                      {item.products?.image_url && (
                        <img
                          src={item.products.image_url || "/placeholder.svg"}
                          alt={item.product_name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product_name}</p>
                        <p className="text-xs sm:text-sm text-neutral-600">
                          {item.quantity} x ${item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-sm sm:text-base shrink-0">${item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {sale.payment_type === "credit" && (
                <div className="border rounded-lg p-3 sm:p-4 bg-gradient-to-br from-neutral-50 to-neutral-100">
                  <h3 className="font-semibold mb-4 text-base sm:text-lg">{t("sales.modal.installmentPayments")}</h3>

                  {!loadingInstallments && installments.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                      <div className="relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm border border-green-200/50 p-3 sm:p-4 shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10" />
                        <div className="relative">
                          <div className="flex items-center gap-1 sm:gap-2 mb-1">
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            <p className="text-[10px] sm:text-xs font-medium text-green-700">{t("sales.paid")}</p>
                          </div>
                          <p className="text-xl sm:text-3xl font-bold text-green-900">{paidCount}</p>
                        </div>
                      </div>

                      <div className="relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm border border-yellow-200/50 p-3 sm:p-4 shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-600/10" />
                        <div className="relative">
                          <div className="flex items-center gap-1 sm:gap-2 mb-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                            <p className="text-[10px] sm:text-xs font-medium text-yellow-700">{t("sales.pending")}</p>
                          </div>
                          <p className="text-xl sm:text-3xl font-bold text-yellow-900">{pendingCount}</p>
                        </div>
                      </div>

                      <div className="relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm border border-red-200/50 p-3 sm:p-4 shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-600/10" />
                        <div className="relative">
                          <div className="flex items-center gap-1 sm:gap-2 mb-1">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                            <p className="text-[10px] sm:text-xs font-medium text-red-700">
                              {t("sales.modal.overdue")}
                            </p>
                          </div>
                          <p className="text-xl sm:text-3xl font-bold text-red-900">{overdueCount}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {loadingInstallments ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-3 sm:-mx-4">
                      <div className="inline-block min-w-full align-middle px-3 sm:px-4">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead>
                            <tr>
                              <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-neutral-700 whitespace-nowrap">
                                #
                              </th>
                              <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-neutral-700 whitespace-nowrap">
                                {t("sales.modal.amount")}
                              </th>
                              <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-neutral-700 whitespace-nowrap">
                                {t("sales.modal.dueDate")}
                              </th>
                              <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-neutral-700 whitespace-nowrap">
                                {t("sales.status")}
                              </th>
                              <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-neutral-700 whitespace-nowrap">
                                {t("sales.modal.paidDate")}
                              </th>
                              <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-neutral-700 whitespace-nowrap">
                                {t("sales.modal.action")}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {installments.map((installment) => {
                              const daysOverdue =
                                installment.status === "late" ? getDaysOverdue(installment.due_date) : 0
                              return (
                                <tr key={installment.id}>
                                  <td className="py-3 px-2 font-medium text-sm whitespace-nowrap">
                                    {installment.payment_number}
                                  </td>
                                  <td className="py-3 px-2 font-semibold text-neutral-900 text-sm whitespace-nowrap">
                                    ${installment.amount.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-2 whitespace-nowrap">
                                    <div>
                                      <p className="text-xs sm:text-sm">
                                        {new Date(installment.due_date).toLocaleDateString()}
                                      </p>
                                      {daysOverdue > 0 && (
                                        <p className="text-[10px] sm:text-xs text-red-600 font-medium mt-0.5">
                                          {daysOverdue}d {t("sales.modal.overdueDays")}
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-2 whitespace-nowrap">
                                    <Badge className={`text-xs ${installmentStatusConfig[installment.status]?.color}`}>
                                      {installmentStatusConfig[installment.status]?.label}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-2 text-xs sm:text-sm text-neutral-600 whitespace-nowrap">
                                    {installment.paid_date ? new Date(installment.paid_date).toLocaleDateString() : "-"}
                                  </td>
                                  <td className="py-3 px-2 whitespace-nowrap">
                                    {(installment.status === "pending" || installment.status === "late") && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleMarkAsPaid(installment.id)}
                                        disabled={payingInstallment === installment.id}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm text-xs"
                                      >
                                        {payingInstallment === installment.id ? (
                                          <>
                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                            <span className="hidden sm:inline">{t("sales.modal.processing")}</span>
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            <span className="hidden sm:inline">{t("sales.modal.markAsPaid")}</span>
                                            <span className="sm:hidden">{t("sales.modal.pay")}</span>
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {sale && (
        <ShareInvoiceModal
          publicToken={sale.public_token}
          saleNumber={sale.sale_number}
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </>
  )
}
