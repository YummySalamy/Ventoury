"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
  category: string
}

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const { toast } = useToast()

  if (!product) return null

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      max_stock: product.stock_quantity,
      quantity,
    })

    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your cart`,
    })

    onOpenChange(false)
    setQuantity(1)
  }

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          {product.category && (
            <Badge variant="outline" className="w-fit">
              {product.category}
            </Badge>
          )}
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.image_url || "/placeholder.svg?height=400&width=400"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
              {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  Only {product.stock_quantity} left in stock
                </p>
              )}
              {product.stock_quantity === 0 && (
                <Badge variant="destructive" className="mt-2">
                  Out of Stock
                </Badge>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <DialogDescription className="text-sm leading-relaxed">{product.description}</DialogDescription>
              </div>
            )}

            {product.stock_quantity > 0 && (
              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="h-8 w-8 bg-transparent"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock_quantity}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button onClick={handleAddToCart} className="w-full gap-2" size="lg">
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
