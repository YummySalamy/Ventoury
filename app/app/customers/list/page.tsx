"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { Plus, Search, Mail, Phone, Users, TrendingUp, DollarSign, Edit, Trash2, Eye } from "lucide-react"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCustomers } from "@/hooks/useCustomers"
import { useToast } from "@/hooks/use-toast"
import { CustomerDetailsModal } from "@/components/customers/CustomerDetailsModal"
import { Loader2 } from "lucide-react"

export default function CustomersListPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    tax_id: "",
    date_of_birth: "",
    customer_type: "individual" as "individual" | "business",
    credit_limit: "",
    discount_percentage: "",
    discount_type: "percentage" as "percentage" | "fixed",
  })

  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { customers, loading, error, createCustomer, deleteCustomer } = useCustomers()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const { error } = await createCustomer({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        notes: formData.notes || null,
        tax_id: formData.tax_id || null,
        date_of_birth: formData.date_of_birth || null,
        customer_type: formData.customer_type,
        credit_limit: formData.credit_limit ? Number.parseFloat(formData.credit_limit) : null,
        discount_percentage: formData.discount_percentage ? Number.parseFloat(formData.discount_percentage) : null,
        discount_type: formData.discount_type,
        is_active: true,
      })

      if (error) throw new Error(error)

      toast({
        title: "Customer created!",
        description: `${formData.name} has been added.`,
      })

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
        tax_id: "",
        date_of_birth: "",
        customer_type: "individual",
        credit_limit: "",
        discount_percentage: "",
        discount_type: "percentage",
      })
      setIsDialogOpen(false)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create customer",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (customerId: string, customerName: string) => {
    if (!confirm(`Are you sure you want to delete ${customerName}?`)) return

    try {
      const { error } = await deleteCustomer(customerId)
      if (error) throw new Error(error)

      toast({
        title: "Customer deleted",
        description: `${customerName} has been removed.`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete customer",
        variant: "destructive",
      })
    }
  }

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0)
  const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900">
              Customers <span className="italic font-light text-neutral-600">Directory</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">Manage your customer relationships and data</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neutral-900 hover:bg-neutral-800 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>Create a new customer profile with optional discount settings</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Basic Information</h3>

                    <div className="grid gap-2">
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        placeholder="Enter customer name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="customerType">Customer Type</Label>
                        <Select
                          value={formData.customer_type}
                          onValueChange={(value: "individual" | "business") =>
                            setFormData({ ...formData, customer_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input
                          id="taxId"
                          placeholder="Tax ID number"
                          value={formData.tax_id}
                          onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-sm">Contact Information</h3>

                    <div className="grid gap-2">
                      <Label htmlFor="customerEmail">Email Address</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        placeholder="customer@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="customerPhone">Phone Number</Label>
                      <Input
                        id="customerPhone"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="customerAddress">Address</Label>
                      <textarea
                        id="customerAddress"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Customer address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Financial Settings */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-sm">Financial Settings</h3>

                    <div className="grid gap-2">
                      <Label htmlFor="creditLimit">Credit Limit</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.credit_limit}
                        onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="discountType">Discount Type</Label>
                        <Select
                          value={formData.discount_type}
                          onValueChange={(value: "percentage" | "fixed") =>
                            setFormData({ ...formData, discount_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="discountValue">
                          Discount {formData.discount_type === "percentage" ? "%" : "$"}
                        </Label>
                        <Input
                          id="discountValue"
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={formData.discount_percentage}
                          onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="grid gap-2 pt-4 border-t">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Additional notes about this customer"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-neutral-900 hover:bg-neutral-800" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Customer"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base text-neutral-600">Total Customers</p>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">{totalCustomers}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base text-neutral-600">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base text-neutral-600">Avg. Customer Value</p>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">${avgCustomerValue.toFixed(2)}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input placeholder="Search customers by name, email, or phone..." className="pl-10" />
          </div>
        </GlassCard>

        {loading && (
          <GlassCard>
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading customers...</p>
            </div>
          </GlassCard>
        )}

        {error && (
          <GlassCard>
            <div className="text-center py-12">
              <p className="text-red-600">Error: {error}</p>
            </div>
          </GlassCard>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {customers.length === 0 ? (
              <div className="col-span-full">
                <GlassCard>
                  <div className="text-center py-12 text-neutral-600">
                    No customers yet. Create your first customer to get started!
                  </div>
                </GlassCard>
              </div>
            ) : (
              customers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors truncate">
                          {customer.name}
                        </h3>
                        {customer.email && (
                          <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-neutral-600">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-neutral-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setDetailsOpen(true)
                          }}
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                      <div>
                        <p className="text-xs sm:text-sm text-neutral-600">Orders</p>
                        <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                          {customer.total_purchases || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm text-neutral-600">Total Spent</p>
                        <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                          ${(customer.total_spent || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>

      <CustomerDetailsModal
        customer={selectedCustomer}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false)
          setSelectedCustomer(null)
        }}
      />
    </div>
  )
}
