"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Mail, Phone, Users, TrendingUp, DollarSign } from "lucide-react"
import { GlassCard } from "@/components/dashboard/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const customers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1 234 567 8900", orders: 12, total: "$2,340" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1 234 567 8901", orders: 8, total: "$1,890" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "+1 234 567 8902", orders: 15, total: "$3,450" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", phone: "+1 234 567 8903", orders: 5, total: "$890" },
  {
    id: 5,
    name: "Charlie Wilson",
    email: "charlie@example.com",
    phone: "+1 234 567 8904",
    orders: 20,
    total: "$4,560",
  },
  { id: 6, name: "Diana Prince", email: "diana@example.com", phone: "+1 234 567 8905", orders: 7, total: "$1,230" },
]

export default function CustomersListPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900">
              Customers <span className="italic font-light text-neutral-600">Directory</span>
            </h1>
            <p className="text-neutral-600 mt-2">Manage your customer relationships and data</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neutral-900 hover:bg-neutral-800">
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>Create a new customer profile</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input id="customerName" placeholder="Enter customer name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input id="customerEmail" type="email" placeholder="customer@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input id="customerPhone" placeholder="+1 234 567 8900" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerAddress">Address</Label>
                  <textarea
                    id="customerAddress"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Customer address"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-neutral-900 hover:bg-neutral-800" onClick={() => setIsDialogOpen(false)}>
                  Create Customer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Customers</p>
                <p className="text-2xl font-bold text-neutral-900">2,345</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Revenue</p>
                <p className="text-2xl font-bold text-neutral-900">$124,560</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Avg. Customer Value</p>
                <p className="text-2xl font-bold text-neutral-900">$53.12</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input placeholder="Search customers by name, email, or phone..." className="pl-10" />
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                      {customer.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-neutral-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-neutral-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {customer.phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <div>
                    <p className="text-sm text-neutral-600">Orders</p>
                    <p className="text-2xl font-bold text-neutral-900">{customer.orders}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600">Total Spent</p>
                    <p className="text-2xl font-bold text-neutral-900">{customer.total}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
