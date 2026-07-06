import { useMemo } from 'react'
import type { DashboardData } from '@/api/dashboard'
import type { ParkingHistory } from '@/types'

const ACTIVE_STATUSES = ['parking', 'in_progress']

export interface HistoryFilters {
  residentId?: string
  slotNumber?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

/**
 * Admin-level parking history hook with optional filtering.
 * Includes aggregation helpers for charts.
 */
export function useParkingHistory(data: DashboardData | null, filters: HistoryFilters = {}) {
  const allHistory = useMemo<ParkingHistory[]>(() => data?.history ?? [], [data])

  const filteredHistory = useMemo<ParkingHistory[]>(() => {
    let result = allHistory
    if (filters.residentId)
      result = result.filter((h) => h.resident_id === filters.residentId)
    if (filters.slotNumber)
      result = result.filter((h) => h.slot_number === filters.slotNumber)
    if (filters.status)
      result = result.filter((h) => h.status === filters.status)
    if (filters.dateFrom)
      result = result.filter((h) => h.time_in >= filters.dateFrom!)
    if (filters.dateTo)
      result = result.filter((h) => h.time_in <= filters.dateTo!)
    return result
  }, [allHistory, filters])

  const currentlyParked = useMemo(
    () => allHistory.filter((h) => ACTIVE_STATUSES.includes(h.status)),
    [allHistory]
  )

  /**
   * Group history by day for traffic trend chart.
   * Returns [{date, label, count}] for the last N days.
   */
  function groupByDay(days = 7): { date: string; label: string; count: number }[] {
    const now = new Date()
    const buckets: Record<string, { label: string; count: number }> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      buckets[key] = {
        label: d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }),
        count: 0,
      }
    }
    for (const record of allHistory) {
      const day = record.time_in.split('T')[0]
      if (day in buckets) buckets[day].count++
    }
    return Object.entries(buckets).map(([date, v]) => ({ date, ...v }))
  }

  /**
   * Build a 7×24 heatmap matrix [weekday][hour] = count.
   * weekday: 0=Mon … 6=Sun; hour: 0-23
   */
  function buildHeatmap(): number[][] {
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
    for (const record of allHistory) {
      const d = new Date(record.time_in)
      const weekday = (d.getDay() + 6) % 7 // 0=Mon
      const hour = d.getHours()
      matrix[weekday][hour]++
    }
    return matrix
  }

  return { allHistory, filteredHistory, currentlyParked, groupByDay, buildHeatmap, loading: !data }
}
