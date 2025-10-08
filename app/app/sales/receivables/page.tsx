"use client"

import { useState } from "react"
import { useInstallments } from "@/hooks/useInstallments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, DollarSign, Calendar, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { useTranslation } from "@/hooks/useTranslation"

export default function AccountsReceivablePage() {
  const { t } = useTranslation()
  const { installments, loading, markAsPaid } = useInstallments()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredInstallments = installments.filter((inst) => {
    const matchesSearch =
      inst.sales?.sale_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.sales?.customers?.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || inst.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleMarkAsPaid = async (installmentId: string) => {
    if (confirm("Mark this installment as paid?")) {
      const result = await markAsPaid(installmentId)
      if (result.error) {
        alert(result.error)
      }
    }
  }

  const totalPending = filteredInstallments
    .filter((i) => i.status === "pending" || i.status === "late")
    .reduce((sum, i) => sum + i.amount, 0)

  const totalOverdue = filteredInstallments.filter((i) => i.status === "late").reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("receivables.title")}</h1>
        <p className="text-muted-foreground">{t("receivables.description")}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("receivables.totalPending")}</p>
              <p className="text-2xl font-bold">${totalPending.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("receivables.overdue")}</p>
              <p className="text-2xl font-bold text-red-600">${totalOverdue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("receivables.paidThisMonth")}</p>
              <p className="text-2xl font-bold">
                {
                  installments.filter(
                    (i) => i.status === "paid" && new Date(i.paid_date!).getMonth() === new Date().getMonth(),
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("receivables.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("receivables.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("receivables.allStatus")}</SelectItem>
            <SelectItem value="pending">{t("receivables.pending")}</SelectItem>
            <SelectItem value="late">{t("receivables.overdue")}</SelectItem>
            <SelectItem value="paid">{t("receivables.paid")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Installments Table */}
      {loading ? (
        <div className="text-center py-12">{t("receivables.loading")}</div>
      ) : (
        <div className="glass-panel rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("receivables.saleNumber")}</TableHead>
                <TableHead>{t("receivables.customer")}</TableHead>
                <TableHead>{t("receivables.paymentNumber")}</TableHead>
                <TableHead>{t("receivables.amount")}</TableHead>
                <TableHead>{t("receivables.dueDate")}</TableHead>
                <TableHead>{t("receivables.status")}</TableHead>
                <TableHead className="text-right">{t("receivables.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstallments.map((installment) => (
                <TableRow key={installment.id}>
                  <TableCell className="font-medium">{installment.sales?.sale_number}</TableCell>
                  <TableCell>{installment.sales?.customers?.name}</TableCell>
                  <TableCell>
                    {installment.payment_number} / {installment.sales?.total_installments}
                  </TableCell>
                  <TableCell className="font-semibold">${installment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {format(new Date(installment.due_date), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        installment.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : installment.status === "late"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {t(`receivables.${installment.status}`)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {installment.status !== "paid" && installment.status !== "cancelled" && (
                      <Button size="sm" onClick={() => handleMarkAsPaid(installment.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t("receivables.markPaid")}
                      </Button>
                    )}
                    {installment.status === "paid" && installment.paid_date && (
                      <span className="text-sm text-muted-foreground">
                        {t("receivables.paidOn")} {format(new Date(installment.paid_date), "MMM dd")}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
