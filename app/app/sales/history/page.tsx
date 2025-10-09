"use client"
import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Eye,
  Plus,
  X,
  Loader2,
  MessageCircle,
  Filter,
  Search,
  Share2,
  User,
  Package,
  CreditCard,
  Wallet,
  Calendar,
  HelpCircle,
  ImageIcon,
} from "lucide-react"
import { FiList as List, FiGrid as Grid } from "react-icons/fi"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useSales } from "@/hooks/useSales"
import { useCustomers } from "@/hooks/useCustomers"
import { useProducts } from "@/hooks/useProducts"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { SaleDetailsModal } from "@/components/sales/SaleDetailsModal"
import { InstallmentHelpDialog } from "@/components/sales/InstallmentHelpDialog"
import { ShareInvoiceModal } from "@/components/sales/ShareInvoiceModal"
import { Notification } from "@/components/ui/notification"
import { SalesGrid } from "@/components/sales/SalesGrid"
import { useTranslation } from "@/hooks/useTranslation"
import { formatCompactNumber, formatCurrency } from "@/lib/format"

interface CartItem {
  product_id: string
  product_name: string
  product_image?: string
  quantity: number
  unit_price: number
  subtotal: number
}

export default function SalesHistoryPage() {
  const { t } = useTranslation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [paymentType, setPaymentType] = useState<"cash" | "credit" | "debit" | "transfer">("cash")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [installmentCount, setInstallmentCount] = useState(3)
  const [installmentError, setInstallmentError] = useState("")
  const [firstDueDate, setFirstDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  const [notification, setNotification] = useState<{
    open: boolean
    type: "success" | "error"
    title: string
    content: string
  }>({
    open: false,
    type: "success",
    title: "",
    content: "",
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [statusFilters, setStatusFilters] = useState<string[]>(["paid", "pending", "partial", "cancelled"])
  const [paymentFilters, setPaymentFilters] = useState<string[]>(["cash", "credit", "debit", "transfer"])
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>("all")

  const { sales, loading, createSale } = useSales()
  const { customers } = useCustomers()
  const { products } = useProducts()
  const { toast } = useToast()

  const [viewMode, setViewMode] = useState<"table" | "grid">(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("salesViewMode")
      return (saved as "table" | "grid") || "table"
    }
    return "table"
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("salesViewMode", viewMode)
    }
  }, [viewMode])

  const [statModalOpen, setStatModalOpen] = useState(false)
  const [selectedStat, setSelectedStat] = useState<{ label: string; value: number } | null>(null)

  const filteredSales = useMemo(() => {
    return sales.filter((sale: any) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesCustomer = sale.customers?.name?.toLowerCase().includes(query)
        const matchesSaleNumber = sale.sale_number?.toLowerCase().includes(query)
        const matchesAmount = sale.total_amount.toString().includes(query)
        if (!matchesCustomer && !matchesSaleNumber && !matchesAmount) return false
      }

      // Date range filter
      if (dateFrom) {
        const saleDate = new Date(sale.sale_date)
        const fromDate = new Date(dateFrom)
        if (saleDate < fromDate) return false
      }
      if (dateTo) {
        const saleDate = new Date(sale.sale_date)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999) // Include the entire day
        if (saleDate > toDate) return false
      }

      // Status filter
      if (!statusFilters.includes(sale.status)) return false

      // Payment type filter
      if (!paymentFilters.includes(sale.payment_type)) return false

      // Customer filter - updated to check for "all"
      if (selectedCustomerFilter && selectedCustomerFilter !== "all" && sale.customer_id !== selectedCustomerFilter)
        return false

      return true
    })
  }, [sales, searchQuery, dateFrom, dateTo, statusFilters, paymentFilters, selectedCustomerFilter])

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const totalOrders = filteredSales.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0) +
    (statusFilters.length < 4 ? 1 : 0) +
    (paymentFilters.length < 4 ? 1 : 0) +
    (selectedCustomerFilter && selectedCustomerFilter !== "all" ? 1 : 0)

  const clearAllFilters = () => {
    setSearchQuery("")
    setDateFrom("")
    setDateTo("")
    setStatusFilters(["paid", "pending", "partial", "cancelled"])
    setPaymentFilters(["cash", "credit", "debit", "transfer"])
    setSelectedCustomerFilter("all")
  }

  const handleAddToCart = () => {
    if (!selectedProduct) return

    const qty = Number.parseInt(quantity) || 0
    if (qty <= 0) {
      setNotification({
        open: true,
        type: "error",
        title: "Invalid Quantity",
        content: "Please enter a valid quantity greater than 0",
      })
      return
    }

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    const existingItem = cart.find((item) => item.product_id === selectedProduct)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === selectedProduct
            ? {
                ...item,
                quantity: item.quantity + qty,
                subtotal: (item.quantity + qty) * item.unit_price,
              }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_url,
          quantity: qty,
          unit_price: product.price,
          subtotal: qty * product.price,
        },
      ])
    }

    setSelectedProduct("")
    setQuantity("1")
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId))
  }

  const handleUpdateQuantity = (productId: string, newQuantity: string) => {
    const qty = Number.parseInt(newQuantity) || 0
    if (qty <= 0) return

    setCart(
      cart.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity: qty,
              subtotal: qty * item.unit_price,
            }
          : item,
      ),
    )
  }

  const resetForm = () => {
    setCart([])
    setSelectedCustomer("")
    setPaymentType("cash")
    setNotes("")
    setFirstDueDate("")
    setQuantity("1")
    setSelectedProduct("")
    setInstallmentCount(3)
    setInstallmentError("")
  }

  const handleCreateSale = async () => {
    if (!selectedCustomer) {
      setNotification({
        open: true,
        type: "error",
        title: "Customer Required",
        content: "Please select a customer before creating a sale",
      })
      return
    }

    if (cart.length === 0) {
      setNotification({
        open: true,
        type: "error",
        title: "Cart is Empty",
        content: "Please add at least one product to the cart",
      })
      return
    }

    if (paymentType === "credit" && (!firstDueDate || installmentCount < 1)) {
      setNotification({
        open: true,
        type: "error",
        title: "Invalid Installment Details",
        content: "Please set a valid first installment due date and ensure at least 1 installment.",
      })
      return
    }

    setIsCreating(true)

    try {
      const { data, error } = await createSale({
        customer_id: selectedCustomer,
        items: cart,
        payment_type: paymentType,
        notes,
        installments:
          paymentType === "credit"
            ? {
                count: installmentCount,
                first_due_date: firstDueDate,
              }
            : undefined,
      })

      if (error) throw new Error(error)

      setNotification({
        open: true,
        type: "success",
        title: "Sale Created Successfully!",
        content: `Sale has been recorded with ${cart.length} item(s) for $${totalAmount.toFixed(2)}`,
      })

      // Reset form
      resetForm()
      setIsCreateDialogOpen(false)
    } catch (err: any) {
      setNotification({
        open: true,
        type: "error",
        title: "Failed to Create Sale",
        content: err.message || "An error occurred while creating the sale. Please try again.",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const openWhatsApp = (phone: string, customerName: string) => {
    // Remove any non-numeric characters from phone
    const cleanPhone = phone.replace(/\D/g, "")
    const message = encodeURIComponent(`Hola ${customerName}, te recordamos que tienes un pago pendiente.`)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank")
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0)

  const [selectedSale, setSelectedSale] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [saleToShare, setSaleToShare] = useState<any | null>(null)

  const handleShareInvoice = (sale: any) => {
    if (!sale.public_token) {
      toast({
        title: "Invoice not available",
        description: "This sale does not have a public invoice link",
        variant: "destructive",
      })
      return
    }
    setSaleToShare(sale)
    setShareModalOpen(true)
  }

  const isCustomerSelected = selectedCustomer && selectedCustomer !== ""
  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Notification
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        type={notification.type}
        title={notification.title}
        content={notification.content}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900">
              {t("sales.title")} <span className="italic font-light text-neutral-600">{t("sales.subtitle")}</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">{t("sales.description")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <InstallmentHelpDialog />

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open)
                if (!open) {
                  resetForm()
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-neutral-900 hover:bg-neutral-800 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("sales.newSale")}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] flex flex-col p-4 sm:p-6">
                <DialogHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-lg sm:text-xl">{t("sales.createNewSale")}</DialogTitle>
                      <DialogDescription className="text-xs sm:text-sm">
                        {t("sales.addProductsComplete")}
                      </DialogDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTutorial(true)}
                      className="gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 flex-shrink-0"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">{t("sales.tutorial")}</span>
                    </Button>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-1">
                  <div className="grid gap-4 sm:gap-6 py-4">
                    <motion.div
                      className="grid gap-2 relative"
                      animate={{
                        boxShadow: !isCustomerSelected
                          ? "0 0 0 3px rgba(59, 130, 246, 0.3)"
                          : "0 0 0 0px rgba(59, 130, 246, 0)",
                      }}
                      transition={{ duration: 0.3 }}
                      style={{
                        borderRadius: "0.5rem",
                        padding: "0.75rem",
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      <Label className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                        <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg" />
                          <div className="absolute inset-0 bg-black rounded-lg" />
                          <User className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 text-white" />
                        </div>
                        {t("sales.customer")} <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid gap-3">
                        <SearchableSelect
                          items={customers}
                          value={selectedCustomer}
                          onValueChange={setSelectedCustomer}
                          placeholder={t("sales.selectCustomer")}
                          searchPlaceholder={t("common.search")}
                          emptyMessage={t("customers.noCustomers")}
                          getItemId={(customer) => customer.id}
                          getItemSearchText={(customer) =>
                            `${customer.name} ${customer.email || ""} ${customer.phone || ""}`
                          }
                          renderItem={(customer) => (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{customer.name}</p>
                                <p className="text-xs text-neutral-500 truncate">{customer.email || customer.phone}</p>
                              </div>
                            </div>
                          )}
                          renderSelectedPreview={(customer) => (
                            <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-black to-white/20 flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0">
                                  {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="font-semibold text-sm sm:text-base truncate">{customer.name}</p>
                                    <Badge
                                      className={`text-xs flex-shrink-0 ${
                                        customer.customer_type === "vip"
                                          ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                                          : customer.customer_type === "wholesale"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-400 text-white"
                                      }`}
                                    >
                                      {customer.customer_type?.toUpperCase() || "REGULAR"}
                                    </Badge>
                                  </div>
                                  {customer.email && (
                                    <p className="text-xs sm:text-sm text-neutral-600 truncate">{customer.email}</p>
                                  )}
                                  {customer.phone && (
                                    <p className="text-xs sm:text-sm text-neutral-600">{customer.phone}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        />
                      </div>
                    </motion.div>

                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-3 sm:p-4 bg-neutral-50">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg" />
                          <div className="absolute inset-0 bg-black rounded-lg" />
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 text-white" />
                        </div>
                        {t("sales.addProducts")}
                      </h3>
                      <div className="flex flex-col sm:grid sm:grid-cols-[1fr_100px_auto] gap-2">
                        <SearchableSelect
                          items={products}
                          value={selectedProduct}
                          onValueChange={setSelectedProduct}
                          placeholder={t("sales.selectProduct")}
                          searchPlaceholder={t("common.search")}
                          emptyMessage={t("products.noProducts")}
                          getItemId={(product) => product.id}
                          getItemSearchText={(product) => `${product.name} ${product.sku || ""}`}
                          renderItem={(product) => (
                            <div className="flex items-center gap-2 sm:gap-3">
                              {product.image_url ? (
                                <img
                                  src={product.image_url || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-gradient-to-br from-black to-white flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{product.name}</p>
                                <p className="text-xs text-neutral-500">
                                  ${product.price} • Stock: {product.stock_quantity}
                                </p>
                              </div>
                            </div>
                          )}
                        />
                        <div className="flex gap-2 sm:contents">
                          <Input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder={t("sales.qty")}
                            className="h-10 flex-1 sm:flex-none"
                          />
                          <Button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!selectedProduct || !quantity || Number.parseInt(quantity) <= 0}
                            className="h-10 bg-neutral-900 hover:bg-neutral-800 px-4 sm:px-3"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="sm:hidden ml-2">{t("common.add")}</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {cart.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border rounded-lg p-4 bg-white shadow-sm"
                        >
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-green-600" />
                            {t("sales.cartItems")} ({cart.length})
                          </h3>
                          <div className="space-y-2">
                            {cart.map((item) => (
                              <motion.div
                                key={item.product_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                              >
                                {item.product_image ? (
                                  <img
                                    src={item.product_image || "/placeholder.svg"}
                                    alt={item.product_name}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded bg-gradient-to-br from-black to-neutral-600 flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="w-6 h-6 text-white" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{item.product_name}</p>
                                  <p className="text-xs text-neutral-600">${item.unit_price.toFixed(2)} each</p>
                                </div>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateQuantity(item.product_id, e.target.value)}
                                  className="w-20 h-9"
                                />
                                <div className="flex items-center gap-3">
                                  <p className="font-semibold text-sm whitespace-nowrap">${item.subtotal.toFixed(2)}</p>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFromCart(item.product_id)}
                                    className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                            <div className="flex justify-between items-center pt-3 border-t-2 border-neutral-200 font-bold text-lg">
                              <span>{t("sales.total")}:</span>
                              <span className="text-green-600">${totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2 text-base font-semibold">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg" />
                          <div className="absolute inset-0 bg-black rounded-lg" />
                          <CreditCard className="w-5 h-5 relative z-10 text-white" />
                        </div>
                        {t("sales.paymentMethod")}
                      </Label>
                      <Select value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-green-600" />
                              <span>{t("sales.cash")}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="credit">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span>{t("sales.credit")}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="debit" disabled>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-purple-400" />
                              <span className="text-neutral-400">{t("sales.debitCard")}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="transfer" disabled>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-orange-400" />
                              <span className="text-neutral-400">{t("sales.bankTransfer")}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Installments (if credit) */}
                    {paymentType === "credit" && (
                      <div className="border rounded-lg p-3 sm:p-4 bg-blue-50">
                        <h3 className="font-semibold mb-3 text-sm sm:text-base">{t("sales.installmentDetails")}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="grid gap-2">
                            <Label className="text-sm">{t("sales.numberOfInstallments")}</Label>
                            <Input
                              type="number"
                              min="1"
                              value={installmentCount === 0 ? "" : installmentCount}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === "") {
                                  setInstallmentCount(0)
                                  setInstallmentError(t("sales.installmentMinError"))
                                } else {
                                  const num = Number.parseInt(value)
                                  setInstallmentCount(num)
                                  if (num < 1) {
                                    setInstallmentError(t("sales.installmentMinError"))
                                  } else {
                                    setInstallmentError("")
                                  }
                                }
                              }}
                              className={installmentError ? "border-red-500" : ""}
                            />
                            {installmentError && <p className="text-xs text-red-600">{installmentError}</p>}
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-sm">{t("sales.firstDueDate")}</Label>
                            <Input
                              type="date"
                              value={firstDueDate}
                              onChange={(e) => setFirstDueDate(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        {installmentCount >= 1 && (
                          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
                            {t("sales.eachInstallment")}: ${(totalAmount / installmentCount).toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    <div className="grid gap-2">
                      <Label>{t("sales.notes")}</Label>
                      <textarea
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder={t("sales.addNotes")}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsCreateDialogOpen(false)
                    }}
                    disabled={isCreating}
                    className="w-full sm:w-auto"
                  >
                    {t("sales.cancel")}
                  </Button>
                  <Button
                    onClick={handleCreateSale}
                    className="bg-neutral-900 hover:bg-neutral-800 w-full sm:w-auto"
                    disabled={isCreating || cart.length === 0 || !selectedCustomer}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("sales.creating")}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {t("sales.completeSale")}
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              {t("sales.export")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <GlassCard
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => {
              setSelectedStat({ label: t("sales.totalRevenue"), value: totalRevenue })
              setStatModalOpen(true)
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-neutral-600">{t("sales.totalRevenue")}</p>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900 truncate">
                  ${formatCompactNumber(totalRevenue)}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => {
              setSelectedStat({ label: t("sales.totalOrders"), value: totalOrders })
              setStatModalOpen(true)
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-neutral-600">{t("sales.totalOrders")}</p>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900 truncate">{totalOrders}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => {
              setSelectedStat({ label: t("sales.avgOrderValue"), value: avgOrderValue })
              setStatModalOpen(true)
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-neutral-600">{t("sales.avgOrderValue")}</p>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900 truncate">
                  ${formatCompactNumber(avgOrderValue)}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder={t("sales.searchPlaceholder")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("table")}
                className={`transition-all duration-300 ${
                  viewMode === "table"
                    ? "bg-neutral-900 text-white hover:bg-neutral-900 hover:text-white border-neutral-900"
                    : "hover:bg-neutral-900 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={`transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-neutral-900 text-white hover:bg-neutral-900 hover:text-white border-neutral-900"
                    : "hover:bg-neutral-900 hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-initial bg-transparent hover:bg-neutral-100">
                    <Filter className="w-4 h-4 mr-2" />
                    <span className="sm:inline">{t("common.filter")}</span>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>{t("sales.filters")}</DialogTitle>
                    <DialogDescription>Set your preferred filters to narrow down the sales list</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 overflow-y-auto flex-1">
                    <div className="space-y-2">
                      <Label>{t("sales.fromDate")}</Label>
                      <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("sales.toDate")}</Label>
                      <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("sales.customer")}</Label>
                      <Select value={selectedCustomerFilter} onValueChange={setSelectedCustomerFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("sales.allCustomers")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("sales.allCustomers")}</SelectItem>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("sales.statusFilter")}</Label>
                      <div className="flex flex-wrap gap-2">
                        {["paid", "pending", "partial", "cancelled"].map((status) => (
                          <Button
                            key={status}
                            variant={statusFilters.includes(status) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setStatusFilters(
                                statusFilters.includes(status)
                                  ? statusFilters.filter((s) => s !== status)
                                  : [...statusFilters, status],
                              )
                            }}
                            className={
                              statusFilters.includes(status)
                                ? "bg-neutral-900 hover:bg-neutral-800"
                                : "hover:bg-neutral-100"
                            }
                          >
                            {t(`sales.status.${status}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("sales.paymentTypeFilter")}</Label>
                      <div className="flex flex-wrap gap-2">
                        {["cash", "credit"].map((payment) => (
                          <Button
                            key={payment}
                            variant={paymentFilters.includes(payment) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setPaymentFilters(
                                paymentFilters.includes(payment)
                                  ? paymentFilters.filter((p) => p !== payment)
                                  : [...paymentFilters, payment],
                              )
                            }}
                            className={
                              paymentFilters.includes(payment)
                                ? "bg-neutral-900 hover:bg-neutral-800"
                                : "hover:bg-neutral-100"
                            }
                          >
                            {t(`sales.paymentType.${payment}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    {activeFiltersCount > 0 && (
                      <Button variant="outline" onClick={clearAllFilters}>
                        {t("sales.clearAll")}
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b border-neutral-100">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32 flex-1" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">
              {sales.length === 0 ? t("sales.noSales") : t("sales.noSalesMatch")}
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        {t("sales.date")}
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        {t("sales.customer")}
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        {t("sales.items")}
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        {t("sales.amount")}
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        {t("sales.payment")}
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        {t("sales.statusLabel")}
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        {t("sales.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale: any, index) => (
                      <motion.tr
                        key={sale.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          setSelectedSale(sale)
                          setDetailsOpen(true)
                        }}
                        className="border-b border-neutral-100 hover:bg-neutral-900 group transition-all duration-300 cursor-pointer"
                      >
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-300 transition-colors whitespace-nowrap">
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 font-medium text-xs sm:text-sm text-neutral-900 group-hover:text-white transition-colors whitespace-nowrap">
                          {sale.customers?.name || t("sales.walkIn")}
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-300 transition-colors whitespace-nowrap">
                          {sale.sale_items?.length || 0} {t("sales.items")}
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-neutral-900 group-hover:text-white transition-colors whitespace-nowrap">
                          ${sale.total_amount.toFixed(2)}
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-300 transition-colors whitespace-nowrap capitalize">
                          {t(`sales.paymentType.${sale.payment_type}`)}
                          {sale.payment_type === "credit" && sale.paid_installments !== undefined && (
                            <span className="block text-xs text-neutral-500 group-hover:text-neutral-400">
                              {sale.paid_installments}/{sale.total_installments} {t("sales.status.paid")}
                            </span>
                          )}
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                              sale.status === "paid"
                                ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                                : sale.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700 group-hover:bg-yellow-200"
                                  : sale.status === "partial"
                                    ? "bg-blue-100 text-blue-700 group-hover:bg-blue-200"
                                    : "bg-red-100 text-red-700 group-hover:bg-red-200"
                            }`}
                          >
                            {t(`sales.status.${sale.status}`)}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 sm:p-2 hover:bg-neutral-800 rounded-lg transition-colors group-hover:text-white">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShareInvoice(sale)
                              }}
                              className="p-1.5 sm:p-2 hover:bg-blue-600 rounded-lg transition-colors text-blue-600 hover:text-white"
                              title="Share Invoice"
                            >
                              <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            {sale.payment_type === "credit" && sale.customers?.phone && sale.status !== "paid" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openWhatsApp(sale.customers.phone, sale.customers.name)
                                }}
                                className="p-1.5 sm:p-2 hover:bg-green-600 rounded-lg transition-colors text-green-600 hover:text-white"
                                title="Contact via WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <SalesGrid
              sales={filteredSales}
              onViewDetails={(sale) => {
                setSelectedSale(sale)
                setDetailsOpen(true)
              }}
              onShareInvoice={handleShareInvoice}
              onOpenWhatsApp={openWhatsApp}
              t={t}
            />
          )}
        </GlassCard>
      </motion.div>

      <Dialog open={statModalOpen} onOpenChange={setStatModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{selectedStat?.label}</DialogTitle>
            <DialogDescription>Complete value details</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-2">Exact Amount</p>
              <p className="text-4xl font-bold text-neutral-900">
                {selectedStat?.label.includes("Order") && !selectedStat?.label.includes("Value")
                  ? selectedStat?.value
                  : formatCurrency(selectedStat?.value || 0)}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SaleDetailsModal
        sale={selectedSale}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false)
          setSelectedSale(null)
        }}
      />

      {saleToShare && (
        <ShareInvoiceModal
          publicToken={saleToShare.public_token}
          saleNumber={saleToShare.sale_number}
          open={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false)
            setSaleToShare(null)
          }}
        />
      )}
    </div>
  )
}
