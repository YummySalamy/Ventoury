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
  translationKey: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export interface NavItem {
  label: string
  translationKey: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: NavSubItem[]
}

export const sidebarItems: NavItem[] = [
  {
    label: "Dashboard",
    translationKey: "nav.dashboard",
    href: "/app",
    icon: LayoutDashboard,
  },
  {
    label: "Inventory",
    translationKey: "nav.inventory",
    href: "/app/inventory",
    icon: Package,
    subItems: [
      { label: "Products", translationKey: "nav.products", href: "/app/inventory/products", icon: Boxes },
      { label: "Categories", translationKey: "nav.categories", href: "/app/inventory/categories", icon: Tags },
      { label: "Stock", translationKey: "nav.stock", href: "/app/inventory/stock", icon: Package },
    ],
  },
  {
    label: "Sales",
    translationKey: "nav.sales",
    href: "/app/sales",
    icon: ShoppingCart,
    subItems: [
      { label: "All History", translationKey: "nav.allHistory", href: "/app/sales/history", icon: FileText },
      { label: "Reports", translationKey: "nav.reports", href: "/app/sales/reports", icon: TrendingUp },
      {
        label: "Accounts Receivable",
        translationKey: "nav.accountsReceivable",
        href: "/app/sales/receivables",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Customers",
    translationKey: "nav.customers",
    href: "/app/customers",
    icon: Users,
    subItems: [
      { label: "All Customers", translationKey: "nav.allCustomers", href: "/app/customers/list", icon: Users },
    ],
  },
  {
    label: "Accounting",
    translationKey: "nav.accounting",
    href: "/app/accounting",
    icon: Calculator,
    subItems: [
      { label: "Income", translationKey: "nav.income", href: "/app/accounting/income", icon: TrendingUp },
      { label: "Expenses", translationKey: "nav.expenses", href: "/app/accounting/expenses", icon: Wallet },
      { label: "Balance", translationKey: "nav.balance", href: "/app/accounting/balance", icon: CreditCard },
    ],
  },
  {
    label: "Web Store",
    translationKey: "nav.webStore",
    href: "/app/webstore",
    icon: Store,
  },
  {
    label: "Settings",
    translationKey: "nav.settings",
    href: "/app/settings",
    icon: Settings,
  },
]
