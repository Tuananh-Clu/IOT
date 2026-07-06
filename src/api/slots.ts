import { apiGet } from '@/api/client'
import type { ParkingSlot } from '@/types'

export async function fetchSlots(): Promise<ParkingSlot[]> {
  return apiGet<ParkingSlot[]>(
    'parking_slot?select=*,resident(*)&order=slot_number',
  )
}
