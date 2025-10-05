import type React from "react"
import type { Metadata } from "next"
import { ClientLayout } from "@/components/ClientLayout"

export const metadata: Metadata = {
  title: {
    template: "%s | Ventoury",
    default: "Dashboard | Ventoury",
  },
  description: "Manage your inventory, sales, customers, and business operations with Ventoury.",
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}