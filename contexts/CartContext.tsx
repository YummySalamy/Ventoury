"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
  max_stock: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  generateWhatsAppMessage: (businessWhatsApp: string, businessName: string) => string
  currentStoreId: string | null
  setCurrentStoreId: (storeId: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !currentStoreId) return

    const savedCart = localStorage.getItem(`ventoury-cart-${currentStoreId}`)
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error loading cart:", error)
      }
    } else {
      setItems([])
    }
  }, [currentStoreId, mounted])

  useEffect(() => {
    if (!mounted || !currentStoreId) return
    localStorage.setItem(`ventoury-cart-${currentStoreId}`, JSON.stringify(items))
  }, [items, currentStoreId, mounted])

  const handleSetCurrentStoreId = (storeId: string) => {
    if (storeId !== currentStoreId) {
      setItems([])
      setCurrentStoreId(storeId)
    }
  }

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        const newQuantity = existing.quantity + (item.quantity || 1)
        if (newQuantity > item.max_stock) {
          return prev
        }
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: newQuantity } : i))
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.min(quantity, item.max_stock) } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const generateWhatsAppMessage = (businessWhatsApp: string, businessName: string) => {
    const message = `Hola ${businessName}! Me gustaría hacer el siguiente pedido:\n\n${items
      .map((item) => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
      .join("\n")}\n\n*Total: $${totalPrice.toFixed(2)}*\n\n¿Está disponible?`

    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${businessWhatsApp.replace(/[^0-9]/g, "")}?text=${encodedMessage}`
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        generateWhatsAppMessage,
        currentStoreId,
        setCurrentStoreId: handleSetCurrentStoreId,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
