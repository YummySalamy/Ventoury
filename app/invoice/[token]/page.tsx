"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, DollarSign, Package, User, CheckCircle2, AlertCircle, Building2, Mail, Phone } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"

export default function PublicInvoicePage() {
  const params = useParams()
  const token = params.token as string

  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInvoiceData()
  }, [token])

  const loadInvoiceData = async () => {
    try {
      setLoading(true)

      const { data, error: rpcError } = await supabase.rpc("get_public_invoice", {
        invoice_token: token,
      })

      if (rpcError) throw rpcError

      if (!data || !data.sale) {
        setError("Invoice not found")
        return
      }

      setInvoiceData(data)
    } catch (err: any) {
      console.error("[v0] Error loading invoice:", err)
      setError(err.message || "Failed to load invoice")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error || !invoiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Invoice Not Found</h1>
          <p className="text-neutral-600">The invoice you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const { sale, store, customer, items, installments } = invoiceData

  const statusConfig: Record<string, { label: string; color: string }> = {
    paid: { label: "Paid", color: "bg-green-100 text-green-800" },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    partial: { label: "Partial", color: "bg-blue-100 text-blue-800" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  }

  const installmentStatusConfig: Record<string, { label: string; color: string }> = {
    paid: { label: "Paid", color: "bg-green-100 text-green-800" },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    late: { label: "Overdue", color: "bg-red-100 text-red-800" },
    cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
  }

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const primaryColor = store?.theme?.primaryColor || "#0a0a0a"
  const secondaryColor = store?.theme?.secondaryColor || "#ffffff"

  const generatePaymentMessage = () => {
    const message = `Hola! Quiero realizar el pago de mi factura:\n\n📄 Factura: #${sale.sale_number}\n💰 Total: $${sale.total_amount.toFixed(2)}\n📅 Fecha: ${new Date(sale.sale_date).toLocaleDateString()}\n\n🔗 Ver factura: ${window.location.href}\n\n¿Cuáles son los medios de pago disponibles?`
    return encodeURIComponent(message)
  }

  const generateInstallmentPaymentMessage = (installment: any) => {
    const message = `Hola! Quiero consultar sobre el pago de mi cuota:\n\n📄 Factura: #${sale.sale_number}\n💳 Cuota #${installment.payment_number}\n💰 Monto: $${installment.amount.toFixed(2)}\n📅 Vencimiento: ${new Date(installment.due_date).toLocaleDateString()}\n\n🔗 Ver factura: ${window.location.href}\n\n¿Cuáles son los medios de pago disponibles?`
    return encodeURIComponent(message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Store Header Banner */}
        <div
          className="relative overflow-hidden rounded-2xl mb-6 p-6 sm:p-8 text-white shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        >
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                {store?.logo_url && (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm p-2 border border-white/20 shrink-0">
                    <img
                      src={store.logo_url || "/placeholder.svg"}
                      alt={store.name || "Store"}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold truncate">{store?.name || "Invoice"}</h1>
                  <p className="text-white/80 text-sm sm:text-base">Invoice #{sale.sale_number}</p>
                </div>
              </div>
              <Badge className={`${statusConfig[sale.status]?.color} text-sm sm:text-base px-3 py-1 shrink-0`}>
                {statusConfig[sale.status]?.label}
              </Badge>
            </div>

            {store?.address && (
              <div className="flex items-start gap-2 text-white/90 text-sm">
                <Building2 className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="break-words">{store.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neutral-100 rounded-lg shrink-0">
                <Calendar className="h-5 w-5 text-neutral-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Date</p>
                <p className="font-semibold truncate">{new Date(sale.sale_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neutral-100 rounded-lg shrink-0">
                <DollarSign className="h-5 w-5 text-neutral-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Total</p>
                <p className="font-semibold truncate">${sale.total_amount.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neutral-100 rounded-lg shrink-0">
                <Package className="h-5 w-5 text-neutral-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Payment</p>
                <p className="font-semibold capitalize truncate">{sale.payment_type}</p>
              </div>
            </div>
            {customer && (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-neutral-100 rounded-lg shrink-0">
                  <User className="h-5 w-5 text-neutral-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-neutral-500">Customer</p>
                  <p className="font-semibold truncate">{customer.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Customer Details */}
          {customer && (
            <div className="border-t pt-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Bill To</h3>
              <div className="space-y-2">
                <p className="font-medium">{customer.name}</p>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">Items</h3>
            <div className="space-y-3">
              {items?.map((item: any, index: number) => (
                <div
                  key={`${item.product_name}-${index}`}
                  className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.product_name}</p>
                    <p className="text-sm text-neutral-600">
                      {item.quantity} x ${item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold text-lg shrink-0">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <span className="text-xl font-bold">Total</span>
              <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                ${sale.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Installment Schedule */}
        {sale.payment_type === "credit" && installments && installments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h3 className="font-semibold text-xl mb-6">Payment Schedule</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-700">Paid</p>
                </div>
                <p className="text-3xl font-bold text-green-900">
                  {installments.filter((i: any) => i.status === "paid").length}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                </div>
                <p className="text-3xl font-bold text-yellow-900">
                  {installments.filter((i: any) => i.status === "pending").length}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-medium text-red-700">Overdue</p>
                </div>
                <p className="text-3xl font-bold text-red-900">
                  {installments.filter((i: any) => i.status === "late").length}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-semibold">#</th>
                    <th className="text-left py-3 px-2 font-semibold">Amount</th>
                    <th className="text-left py-3 px-2 font-semibold">Due Date</th>
                    <th className="text-left py-3 px-2 font-semibold">Status</th>
                    <th className="text-left py-3 px-2 font-semibold">Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((installment: any) => {
                    const daysOverdue = installment.status === "late" ? getDaysOverdue(installment.due_date) : 0
                    return (
                      <tr key={installment.payment_number} className="border-b last:border-0">
                        <td className="py-4 px-2 font-medium">{installment.payment_number}</td>
                        <td className="py-4 px-2 font-semibold">${installment.amount.toFixed(2)}</td>
                        <td className="py-4 px-2">
                          <div>
                            <p>{new Date(installment.due_date).toLocaleDateString()}</p>
                            {daysOverdue > 0 && (
                              <p className="text-xs text-red-600 font-medium mt-1">{daysOverdue}d overdue</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <Badge className={installmentStatusConfig[installment.status]?.color}>
                            {installmentStatusConfig[installment.status]?.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          {installment.status === "paid" ? (
                            <span className="text-neutral-600">
                              {new Date(installment.paid_date).toLocaleDateString()}
                            </span>
                          ) : (
                            <TooltipProvider>
                              <div className="flex items-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      disabled
                                      className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-md opacity-50 cursor-not-allowed hover:opacity-50 transition-opacity"
                                    >
                                      Pay Now
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Coming Soon</p>
                                  </TooltipContent>
                                </Tooltip>

                                {store?.whatsapp && (
                                  <a
                                    href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=${generateInstallmentPaymentMessage(installment)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-medium rounded-md transition-colors"
                                  >
                                    <FaWhatsapp className="h-3.5 w-3.5" />
                                    Consult
                                  </a>
                                )}
                              </div>
                            </TooltipProvider>
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

        {/* Store Contact */}
        {store?.whatsapp && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-neutral-600 mb-4">Questions about this invoice?</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg font-medium transition-colors"
              >
                Contact via WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
