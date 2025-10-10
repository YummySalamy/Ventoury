"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { FiPlus, FiSearch, FiFilter, FiGrid, FiList, FiInfo, FiBox, FiAlertTriangle } from "react-icons/fi"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProducts } from "@/hooks/useProducts"
import { useCategories } from "@/hooks/useCategories"
import { useInventory } from "@/hooks/useInventory"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/contexts/LocaleContext"
import type { Product, InventoryStats } from "@/hooks/useProducts"
import type { ProductHistory } from "@/hooks/useInventory"

import { StatsCard } from "@/components/products/StatsCard"
import { ProductsTable } from "@/components/products/ProductsTable"
import { ProductsGrid } from "@/components/products/ProductsGrid"
import { ProductFormDialog } from "@/components/products/ProductFormDialog"
import { FilterDialog } from "@/components/products/FilterDialog"
import { TutorialDialog } from "@/components/products/TutorialDialog"
import { FormTutorialDialog } from "@/components/products/FormTutorialDialog"
import { ProductHistoryDialog } from "@/components/products/ProductHistoryDialog"

export default function ProductsPage() {
  const { t } = useLocale()
  const { toast } = useToast()
  const { searchProducts, createProduct, updateProduct, deleteProduct, getInventoryStats } = useProducts()
  const { categories } = useCategories()
  const { getProductHistory } = useInventory()

  const [viewMode, setViewMode] = useState<"table" | "grid">(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("productsViewMode")
      return (saved as "table" | "grid") || "list"
    }
    return "list"
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("productsViewMode", viewMode)
    }
  }, [viewMode])

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [isFormTutorialOpen, setIsFormTutorialOpen] = useState(false)

  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [productHistory, setProductHistory] = useState<ProductHistory[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Loading states
  const [statsLoading, setStatsLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 30

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    category: null as string | null,
    stockFilter: "all" as "all" | "in_stock" | "out_of_stock" | "low_stock",
    dateFrom: null as string | null,
    dateTo: null as string | null,
    customFields: {} as Record<string, string>,
  })

  const [appliedFilters, setAppliedFilters] = useState(filters)

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    cost_price: "",
    wholesale_price: "",
    retail_price: "",
    price: "",
    stock_quantity: "",
    min_stock_alert: "5",
    max_stock_target: "",
    description: "",
    show_in_marketplace: false,
    custom_data: {} as Record<string, any>,
  })

  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [suggestedPrices, setSuggestedPrices] = useState<{ margin: number; price: number }[]>([])

  useEffect(() => {
    if (formData.cost_price && Number.parseFloat(formData.cost_price) > 0) {
      const cost = Number.parseFloat(formData.cost_price)
      setSuggestedPrices([
        { margin: 20, price: cost * 1.2 },
        { margin: 50, price: cost * 1.5 },
        { margin: 100, price: cost * 2 },
      ])
    } else {
      setSuggestedPrices([])
    }
  }, [formData.cost_price])

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true)
      const { data, error } = await getInventoryStats()
      if (!error && data) {
        setStats(data)
      }
      setStatsLoading(false)
    }
    fetchStats()
  }, [getInventoryStats])

  const fetchProductsWithFilters = useCallback(
    async (reset = false) => {
      setProductsLoading(true)
      const offset = reset ? 0 : currentPage * ITEMS_PER_PAGE

      const { data, error } = await searchProducts({
        search: appliedFilters.search || undefined,
        category: appliedFilters.category || undefined,
        stockFilter: appliedFilters.stockFilter,
        dateFrom: appliedFilters.dateFrom || undefined,
        dateTo: appliedFilters.dateTo || undefined,
        offset,
        limit: ITEMS_PER_PAGE,
      })

      if (!error && data) {
        if (reset) {
          setProducts(data.products)
          setCurrentPage(0)
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id))
            const newProducts = data.products.filter((p) => !existingIds.has(p.id))
            return [...prev, ...newProducts]
          })
        }
        setTotalCount(data.total_count)
        setHasMore(data.products.length === ITEMS_PER_PAGE)
      }

      setProductsLoading(false)
    },
    [appliedFilters, currentPage, searchProducts],
  )

  useEffect(() => {
    const debounce = setTimeout(() => {
      setAppliedFilters((prev) => ({ ...prev, search: filters.search }))
    }, 300)
    return () => clearTimeout(debounce)
  }, [filters.search])

  useEffect(() => {
    fetchProductsWithFilters(true)
  }, [appliedFilters])

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    setCurrentPage((prev) => prev + 1)
    await fetchProductsWithFilters(false)
    setIsLoadingMore(false)
  }

  const generateSKU = () => {
    const prefix =
      formData.name
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, "") || "PRD"
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t("products.fileTooLarge"),
          description: t("products.fileTooLargeDesc"),
          variant: "destructive",
        })
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      category_id: "",
      cost_price: "",
      wholesale_price: "",
      retail_price: "",
      price: "",
      stock_quantity: "",
      min_stock_alert: "5",
      max_stock_target: "",
      description: "",
      show_in_marketplace: false,
      custom_data: {},
    })
    setCustomFields([])
    setImageFile(null)
    setImagePreview(null)
    setSuggestedPrices([])
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.sku) {
      toast({
        title: t("products.validationError"),
        description: t("products.skuRequired"),
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const customData = customFields.reduce(
        (acc, field) => {
          if (field.key && field.value) {
            acc[field.key] = field.value
          }
          return acc
        },
        {} as Record<string, any>,
      )

      const { data, error } = await createProduct(
        {
          name: formData.name,
          sku: formData.sku,
          category_id: formData.category_id || null,
          cost_price: formData.cost_price ? Number.parseFloat(formData.cost_price) : null,
          wholesale_price: formData.wholesale_price ? Number.parseFloat(formData.wholesale_price) : null,
          retail_price: formData.retail_price ? Number.parseFloat(formData.retail_price) : null,
          price: Number.parseFloat(formData.price),
          stock_quantity: Number.parseInt(formData.stock_quantity),
          min_stock_alert: formData.min_stock_alert ? Number.parseInt(formData.min_stock_alert) : 5,
          max_stock_target: formData.max_stock_target ? Number.parseInt(formData.max_stock_target) : null,
          description: formData.description,
          show_in_marketplace: formData.show_in_marketplace,
          custom_data: customData,
          is_active: true,
        },
        imageFile,
      )

      if (error) throw new Error(error)

      toast({
        title: t("products.productCreated"),
        description: `${formData.name} ${t("products.productCreatedDesc")}`,
      })

      resetForm()
      setIsCreateDialogOpen(false)
      fetchProductsWithFilters(true)
    } catch (err: any) {
      console.error("[v0] Error creating product:", err)
      toast({
        title: t("products.errorCreating"),
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id || "",
      cost_price: product.cost_price?.toString() || "",
      wholesale_price: product.wholesale_price?.toString() || "",
      retail_price: product.retail_price?.toString() || "",
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      min_stock_alert: product.min_stock_alert?.toString() || "5",
      max_stock_target: product.max_stock_target?.toString() || "",
      description: product.description || "",
      show_in_marketplace: product.show_in_marketplace || false,
      custom_data: product.custom_data || {},
    })

    if (product.custom_data) {
      const fields = Object.entries(product.custom_data).map(([key, value]) => ({
        key,
        value: String(value),
      }))
      setCustomFields(fields)
    }

    setImagePreview(product.image_url || null)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    if (!formData.sku) {
      toast({
        title: t("products.validationError"),
        description: t("products.skuRequired"),
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const customData = customFields.reduce(
        (acc, field) => {
          if (field.key && field.value) {
            acc[field.key] = field.value
          }
          return acc
        },
        {} as Record<string, any>,
      )

      const { data, error } = await updateProduct(
        editingProduct.id,
        {
          name: formData.name,
          sku: formData.sku,
          category_id: formData.category_id || null,
          cost_price: formData.cost_price ? Number.parseFloat(formData.cost_price) : null,
          wholesale_price: formData.wholesale_price ? Number.parseFloat(formData.wholesale_price) : null,
          retail_price: formData.retail_price ? Number.parseFloat(formData.retail_price) : null,
          price: Number.parseFloat(formData.price),
          stock_quantity: Number.parseInt(formData.stock_quantity),
          min_stock_alert: formData.min_stock_alert ? Number.parseInt(formData.min_stock_alert) : 5,
          max_stock_target: formData.max_stock_target ? Number.parseInt(formData.max_stock_target) : null,
          description: formData.description,
          show_in_marketplace: formData.show_in_marketplace,
          custom_data: customData,
        },
        imageFile,
      )

      if (error) throw new Error(error)

      toast({
        title: t("products.productUpdated"),
        description: `${formData.name} ${t("products.productUpdatedDesc")}`,
      })

      resetForm()
      setEditingProduct(null)
      setIsEditDialogOpen(false)
      fetchProductsWithFilters(true)
    } catch (err: any) {
      console.error("[v0] Error updating product:", err)
      toast({
        title: t("products.errorUpdating"),
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`${t("products.deleteConfirmDesc")} ${productName}?`)) return

    setIsDeleting(productId)

    try {
      const { error } = await deleteProduct(productId)
      if (error) throw new Error(error)

      toast({
        title: t("products.productDeleted"),
        description: `${productName} ${t("products.productDeletedDesc")}`,
      })

      setProducts((prev) => prev.filter((p) => p.id !== productId))
      fetchProductsWithFilters(true)
    } catch (err: any) {
      console.error("[v0] Error deleting product:", err)
      toast({
        title: t("products.errorDeleting"),
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleViewHistory = async (productId: string) => {
    setHistoryLoading(true)
    setIsHistoryDialogOpen(true)

    const { data, error } = await getProductHistory(productId)
    if (!error && data) {
      setProductHistory(data)
    }

    setHistoryLoading(false)
  }

  const applyFilters = () => {
    setAppliedFilters(filters)
    setCurrentPage(0)
    setIsFilterDialogOpen(false)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900">
              {t("products.title")} <span className="italic font-light text-neutral-600">{t("products.subtitle")}</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">{t("products.description")}</p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsTutorialOpen(true)}
              className="bg-white/60 backdrop-blur-sm flex-shrink-0"
            >
              <FiInfo className="w-4 h-4" />
            </Button>

            <Button
              className="bg-neutral-900 hover:bg-neutral-800 flex-1 sm:flex-initial whitespace-nowrap"
              onClick={() => {
                resetForm()
                setIsCreateDialogOpen(true)
              }}
            >
              <FiPlus className="w-4 h-4 mr-2" />
              <span className="truncate">{t("products.addProduct")}</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <StatsCard
            icon={<FiBox className="w-6 h-6" />}
            label={t("products.totalProducts")}
            value={stats?.total_products || 0}
            loading={statsLoading}
            gradient="from-blue-500 to-cyan-600"
          />
          <StatsCard
            icon={<FiBox className="w-6 h-6" />}
            label={t("products.inStock")}
            value={stats?.in_stock || 0}
            loading={statsLoading}
            gradient="from-green-500 to-emerald-600"
          />
          <StatsCard
            icon={<FiAlertTriangle className="w-6 h-6" />}
            label={t("products.outOfStock")}
            value={stats?.out_of_stock || 0}
            loading={statsLoading}
            gradient="from-red-500 to-orange-600"
          />
          <StatsCard
            icon={<FiBox className="w-6 h-6" />}
            label={t("products.lowStock")}
            value={stats?.low_stock_custom || 0}
            loading={statsLoading}
            gradient="from-yellow-500 to-amber-600"
          />
        </div>

        {/* Search and Filters */}
        <GlassCard className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder={t("products.searchPlaceholder")}
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("list")}
                className={`transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-neutral-900 text-white hover:bg-neutral-900 hover:text-white border-neutral-900"
                    : "hover:bg-neutral-900 hover:text-white"
                }`}
              >
                <FiList className="w-4 h-4" />
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
                <FiGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="flex-1 sm:flex-initial bg-transparent hover:bg-neutral-100"
                onClick={() => setIsFilterDialogOpen(true)}
              >
                <FiFilter className="w-4 h-4 mr-2" />
                <span className="sm:inline">{t("common.filter")}</span>
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Products List */}
        {productsLoading && currentPage === 0 ? (
          <GlassCard>
            <div className="text-center py-12 text-neutral-600">{t("products.loadingProducts")}</div>
          </GlassCard>
        ) : viewMode === "list" ? (
          <ProductsTable
            products={products}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleViewHistory={handleViewHistory}
            isDeleting={isDeleting}
            t={t}
          />
        ) : (
          <ProductsGrid
            products={products}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            isDeleting={isDeleting}
            t={t}
            handleViewHistory={handleViewHistory}
          />
        )}

        {/* Load More Button */}
        {hasMore && !productsLoading && products.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button onClick={handleLoadMore} disabled={isLoadingMore} className="bg-neutral-900 hover:bg-neutral-800">
              {isLoadingMore ? t("common.loading") : t("common.loadMore")}
            </Button>
          </div>
        )}

        {/* Dialogs */}
        <ProductFormDialog
          isOpen={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false)
            resetForm()
          }}
          formData={formData}
          setFormData={setFormData}
          customFields={customFields}
          setCustomFields={setCustomFields}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          handleSubmit={handleCreate}
          isCreating={isCreating}
          categories={categories}
          generateSKU={generateSKU}
          isEdit={false}
          suggestedPrices={suggestedPrices}
          onOpenFormTutorial={() => setIsFormTutorialOpen(true)}
          t={t}
        />

        <ProductFormDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setEditingProduct(null)
            resetForm()
          }}
          formData={formData}
          setFormData={setFormData}
          customFields={customFields}
          setCustomFields={setCustomFields}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          handleSubmit={handleUpdate}
          isCreating={isCreating}
          categories={categories}
          generateSKU={generateSKU}
          isEdit={true}
          productHistory={editingProduct ? productHistory : []}
          suggestedPrices={suggestedPrices}
          onOpenFormTutorial={() => setIsFormTutorialOpen(true)}
          t={t}
        />

        <FilterDialog
          isOpen={isFilterDialogOpen}
          onClose={() => setIsFilterDialogOpen(false)}
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          applyFilters={applyFilters}
          t={t}
        />

        <TutorialDialog isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} t={t} />

        <FormTutorialDialog isOpen={isFormTutorialOpen} onClose={() => setIsFormTutorialOpen(false)} t={t} />

        <ProductHistoryDialog
          isOpen={isHistoryDialogOpen}
          onClose={() => setIsHistoryDialogOpen(false)}
          history={productHistory}
          loading={historyLoading}
          t={t}
        />
      </motion.div>
    </div>
  )
}
