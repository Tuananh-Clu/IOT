import { useMemo } from 'react'
import type { DashboardData } from '@/api/dashboard'
import type { ParkingHistory } from '@/types'

/** Active status values used in DB (handle both naming conventions) */
const ACTIVE_STATUSES = ['parking', 'in_progress']

/**
 * Resident-scoped parking history hook.
 * Only exposes records belonging to the given residentId.
 */
export function useResidentParking(residentId: string, data: DashboardData | null) {
  const history = useMemo<ParkingHistory[]>(
    () => (data ? data.history.filter((h) => h.resident_id === residentId) : []),
    [data, residentId]
  )

  const currentSession = useMemo<ParkingHistory | null>(
    () => history.find((h) => ACTIVE_STATUSES.includes(h.status)) ?? null,
    [history]
  )

  const completedHistory = useMemo<ParkingHistory[]>(
    () => history.filter((h) => !ACTIVE_STATUSES.includes(h.status)),
    [history]
  )

  /**
   * Group completed sessions by day for the last N days.
   * Returns [{date, count}] sorted oldest → newest.
   */
  function groupByDay(days: number): { date: string; count: number }[] {
    const now = new Date()
    const buckets: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      buckets[d.toISOString().split('T')[0]] = 0
    }
    for (const record of completedHistory) {
      const day = record.time_in.split('T')[0]
      if (day in buckets) buckets[day]++
    }
    return Object.entries(buckets).map(([date, count]) => ({ date, count }))
  }

  return { history, currentSession, completedHistory, groupByDay, loading: !data }
}
