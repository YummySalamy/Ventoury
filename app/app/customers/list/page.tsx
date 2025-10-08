"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Mail,
  Phone,
  Users,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Info,
  AlertCircle,
  Grid3x3,
  List,
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslation } from "@/hooks/useTranslation"

export default function CustomersListPage() {
  const { t } = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20

  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("customersViewMode") as "grid" | "list") || "grid"
    }
    return "grid"
  })

  const [editingCustomer, setEditingCustomer] = useState<any | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)

  const [dashboardStats, setDashboardStats] = useState({
    total_customers: 0,
    total_revenue: 0,
    avg_customer_value: 0,
  })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    tax_id: "",
    date_of_birth: "",
    customer_type: "regular" as "regular" | "vip" | "wholesale",
    credit_limit: "",
    discount_value: "",
    discount_type: "none" as "none" | "percentage" | "fixed",
  })

  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const {
    customers,
    loading,
    error,
    fetchCustomers,
    getDashboardStats,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers()
  const { toast } = useToast()

  useEffect(() => {
    localStorage.setItem("customersViewMode", viewMode)
  }, [viewMode])

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    const stats = await getDashboardStats()
    if (stats) {
      setDashboardStats(stats)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadCustomers()
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, page])

  const loadCustomers = async () => {
    const result = await fetchCustomers(searchTerm || undefined, page * pageSize, pageSize)
    if (result.totalCount !== undefined) {
      setTotalCount(result.totalCount)
    }
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return t("customers.validation.nameRequired")
    }
    if (!formData.email.trim() && !formData.phone.trim()) {
      return t("customers.validation.contactRequired")
    }
    return null
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      tax_id: "",
      date_of_birth: "",
      customer_type: "regular",
      credit_limit: "",
      discount_value: "",
      discount_type: "none",
    })
    setEditingCustomer(null)
  }

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      notes: customer.notes || "",
      tax_id: customer.tax_id || "",
      date_of_birth: customer.date_of_birth || "",
      customer_type: customer.customer_type || "regular",
      credit_limit: customer.credit_limit?.toString() || "",
      discount_value: customer.discount_value?.toString() || "",
      discount_type: customer.discount_type || "none",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      toast({
        title: t("customers.validation.error"),
        description: validationError,
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const customerData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        notes: formData.notes || null,
        tax_id: formData.tax_id || null,
        date_of_birth: formData.date_of_birth || null,
        customer_type: formData.customer_type,
        credit_limit: formData.credit_limit ? Number.parseFloat(formData.credit_limit) : null,
        discount_value: formData.discount_value ? Number.parseFloat(formData.discount_value) : null,
        discount_type: formData.discount_type,
        is_active: true,
      }

      if (editingCustomer) {
        const { error } = await updateCustomer(editingCustomer.id, customerData)
        if (error) throw new Error(error)
        toast({
          title: t("customers.updated"),
          description: `${formData.name} ${t("customers.hasBeenUpdated")}`,
        })
      } else {
        const { error } = await createCustomer(customerData)
        if (error) throw new Error(error)
        toast({
          title: t("customers.created"),
          description: `${formData.name} ${t("customers.hasBeenAdded")}`,
        })
      }

      resetForm()
      setIsDialogOpen(false)
      loadDashboardStats()
    } catch (err: any) {
      toast({
        title: t("common.error"),
        description: err.message || t("customers.failedToSave"),
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const { error } = await deleteCustomer(deleteConfirm.id)
      if (error) throw new Error(error)

      toast({
        title: t("customers.deleted"),
        description: `${deleteConfirm.name} ${t("customers.hasBeenRemoved")}`,
      })
      loadDashboardStats()
    } catch (err: any) {
      toast({
        title: t("common.error"),
        description: err.message || t("customers.failedToDelete"),
        variant: "destructive",
      })
    } finally {
      setDeleteConfirm(null)
    }
  }

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case "vip":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
            {t("customers.types.vip")}
          </Badge>
        )
      case "wholesale":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
            {t("customers.types.wholesale")}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-neutral-200 text-neutral-700">
            {t("customers.types.regular")}
          </Badge>
        )
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toFixed(2)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900">
              {t("customers.title")}{" "}
              <span className="italic font-light text-neutral-600">{t("customers.subtitle")}</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">{t("customers.description")}</p>
          </div>

          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowTutorial(true)}>
                    <Info className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("customers.viewTutorial")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-neutral-900 hover:bg-neutral-800 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("customers.addCustomer")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 border border-neutral-200/50">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {editingCustomer ? t("customers.editCustomer") : t("customers.addNewCustomer")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowTutorial(true)}>
                            <Info className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("customers.viewFieldDescriptions")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DialogTitle>
                  <DialogDescription>
                    {editingCustomer ? t("customers.updateCustomerInfo") : t("customers.createNewProfile")}.{" "}
                    {t("customers.fieldsRequired")}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50/50 border border-blue-200/50 backdrop-blur-sm">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-blue-700">{t("customers.contactRequirement")}</p>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {t("customers.basicInfo")}
                      </h3>

                      <div className="grid gap-2">
                        <Label htmlFor="customerName" className="flex items-center gap-1">
                          {t("customers.fullName")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customerName"
                          placeholder={t("customers.enterName")}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="backdrop-blur-sm bg-white/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="customerType" className="flex items-center gap-1">
                            {t("customers.customerType")} <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.customer_type}
                            onValueChange={(value: "regular" | "vip" | "wholesale") =>
                              setFormData({ ...formData, customer_type: value })
                            }
                          >
                            <SelectTrigger className="backdrop-blur-sm bg-white/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">{t("customers.types.regular")}</SelectItem>
                              <SelectItem value="vip">{t("customers.types.vip")}</SelectItem>
                              <SelectItem value="wholesale">{t("customers.types.wholesale")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="taxId">{t("customers.taxId")}</Label>
                          <Input
                            id="taxId"
                            placeholder={t("customers.taxIdPlaceholder")}
                            value={formData.tax_id}
                            onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                            className="backdrop-blur-sm bg-white/50"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="dateOfBirth">{t("customers.dateOfBirth")}</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          className="backdrop-blur-sm bg-white/50"
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4 pt-4 border-t border-neutral-200/50">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {t("customers.contactInfo")}
                      </h3>

                      <div className="grid gap-2">
                        <Label htmlFor="customerEmail">{t("customers.emailAddress")}</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          placeholder={t("customers.emailPlaceholder")}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="backdrop-blur-sm bg-white/50"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="customerPhone">{t("customers.phoneNumber")}</Label>
                        <Input
                          id="customerPhone"
                          placeholder={t("customers.phonePlaceholder")}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="backdrop-blur-sm bg-white/50"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="customerAddress">{t("customers.address")}</Label>
                        <textarea
                          id="customerAddress"
                          className="flex min-h-[80px] w-full rounded-md border border-input backdrop-blur-sm bg-white/50 px-3 py-2 text-sm"
                          placeholder={t("customers.addressPlaceholder")}
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Financial Settings */}
                    <div className="space-y-4 pt-4 border-t border-neutral-200/50">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {t("customers.financialSettings")}
                      </h3>

                      <div className="grid gap-2">
                        <Label htmlFor="creditLimit" className="flex items-center gap-2">
                          {t("customers.creditLimit")}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3 h-3 text-neutral-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{t("customers.creditLimitTooltip")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="creditLimit"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.credit_limit}
                          onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                          className="backdrop-blur-sm bg-white/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="discountType" className="flex items-center gap-2">
                            {t("customers.discountType")}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-neutral-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{t("customers.discountTypeTooltip")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Select
                            value={formData.discount_type}
                            onValueChange={(value: "none" | "percentage" | "fixed") =>
                              setFormData({ ...formData, discount_type: value })
                            }
                          >
                            <SelectTrigger className="backdrop-blur-sm bg-white/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">{t("customers.discountTypes.none")}</SelectItem>
                              <SelectItem value="percentage">{t("customers.discountTypes.percentage")}</SelectItem>
                              <SelectItem value="fixed">{t("customers.discountTypes.fixed")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="discountValue">
                            {t("customers.discount")} {formData.discount_type === "percentage" ? "%" : "$"}
                          </Label>
                          <Input
                            id="discountValue"
                            type="number"
                            step="0.01"
                            placeholder="0"
                            value={formData.discount_value}
                            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                            disabled={formData.discount_type === "none"}
                            className="backdrop-blur-sm bg-white/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="grid gap-2 pt-4 border-t border-neutral-200/50">
                      <Label htmlFor="notes">{t("customers.notes")}</Label>
                      <textarea
                        id="notes"
                        className="flex min-h-[60px] w-full rounded-md border border-input backdrop-blur-sm bg-white/50 px-3 py-2 text-sm"
                        placeholder={t("customers.notesPlaceholder")}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        resetForm()
                      }}
                      disabled={isCreating}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit" className="bg-neutral-900 hover:bg-neutral-800" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {editingCustomer ? t("customers.updating") : t("customers.creating")}
                        </>
                      ) : (
                        <>{editingCustomer ? t("customers.updateCustomer") : t("customers.createCustomer")}</>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base text-neutral-600">{t("customers.stats.totalCustomers")}</p>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900 truncate">
                  {dashboardStats.total_customers}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shrink-0">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base text-neutral-600">{t("customers.stats.totalRevenue")}</p>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900 truncate">
                  ${formatNumber(dashboardStats.total_revenue)}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base text-neutral-600">{t("customers.stats.avgCustomerValue")}</p>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900 truncate">
                  ${formatNumber(dashboardStats.avg_customer_value)}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4 sm:mb-6 items-stretch sm:items-center">
          <GlassCard className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder={t("customers.searchPlaceholder")}
                className="pl-10 backdrop-blur-sm bg-white/50 border-0"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(0)
                }}
              />
            </div>
          </GlassCard>
          <div className="flex gap-2 justify-center sm:justify-start">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-neutral-900" : ""}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-neutral-900" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading && (
          <GlassCard>
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">{t("customers.loading")}</p>
            </div>
          </GlassCard>
        )}

        {error && (
          <GlassCard>
            <div className="text-center py-12">
              <p className="text-red-600">
                {t("common.error")}: {error}
              </p>
            </div>
          </GlassCard>
        )}

        {!loading && !error && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 grid-auto-rows-fr">
                {customers.length === 0 ? (
                  <div className="col-span-full">
                    <GlassCard>
                      <div className="text-center py-12 text-neutral-600">
                        {searchTerm ? t("customers.noResults") : t("customers.noCustomers")}
                      </div>
                    </GlassCard>
                  </div>
                ) : (
                  customers.map((customer, index) => (
                    <motion.div
                      key={customer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="h-full"
                    >
                      <GlassCard className="hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                        <div className="space-y-4 flex-1 flex flex-col">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors break-words flex-1">
                                {customer.name}
                              </h3>
                              {getCustomerTypeBadge(customer.customer_type || "regular")}
                            </div>

                            {customer.email && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{customer.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                            <div>
                              <p className="text-xs sm:text-sm text-neutral-600">{t("customers.orders")}</p>
                              <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                                {customer.stats?.total_purchases || 0}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs sm:text-sm text-neutral-600">{t("customers.totalSpent")}</p>
                              <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                                ${(customer.stats?.total_spent || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-neutral-200 justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                    onClick={() => {
                                      setSelectedCustomer(customer)
                                      setDetailsOpen(true)
                                    }}
                                  >
                                    <Eye className="w-4 h-4 text-neutral-600" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("customers.viewDetails")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                    onClick={() => handleEdit(customer)}
                                  >
                                    <Edit className="w-4 h-4 text-neutral-600" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("customers.editCustomer")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    onClick={() => setDeleteConfirm({ id: customer.id, name: customer.name })}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("customers.deleteCustomer")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <GlassCard>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left p-4 text-sm font-semibold text-neutral-700">{t("customers.name")}</th>
                        <th className="text-left p-4 text-sm font-semibold text-neutral-700">{t("customers.type")}</th>
                        <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                          {t("customers.contact")}
                        </th>
                        <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                          {t("customers.orders")}
                        </th>
                        <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                          {t("customers.totalSpent")}
                        </th>
                        <th className="text-right p-4 text-sm font-semibold text-neutral-700">
                          {t("customers.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-neutral-600">
                            {searchTerm ? t("customers.noResults") : t("customers.noCustomers")}
                          </td>
                        </tr>
                      ) : (
                        customers.map((customer) => (
                          <tr
                            key={customer.id}
                            className="border-b border-neutral-100 hover:bg-black hover:text-white transition-colors group"
                          >
                            <td className="p-4">
                              <div className="font-semibold">{customer.name}</div>
                            </td>
                            <td className="p-4">{getCustomerTypeBadge(customer.customer_type || "regular")}</td>
                            <td className="p-4">
                              <div className="space-y-1 text-sm">
                                {customer.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate max-w-[200px]">{customer.email}</span>
                                  </div>
                                )}
                                {customer.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    <span>{customer.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-right font-semibold">{customer.stats?.total_purchases || 0}</td>
                            <td className="p-4 text-right font-semibold">
                              ${(customer.stats?.total_spent || 0).toFixed(2)}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                                  onClick={() => {
                                    setSelectedCustomer(customer)
                                    setDetailsOpen(true)
                                  }}
                                >
                                  <Eye className="w-4 h-4 group-hover:text-white" />
                                </button>
                                <button
                                  className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                                  onClick={() => handleEdit(customer)}
                                >
                                  <Edit className="w-4 h-4 group-hover:text-white" />
                                </button>
                                <button
                                  className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                  onClick={() => setDeleteConfirm({ id: customer.id, name: customer.name })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </>
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

      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="sm:max-w-[600px] backdrop-blur-xl bg-white/95 border border-neutral-200/50">
          <DialogHeader>
            <DialogTitle>{t("customers.tutorial.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t("customers.tutorial.typesTitle")}
              </h4>
              <ul className="text-sm text-neutral-600 space-y-1 ml-6 list-disc">
                <li>
                  <strong>{t("customers.types.regular")}:</strong> {t("customers.tutorial.regularDesc")}
                </li>
                <li>
                  <strong>{t("customers.types.vip")}:</strong> {t("customers.tutorial.vipDesc")}
                </li>
                <li>
                  <strong>{t("customers.types.wholesale")}:</strong> {t("customers.tutorial.wholesaleDesc")}
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {t("customers.tutorial.discountTitle")}
              </h4>
              <ul className="text-sm text-neutral-600 space-y-1 ml-6 list-disc">
                <li>
                  <strong>{t("customers.discountTypes.none")}:</strong> {t("customers.tutorial.noneDesc")}
                </li>
                <li>
                  <strong>{t("customers.discountTypes.percentage")}:</strong> {t("customers.tutorial.percentageDesc")}
                </li>
                <li>
                  <strong>{t("customers.discountTypes.fixed")}:</strong> {t("customers.tutorial.fixedDesc")}
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t("customers.tutorial.creditTitle")}
              </h4>
              <p className="text-sm text-neutral-600 ml-6">{t("customers.tutorial.creditDesc")}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {t("customers.tutorial.requiredTitle")}
              </h4>
              <ul className="text-sm text-neutral-600 space-y-1 ml-6 list-disc">
                <li>
                  <strong>{t("customers.fullName")}:</strong> {t("customers.tutorial.nameRequired")}
                </li>
                <li>
                  <strong>{t("customers.tutorial.emailOrPhone")}:</strong> {t("customers.tutorial.contactRequired")}
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("customers.deleteCustomer")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("customers.deleteConfirm")} <strong>{deleteConfirm?.name}</strong>? {t("customers.deleteWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
