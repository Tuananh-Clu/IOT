import { apiGet } from '@/api/client'
import type { ParkingHistory } from '@/types'

export async function fetchHistory(): Promise<ParkingHistory[]> {
  return apiGet<ParkingHistory[]>(
    'parking_history?select=*,resident(*)&order=time_in.desc',
  )
}
