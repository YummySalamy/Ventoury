"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FiCalendar, FiX } from "react-icons/fi"
import { format } from "date-fns"

interface FilterDialogProps {
  isOpen: boolean
  onClose: () => void
  filters: any
  setFilters: (filters: any) => void
  categories: any[]
  applyFilters: () => void
  t: (key: string) => string
}

export const FilterDialog = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  categories,
  applyFilters,
  t,
}: FilterDialogProps) => {
  const stockStatusOptions = [
    { value: "all", label: t("products.allStockStatus"), color: "bg-neutral-100 text-neutral-800" },
    { value: "in_stock", label: t("products.inStock"), color: "bg-green-100 text-green-800" },
    { value: "low_stock", label: t("products.lowStock"), color: "bg-yellow-100 text-yellow-800" },
    { value: "out_of_stock", label: t("products.outOfStock"), color: "bg-red-100 text-red-800" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t("common.filters")}</DialogTitle>
          <DialogDescription>{t("products.filterProductsDesc")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Category Filter */}
          <div className="grid gap-3">
            <Label className="text-base font-semibold">{t("products.category")}</Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={!filters.category ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  !filters.category ? "bg-neutral-900 text-white hover:bg-neutral-800" : "hover:bg-neutral-100"
                }`}
                onClick={() => setFilters({ ...filters, category: null })}
              >
                {t("products.allCategories")}
              </Badge>
              {categories.map((category: any) => (
                <Badge
                  key={category.id}
                  variant={filters.category === category.id ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    filters.category === category.id ? "text-white hover:opacity-90" : "hover:bg-neutral-100"
                  }`}
                  style={{
                    backgroundColor: filters.category === category.id ? category.color || "#171717" : "transparent",
                    borderColor: category.color || "#e5e5e5",
                    color: filters.category === category.id ? "white" : category.color || "#171717",
                  }}
                  onClick={() => setFilters({ ...filters, category: category.id })}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stock Status Filter */}
          <div className="grid gap-3">
            <Label className="text-base font-semibold">{t("products.stockStatus")}</Label>
            <div className="flex flex-wrap gap-2">
              {stockStatusOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={filters.stockFilter === option.value ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    filters.stockFilter === option.value ? option.color : "hover:bg-neutral-100"
                  }`}
                  onClick={() => setFilters({ ...filters, stockFilter: option.value })}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid gap-3">
            <Label className="text-base font-semibold">{t("products.dateRange")}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm text-neutral-600">{t("products.dateFrom")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <FiCalendar className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(new Date(filters.dateFrom), "PPP") : t("products.dateFrom")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                      onSelect={(date) =>
                        setFilters({ ...filters, dateFrom: date ? format(date, "yyyy-MM-dd") : null })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm text-neutral-600">{t("products.dateTo")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <FiCalendar className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(new Date(filters.dateTo), "PPP") : t("products.dateTo")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                      onSelect={(date) => setFilters({ ...filters, dateTo: date ? format(date, "yyyy-MM-dd") : null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.category || filters.stockFilter !== "all" || filters.dateFrom || filters.dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({
                  search: filters.search,
                  category: null,
                  stockFilter: "all",
                  dateFrom: null,
                  dateTo: null,
                  customFields: {},
                })
              }
              className="w-fit text-neutral-600 hover:text-neutral-900"
            >
              <FiX className="w-4 h-4 mr-2" />
              Clear all filters
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={applyFilters} className="bg-neutral-900 hover:bg-neutral-800">
            {t("common.apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
