"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useCustomers, type Customer, type CustomerStats } from "@/hooks/useCustomers"
import {
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Share2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ShareInvoiceModal } from "@/components/sales/ShareInvoiceModal"

interface CustomerDetailsModalProps {
  customer: Customer | null
  open: boolean
  onClose: () => void
}

export function CustomerDetailsModal({ customer, open, onClose }: CustomerDetailsModalProps) {
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [shareInvoiceToken, setShareInvoiceToken] = useState<string | null>(null)
  const [shareInvoiceNumber, setShareInvoiceNumber] = useState<string>("")
  const [shareInvoiceOpen, setShareInvoiceOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { getCustomerStats, getCustomerSalesHistory } = useCustomers()
  const { toast } = useToast()

  useEffect(() => {
    if (customer && open) {
      loadCustomerData()
    }
  }, [customer, open])

  const loadCustomerData = async () => {
    if (!customer) return

    setLoading(true)
    try {
      const [statsData, historyData] = await Promise.all([
        getCustomerStats(customer.id),
        getCustomerSalesHistory(customer.id),
      ])

      setStats(statsData)
      setSalesHistory(historyData.data || [])
    } catch (err) {
      console.error("Error loading customer data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopySaleCode = async (saleNumber: string) => {
    try {
      await navigator.clipboard.writeText(saleNumber)
      setCopiedId(saleNumber)
      toast({
        title: "Copied!",
        description: "Sale code copied to clipboard",
      })
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
      case "partial":
        return "bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0"
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0"
      default:
        return "bg-neutral-200 text-neutral-700"
    }
  }

  if (!customer) return null

  const creditUsage = customer.credit_limit && stats ? (stats.pending_amount / customer.credit_limit) * 100 : 0

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case "vip":
        return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">VIP</Badge>
      case "wholesale":
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">Wholesale</Badge>
      default:
        return (
          <Badge variant="secondary" className="bg-neutral-200 text-neutral-700">
            Regular
          </Badge>
        )
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col backdrop-blur-xl bg-white/95 border border-neutral-200/50">
          <DialogHeader>
            <DialogTitle className="text-2xl">{customer.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {getCustomerTypeBadge(customer.customer_type || "regular")}
              {customer.discount_value && customer.discount_value > 0 && customer.discount_type !== "none" && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {customer.discount_type === "percentage"
                    ? `${customer.discount_value}% Discount`
                    : `$${customer.discount_value} Discount`}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="history">Purchase History</TabsTrigger>
              <TabsTrigger value="behavior">Payment Behavior</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="info" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Contact Information</h3>
                  <div className="grid gap-3">
                    {customer.email && (
                      <div className="flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm bg-neutral-50/80 border border-neutral-200/50">
                        <Mail className="w-5 h-5 text-neutral-600" />
                        <span className="text-sm">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm bg-neutral-50/80 border border-neutral-200/50">
                        <Phone className="w-5 h-5 text-neutral-600" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm bg-neutral-50/80 border border-neutral-200/50">
                        <MapPin className="w-5 h-5 text-neutral-600" />
                        <span className="text-sm">{customer.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Additional Details</h3>
                  <div className="grid gap-3">
                    {customer.tax_id && (
                      <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-neutral-50/80 border border-neutral-200/50">
                        <span className="text-sm text-neutral-600">Tax ID</span>
                        <span className="text-sm font-medium">{customer.tax_id}</span>
                      </div>
                    )}
                    {customer.date_of_birth && (
                      <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-neutral-50/80 border border-neutral-200/50">
                        <span className="text-sm text-neutral-600">Date of Birth</span>
                        <span className="text-sm font-medium">
                          {new Date(customer.date_of_birth).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {customer.credit_limit && (
                      <div className="space-y-2 p-3 rounded-lg backdrop-blur-sm bg-neutral-50/80 border border-neutral-200/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Credit Limit</span>
                          <span className="text-sm font-medium">${customer.credit_limit.toFixed(2)}</span>
                        </div>
                        {stats && (
                          <>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-500">Used</span>
                              <span className="font-medium">${stats.pending_amount.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  creditUsage > 80 ? "bg-red-500" : creditUsage > 50 ? "bg-yellow-500" : "bg-green-500"
                                }`}
                                style={{ width: `${Math.min(creditUsage, 100)}%` }}
                              />
                            </div>
                            {creditUsage > 80 && (
                              <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>Credit limit almost reached</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {customer.notes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Notes</h3>
                    <p className="text-sm text-neutral-600 p-3 rounded-lg backdrop-blur-sm bg-neutral-50/80 border border-neutral-200/50">
                      {customer.notes}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : salesHistory.length === 0 ? (
                  <div className="text-center py-12 text-neutral-600">No purchase history yet</div>
                ) : (
                  <div className="space-y-3">
                    {salesHistory.map((sale) => (
                      <div
                        key={sale.id}
                        className="p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors backdrop-blur-sm bg-white/50"
                      >
                        <div className="space-y-3">
                          {/* Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-xl font-bold text-neutral-900">
                                ${sale.total_amount.toFixed(2)}
                              </span>
                              <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="backdrop-blur-md bg-white/50 border-neutral-200 hover:bg-white/80 rounded-full"
                                onClick={() => {
                                  if (!sale.public_token) {
                                    toast({
                                      title: "Invoice not available",
                                      description: "This sale does not have a public invoice link",
                                      variant: "destructive",
                                    })
                                    return
                                  }
                                  window.open(`/invoice/${sale.public_token}`, "_blank")
                                }}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                className="bg-black hover:bg-neutral-800 text-white rounded-full"
                                onClick={() => {
                                  if (!sale.public_token) {
                                    toast({
                                      title: "Invoice not available",
                                      description: "This sale does not have a public invoice link",
                                      variant: "destructive",
                                    })
                                    return
                                  }
                                  setShareInvoiceToken(sale.public_token)
                                  setShareInvoiceNumber(sale.sale_number)
                                  setShareInvoiceOpen(true)
                                }}
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-neutral-500 text-xs mb-1">Sale Number</p>
                              <div className="flex items-center gap-2">
                                <code className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded">
                                  {sale.sale_number}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleCopySaleCode(sale.sale_number)}
                                >
                                  {copiedId === sale.sale_number ? (
                                    <Check className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <p className="text-neutral-500 text-xs mb-1">Date</p>
                              <p className="font-medium">{new Date(sale.sale_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-neutral-500 text-xs mb-1">Items</p>
                              <p className="font-medium">{sale.items?.length || 0} items</p>
                            </div>
                            <div>
                              <p className="text-neutral-500 text-xs mb-1">Payment Type</p>
                              <p className="font-medium capitalize">{sale.payment_type}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="behavior" className="mt-0">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border border-blue-200 backdrop-blur-sm">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                          <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">Total Purchases</p>
                          <p className="text-3xl font-bold text-neutral-900">{stats?.total_purchases || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border border-green-200 backdrop-blur-sm">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">Total Spent</p>
                          <p className="text-3xl font-bold text-neutral-900">${(stats?.total_spent || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 border border-purple-200 backdrop-blur-sm">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                          <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">Pending Amount</p>
                          <p className="text-3xl font-bold text-neutral-900">
                            ${(stats?.pending_amount || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {stats && stats.total_purchases > 0 && (
                      <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border border-orange-200 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600">Average Order Value</p>
                            <p className="text-3xl font-bold text-neutral-900">${stats.avg_purchase.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {shareInvoiceToken && (
        <ShareInvoiceModal
          publicToken={shareInvoiceToken}
          saleNumber={shareInvoiceNumber}
          open={shareInvoiceOpen}
          onClose={() => {
            setShareInvoiceOpen(false)
            setShareInvoiceToken(null)
            setShareInvoiceNumber("")
          }}
        />
      )}
    </>
  )
}
