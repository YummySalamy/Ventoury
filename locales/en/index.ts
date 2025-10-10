// Main index file that re-exports all modules
import { common } from "./common"
import { nav } from "./nav"
import { auth } from "./auth"
import { dashboard } from "./dashboard"
import { products } from "./products"
import { categories } from "./categories"
import { sales } from "./sales"
import { customers } from "./customers"
import { receivables } from "./receivables"
import { reports } from "./reports"
import { webStore } from "./webstore"
import { settings } from "./settings"
import { invoice } from "./invoice"
import { stock } from "./stock"

// Export the complete English translations object
export const en = {
  common,
  nav,
  auth,
  dashboard,
  products,
  categories,
  sales,
  customers,
  receivables,
  reports,
  webStore,
  settings,
  invoice,
  stock,
}
