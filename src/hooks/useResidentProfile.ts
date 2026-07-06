import { useMemo } from 'react'
import type { DashboardData } from '@/api/dashboard'
import type { Resident } from '@/types'

/**
 * Derives a single resident profile from the shared DashboardData.
 * Data-access safe: only returns data matching the given residentId.
 */
export function useResidentProfile(
  residentId: string,
  data: DashboardData | null
): { resident: Resident | null; loading: boolean } {
  const resident = useMemo(
    () => (data ? (data.residents.find((r) => r.id === residentId) ?? null) : null),
    [data, residentId]
  )

  return { resident, loading: !data }
}
