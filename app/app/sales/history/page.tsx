"use client"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
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
  ChevronDown,
  Share2,
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSales } from "@/hooks/useSales"
import { useCustomers } from "@/hooks/useCustomers"
import { useProducts } from "@/hooks/useProducts"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { SaleDetailsModal } from "@/components/sales/SaleDetailsModal"
import { InstallmentHelpDialog } from "@/components/sales/InstallmentHelpDialog"
import { ShareInvoiceModal } from "@/components/sales/ShareInvoiceModal"

interface CartItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export default function SalesHistoryPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("none")
  const [paymentType, setPaymentType] = useState<"cash" | "credit" | "debit" | "transfer">("cash")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [installmentCount, setInstallmentCount] = useState(3)
  const [firstDueDate, setFirstDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [isCreating, setIsCreating] = useState(false)

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

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    const existingItem = cart.find((item) => item.product_id === selectedProduct)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === selectedProduct
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.unit_price,
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
          quantity,
          unit_price: product.price,
          subtotal: quantity * product.price,
        },
      ])
    }

    setSelectedProduct("")
    setQuantity(1)
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId))
  }

  const handleCreateSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add products to cart before creating a sale",
        variant: "destructive",
      })
      return
    }

    if (paymentType === "credit" && !firstDueDate) {
      toast({
        title: "Missing due date",
        description: "Please set the first installment due date",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const { data, error } = await createSale({
        customer_id: selectedCustomer || undefined,
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

      toast({
        title: "Sale created!",
        description: `Sale has been recorded successfully`,
      })

      // Reset form
      setCart([])
      setSelectedCustomer("none")
      setPaymentType("cash")
      setNotes("")
      setFirstDueDate("")
      setIsCreateDialogOpen(false)
    } catch (err: any) {
      toast({
        title: "Error creating sale",
        description: err.message || "Failed to create sale",
        variant: "destructive",
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Link copied!",
        description: "Invoice link has been copied to clipboard",
      })
    })
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900">
              Sales <span className="italic font-light text-neutral-600">History</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">View and manage all your sales transactions</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <InstallmentHelpDialog />

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-neutral-900 hover:bg-neutral-800 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  New Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Create New Sale</DialogTitle>
                  <DialogDescription>Add products and complete the sale</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-1">
                  <div className="grid gap-4 py-4">
                    {/* Customer Selection */}
                    <div className="grid gap-2">
                      <Label>Customer (Optional)</Label>
                      <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Walk-in Customer</SelectItem>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Product Selection */}
                    <div className="border rounded-lg p-4 bg-neutral-50">
                      <h3 className="font-semibold mb-3">Add Products</h3>
                      <div className="grid grid-cols-[1fr_100px_auto] gap-2">
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ${product.price} (Stock: {product.stock_quantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                          placeholder="Qty"
                        />
                        <Button type="button" onClick={handleAddToCart} disabled={!selectedProduct}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Cart */}
                    {cart.length > 0 && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">Cart Items</h3>
                        <div className="space-y-2">
                          {cart.map((item) => (
                            <div
                              key={item.product_id}
                              className="flex items-center justify-between p-2 bg-neutral-50 rounded"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.product_name}</p>
                                <p className="text-xs text-neutral-600">
                                  {item.quantity} x ${item.unit_price.toFixed(2)}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromCart(item.product_id)}
                                  className="p-1 hover:bg-red-100 rounded text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
                            <span>Total:</span>
                            <span>${totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Method */}
                    <div className="grid gap-2">
                      <Label>Payment Method</Label>
                      <Select value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="credit">Credit (Installments)</SelectItem>
                          <SelectItem value="debit">Debit Card</SelectItem>
                          <SelectItem value="transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Installments (if credit) */}
                    {paymentType === "credit" && (
                      <div className="border rounded-lg p-4 bg-blue-50">
                        <h3 className="font-semibold mb-3">Installment Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Number of Installments</Label>
                            <Input
                              type="number"
                              min="2"
                              value={installmentCount}
                              onChange={(e) => setInstallmentCount(Number.parseInt(e.target.value) || 2)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>First Due Date</Label>
                            <Input
                              type="date"
                              value={firstDueDate}
                              onChange={(e) => setFirstDueDate(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 mt-2">
                          Each installment: ${(totalAmount / installmentCount).toFixed(2)}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="grid gap-2">
                      <Label>Notes (Optional)</Label>
                      <textarea
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Add any notes about this sale"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSale}
                    className="bg-neutral-900 hover:bg-neutral-800"
                    disabled={isCreating || cart.length === 0}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Complete Sale"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base text-neutral-600">Total Orders</p>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">{totalOrders}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-base text-neutral-600">Avg. Order Value</p>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">${avgOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount} active
                  </Badge>
                )}
              </h3>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear all
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-600">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    placeholder="Customer, amount..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-600">From Date</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-600">To Date</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>

              {/* Customer Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-600">Customer</Label>
                <Select value={selectedCustomerFilter} onValueChange={setSelectedCustomerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All customers</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    Status
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes("paid")}
                    onCheckedChange={(checked) => {
                      setStatusFilters(checked ? [...statusFilters, "paid"] : statusFilters.filter((s) => s !== "paid"))
                    }}
                  >
                    Paid
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes("pending")}
                    onCheckedChange={(checked) => {
                      setStatusFilters(
                        checked ? [...statusFilters, "pending"] : statusFilters.filter((s) => s !== "pending"),
                      )
                    }}
                  >
                    Pending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes("partial")}
                    onCheckedChange={(checked) => {
                      setStatusFilters(
                        checked ? [...statusFilters, "partial"] : statusFilters.filter((s) => s !== "partial"),
                      )
                    }}
                  >
                    Partial
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes("cancelled")}
                    onCheckedChange={(checked) => {
                      setStatusFilters(
                        checked ? [...statusFilters, "cancelled"] : statusFilters.filter((s) => s !== "cancelled"),
                      )
                    }}
                  >
                    Cancelled
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Payment Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    Payment Type
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Filter by Payment</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={paymentFilters.includes("cash")}
                    onCheckedChange={(checked) => {
                      setPaymentFilters(
                        checked ? [...paymentFilters, "cash"] : paymentFilters.filter((p) => p !== "cash"),
                      )
                    }}
                  >
                    Cash
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={paymentFilters.includes("credit")}
                    onCheckedChange={(checked) => {
                      setPaymentFilters(
                        checked ? [...paymentFilters, "credit"] : paymentFilters.filter((p) => p !== "credit"),
                      )
                    }}
                  >
                    Credit
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={paymentFilters.includes("debit")}
                    onCheckedChange={(checked) => {
                      setPaymentFilters(
                        checked ? [...paymentFilters, "debit"] : paymentFilters.filter((p) => p !== "debit"),
                      )
                    }}
                  >
                    Debit
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={paymentFilters.includes("transfer")}
                    onCheckedChange={(checked) => {
                      setPaymentFilters(
                        checked ? [...paymentFilters, "transfer"] : paymentFilters.filter((p) => p !== "transfer"),
                      )
                    }}
                  >
                    Transfer
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              {sales.length === 0 ? "No sales yet. Create your first sale!" : "No sales match your filters."}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        Date
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        Customer
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        Items
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        Amount
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        Payment
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        Status
                      </th>
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap">
                        Actions
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
                          {sale.customers?.name || "Walk-in"}
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-300 transition-colors whitespace-nowrap">
                          {sale.sale_items?.length || 0} items
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm text-neutral-900 group-hover:text-white transition-colors whitespace-nowrap">
                          ${sale.total_amount.toFixed(2)}
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-300 transition-colors whitespace-nowrap capitalize">
                          {sale.payment_type}
                          {sale.payment_type === "credit" && sale.paid_installments !== undefined && (
                            <span className="block text-xs text-neutral-500 group-hover:text-neutral-400">
                              {sale.paid_installments}/{sale.total_installments} paid
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
                            {sale.status}
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
          )}
        </GlassCard>
      </motion.div>

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
