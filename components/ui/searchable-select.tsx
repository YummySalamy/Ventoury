"use client"

import { useState, useMemo, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiSearch, FiX, FiChevronDown } from "react-icons/fi"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/useTranslation"

interface SearchableSelectProps<T> {
  // Data
  items: T[]
  value: string
  onValueChange: (value: string) => void

  // Display configuration
  placeholder: string
  searchPlaceholder?: string
  emptyMessage?: string

  // Render functions
  renderTrigger?: (selectedItem: T | undefined) => ReactNode
  renderItem: (item: T) => ReactNode
  renderSelectedPreview?: (item: T) => ReactNode
  renderFilterButton?: () => ReactNode

  // Item configuration
  getItemId: (item: T) => string
  getItemSearchText: (item: T) => string

  // Optional features
  showSearch?: boolean
  disabled?: boolean
  className?: string
}

export function SearchableSelect<T>({
  items,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  renderTrigger,
  renderItem,
  renderSelectedPreview,
  renderFilterButton,
  getItemId,
  getItemSearchText,
  showSearch = true,
  disabled = false,
  className = "",
}: SearchableSelectProps<T>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedItem = useMemo(() => {
    return items.find((item) => getItemId(item) === value)
  }, [items, value, getItemId])

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter((item) => getItemSearchText(item).toLowerCase().includes(query))
  }, [items, searchQuery, getItemSearchText])

  const handleSelect = (itemId: string) => {
    onValueChange(itemId)
    setOpen(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    onValueChange("")
    setSearchQuery("")
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={`w-full h-12 px-4 flex items-center justify-between rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {renderTrigger && selectedItem ? (
          renderTrigger(selectedItem)
        ) : selectedItem ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">{renderItem(selectedItem)}</div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <FiChevronDown className="w-4 h-4 ml-2 flex-shrink-0 text-muted-foreground" />
      </button>

      {/* Selected Item Preview (if provided) */}
      <AnimatePresence>
        {selectedItem && renderSelectedPreview && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-3"
          >
            {renderSelectedPreview(selectedItem)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[500px] p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="text-base sm:text-lg flex-1 min-w-0 truncate">{placeholder}</DialogTitle>
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 px-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 flex-shrink-0"
                >
                  {t("common.clear")}
                </Button>
              )}
            </div>
            <DialogDescription className="sr-only">
              {showSearch ? `${t("common.search")} ${placeholder.toLowerCase()}` : placeholder}
            </DialogDescription>
          </DialogHeader>

          {showSearch && (
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <Input
                  placeholder={searchPlaceholder || t("common.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 h-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              {renderFilterButton && renderFilterButton()}
            </div>
          )}

          {/* Items List */}
          <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto space-y-1 pr-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">{emptyMessage || t("common.noData")}</div>
            ) : (
              filteredItems.map((item) => {
                const itemId = getItemId(item)
                const isSelected = itemId === value
                return (
                  <motion.button
                    key={itemId}
                    type="button"
                    onClick={() => handleSelect(itemId)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "bg-neutral-900 text-white"
                        : "hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-800"
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {renderItem(item)}
                  </motion.button>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
