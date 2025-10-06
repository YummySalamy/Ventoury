"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle, Calendar, DollarSign, CheckCircle2, Bell, TrendingUp } from "lucide-react"

export function InstallmentHelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <HelpCircle className="h-4 w-4" />
          How Installments Work
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Understanding Installment Payments</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Introduction */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border border-blue-200/50">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
            <div className="relative">
              <h3 className="font-semibold text-lg mb-2 text-blue-900">What are Installments?</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Installments allow customers to pay for purchases over time in multiple payments. This makes larger
                purchases more accessible and helps manage cash flow for both you and your customers.
              </p>
            </div>
          </div>

          {/* How it works - Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-neutral-900">How It Works</h3>

            {/* Step 1 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-neutral-900">Create Credit Sale</h4>
                </div>
                <p className="text-sm text-neutral-600">
                  When creating a sale, select "Credit" as payment type and specify the number of installments and first
                  due date.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-neutral-900">Automatic Scheduling</h4>
                </div>
                <p className="text-sm text-neutral-600">
                  The system automatically divides the total amount and creates payment schedules with monthly due
                  dates.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-neutral-900">Mark Payments</h4>
                </div>
                <p className="text-sm text-neutral-600">
                  When a customer pays an installment, click "Mark as Paid" in the sale details. The system
                  automatically updates the sale status.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold shadow-lg">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-neutral-900">Track Overdue</h4>
                </div>
                <p className="text-sm text-neutral-600">
                  Overdue payments are automatically flagged in red. Use the WhatsApp button to send payment reminders
                  to customers.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Status Guide */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-neutral-900">Payment Status Guide</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-green-900">Paid</p>
                  <p className="text-xs text-green-700">Payment has been received and recorded</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="w-3 h-3 rounded-full bg-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-yellow-900">Pending</p>
                  <p className="text-xs text-yellow-700">Payment is due but not yet overdue</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-red-900">Overdue</p>
                  <p className="text-xs text-red-700">Payment is past the due date - contact customer</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-blue-900">Partial (Sale Status)</p>
                  <p className="text-xs text-blue-700">Some installments paid, others pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 border border-amber-200/50">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-lg text-amber-900">Pro Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Set realistic due dates based on your customer's payment capacity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Send payment reminders a few days before the due date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Check the Recent Activity feed to see all payment updates in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Use filters to quickly find sales with overdue payments</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
