import { useMemo } from 'react'
import type { DashboardData } from '@/api/dashboard'
import type { PaymentHistory } from '@/types'

/**
 * Resident-scoped payment history hook.
 * Only exposes PaymentHistory records for the given residentId.
 */
export function useResidentPayments(residentId: string, data: DashboardData | null) {
  const payments = useMemo<PaymentHistory[]>(
    () => (data ? data.payments.filter((p) => p.resident_id === residentId) : []),
    [data, residentId]
  )

  const totalPaid = useMemo(
    () => payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0),
    [payments]
  )

  const totalPending = useMemo(
    () => payments.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0),
    [payments]
  )

  /** Group paid payments by month for the spending chart */
  function groupByMonth(months = 6): { month: string; amount: number }[] {
    const now = new Date()
    const buckets: Record<string, number> = {}
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      buckets[key] = 0
    }
    for (const p of payments) {
      if (p.status !== 'paid') continue
      const dateStr = p.paid_at || p.created_at
      if (!dateStr) continue
      const d = new Date(dateStr)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (key in buckets) buckets[key] += Number(p.amount)
    }
    return Object.entries(buckets).map(([month, amount]) => ({
      month,
      amount,
    }))
  }

  /** Group by payment_method for donut chart */
  function groupByMethod(): { method: string; count: number; amount: number }[] {
    const map: Record<string, { count: number; amount: number }> = {}
    for (const p of payments) {
      const m = p.payment_method || 'unknown'
      if (!map[m]) map[m] = { count: 0, amount: 0 }
      map[m].count++
      map[m].amount += Number(p.amount)
    }
    return Object.entries(map).map(([method, v]) => ({ method, ...v }))
  }

  return { payments, totalPaid, totalPending, groupByMonth, groupByMethod, loading: !data }
}
