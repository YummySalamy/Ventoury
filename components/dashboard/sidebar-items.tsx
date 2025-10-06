import type React from "react"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Calculator,
  Settings,
  Boxes,
  Tags,
  TrendingUp,
  FileText,
  Wallet,
  CreditCard,
  Store,
} from "lucide-react"

export interface NavSubItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: NavSubItem[]
}

export const sidebarItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/app",
    icon: LayoutDashboard,
  },
  {
    label: "Inventory",
    href: "/app/inventory",
    icon: Package,
    subItems: [
      { label: "Products", href: "/app/inventory/products", icon: Boxes },
      { label: "Categories", href: "/app/inventory/categories", icon: Tags },
      { label: "Stock", href: "/app/inventory/stock", icon: Package },
    ],
  },
  {
    label: "Sales",
    href: "/app/sales",
    icon: ShoppingCart,
    subItems: [
      { label: "All History", href: "/app/sales/history", icon: FileText },
      { label: "Reports", href: "/app/sales/reports", icon: TrendingUp },
      { label: "Accounts Receivable", href: "/app/sales/receivables", icon: CreditCard },
    ],
  },
  {
    label: "Customers",
    href: "/app/customers",
    icon: Users,
    subItems: [{ label: "All Customers", href: "/app/customers/list", icon: Users }],
  },
  {
    label: "Accounting",
    href: "/app/accounting",
    icon: Calculator,
    subItems: [
      { label: "Income", href: "/app/accounting/income", icon: TrendingUp },
      { label: "Expenses", href: "/app/accounting/expenses", icon: Wallet },
      { label: "Balance", href: "/app/accounting/balance", icon: CreditCard },
    ],
  },
  {
    label: "Web Store",
    href: "/app/webstore",
    icon: Store,
  },
  {
    label: "Settings",
    href: "/app/settings",
    icon: Settings,
  },
]
