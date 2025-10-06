import type React from "react"
import type { Metadata } from "next"
import { CartProvider } from "@/contexts/CartContext"

export const metadata: Metadata = {
  title: "Marketplace - Discover Stores",
  description: "Browse unique products from independent businesses and artisans",
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CartProvider>{children}</CartProvider>
}
