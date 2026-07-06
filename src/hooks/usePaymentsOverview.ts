import { useMemo } from 'react'
import type { DashboardData } from '@/api/dashboard'
import type { PaymentHistory } from '@/types'

/**
 * Admin-level payments overview hook.
 * Includes aggregation for revenue bar chart, status donut, and method breakdown.
 */
export function usePaymentsOverview(data: DashboardData | null) {
  const payments = useMemo<PaymentHistory[]>(() => data?.payments ?? [], [data])

  const totalRevenue = useMemo(
    () => payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0),
    [payments]
  )

  const pendingAmount = useMemo(
    () => payments.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0),
    [payments]
  )

  /** Revenue grouped by day for last N days (only paid) */
  function groupByDay(days = 7): { date: string; label: string; amount: number }[] {
    const now = new Date()
    const buckets: Record<string, { label: string; amount: number }> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      buckets[key] = {
        label: d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }),
        amount: 0,
      }
    }
    for (const p of payments) {
      if (p.status !== 'paid') continue
      const dateStr = p.paid_at || p.created_at
      if (!dateStr) continue
      const day = new Date(dateStr).toISOString().split('T')[0]
      if (day in buckets) buckets[day].amount += Number(p.amount)
    }
    return Object.entries(buckets).map(([date, v]) => ({ date, ...v }))
  }

  /** Status breakdown for donut chart */
  function groupByStatus(): { status: string; count: number; amount: number }[] {
    const map: Record<string, { count: number; amount: number }> = {}
    for (const p of payments) {
      const s = p.status || 'unknown'
      if (!map[s]) map[s] = { count: 0, amount: 0 }
      map[s].count++
      map[s].amount += Number(p.amount)
    }
    return Object.entries(map).map(([status, v]) => ({ status, ...v }))
  }

  /** Payment method breakdown for stacked bar */
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

  return { payments, totalRevenue, pendingAmount, groupByDay, groupByStatus, groupByMethod, loading: !data }
}
