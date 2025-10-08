"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomers, type Customer, type CustomerStats } from "@/hooks/useCustomers"
import { Mail, Phone, MapPin, TrendingUp, ShoppingCart, DollarSign, AlertCircle } from "lucide-react"

interface CustomerDetailsModalProps {
  customer: Customer | null
  open: boolean
  onClose: () => void
}

export function CustomerDetailsModal({ customer, open, onClose }: CustomerDetailsModalProps) {
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { getCustomerStats, getCustomerSalesHistory } = useCustomers()

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

  if (!customer) return null

  const creditUsage = customer.credit_limit && stats ? (stats.pending_amount / customer.credit_limit) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{customer.name}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={customer.customer_type === "business" ? "default" : "secondary"}>
              {customer.customer_type === "business" ? "Business" : "Individual"}
            </Badge>
            {customer.discount_percentage && customer.discount_percentage > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {customer.discount_type === "percentage"
                  ? `${customer.discount_percentage}% Discount`
                  : `$${customer.discount_percentage} Discount`}
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
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <div className="grid gap-3">
                  {customer.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
                      <Mail className="w-5 h-5 text-neutral-600" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
                      <Phone className="w-5 h-5 text-neutral-600" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
                      <MapPin className="w-5 h-5 text-neutral-600" />
                      <span className="text-sm">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Additional Details</h3>
                <div className="grid gap-3">
                  {customer.tax_id && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
                      <span className="text-sm text-neutral-600">Tax ID</span>
                      <span className="text-sm font-medium">{customer.tax_id}</span>
                    </div>
                  )}
                  {customer.date_of_birth && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
                      <span className="text-sm text-neutral-600">Date of Birth</span>
                      <span className="text-sm font-medium">
                        {new Date(customer.date_of_birth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {customer.credit_limit && (
                    <div className="space-y-2 p-3 rounded-lg bg-neutral-50">
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

              {/* Notes */}
              {customer.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Notes</h3>
                  <p className="text-sm text-neutral-600 p-3 rounded-lg bg-neutral-50">{customer.notes}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : salesHistory.length === 0 ? (
                <div className="text-center py-12 text-neutral-600">No purchase history yet</div>
              ) : (
                <div className="space-y-3">
                  {salesHistory.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">${sale.total_amount.toFixed(2)}</span>
                        <Badge variant={sale.status === "paid" ? "default" : "secondary"}>{sale.status}</Badge>
                      </div>
                      <div className="text-sm text-neutral-600">
                        <p>{new Date(sale.sale_date).toLocaleDateString()}</p>
                        <p className="mt-1">
                          {sale.sale_items?.length || 0} items • {sale.payment_type}
                        </p>
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
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Total Purchases</p>
                        <p className="text-2xl font-bold text-neutral-900">{stats?.total_purchases || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Total Spent</p>
                        <p className="text-2xl font-bold text-neutral-900">${(stats?.total_spent || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Pending Amount</p>
                        <p className="text-2xl font-bold text-neutral-900">
                          ${(stats?.pending_amount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {stats && stats.total_purchases > 0 && (
                    <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                      <p className="text-sm text-neutral-600 mb-2">Average Order Value</p>
                      <p className="text-2xl font-bold text-neutral-900">
                        ${(stats.total_spent / stats.total_purchases).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
