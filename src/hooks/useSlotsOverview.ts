import { useMemo } from 'react'
import type { DashboardData } from '@/api/dashboard'
import type { ParkingSlot } from '@/types'

export interface SlotStats {
  total: number
  available: number
  occupied: number
  reserved: number
  maintenance: number
  occupancyRate: number // 0-100
}

export interface ZoneStat {
  zone: string
  total: number
  available: number
  occupied: number
  reserved: number
  maintenance: number
  occupancyRate: number
}

/**
 * Admin-level slot overview hook.
 * Derives KPI counts and per-zone breakdown from all slots.
 */
export function useSlotsOverview(data: DashboardData | null) {
  const slots = useMemo<ParkingSlot[]>(() => data?.slots ?? [], [data])

  const stats = useMemo<SlotStats>(() => {
    const available   = slots.filter((s) => s.status === 'available' || s.status === 'free').length
    const occupied    = slots.filter((s) => s.status === 'occupied').length
    const reserved    = slots.filter((s) => s.status === 'reserved').length
    const maintenance = slots.filter((s) => s.status === 'maintenance').length
    const total = slots.length
    return {
      total,
      available,
      occupied,
      reserved,
      maintenance,
      // Occupancy = occupied / (total - maintenance) to exclude out-of-service slots
      occupancyRate: total > 0 ? Math.round((occupied / (total - maintenance || total)) * 100) : 0,
    }
  }, [slots])

  const zoneStats = useMemo<ZoneStat[]>(() => {
    const zoneMap: Record<string, ParkingSlot[]> = {}
    for (const slot of slots) {
      const zone = slot.slot_number.charAt(0).toUpperCase()
      if (!zoneMap[zone]) zoneMap[zone] = []
      zoneMap[zone].push(slot)
    }
    return Object.entries(zoneMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([zone, zSlots]) => {
        const available   = zSlots.filter((s) => s.status === 'available' || s.status === 'free').length
        const occupied    = zSlots.filter((s) => s.status === 'occupied').length
        const reserved    = zSlots.filter((s) => s.status === 'reserved').length
        const maintenance = zSlots.filter((s) => s.status === 'maintenance').length
        const total = zSlots.length
        return {
          zone,
          total,
          available,
          occupied,
          reserved,
          maintenance,
          occupancyRate: total > 0 ? Math.round((occupied / (total - maintenance || total)) * 100) : 0,
        }
      })
  }, [slots])

  return { slots, stats, zoneStats, loading: !data }
}
