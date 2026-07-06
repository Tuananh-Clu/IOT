import { apiGet } from '@/api/client'
import type { Resident } from '@/types'

export async function fetchResidents(): Promise<Resident[]> {
  return apiGet<Resident[]>(
    'resident?select=*&order=created_at.desc',
  )
}
