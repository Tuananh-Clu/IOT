import { apiPatch, apiPost, isApiConfigured } from '@/api/client'
import { FEE_FIRST_HOUR } from '@/lib/constants'
import { calculateFee } from '@/lib/formatters'
import type { ParkingHistory, ParkingSlot } from '@/types'

export async function checkoutVehicle(
  slot: ParkingSlot,
  session: ParkingHistory,
  durationMinutes: number,
): Promise<void> {
  if (!isApiConfigured) {
    throw new Error('Thanh toán cần cấu hình Supabase trong .env.local')
  }

  const checkedOutAt = new Date().toISOString()
  const fee = calculateFee(durationMinutes)

  await apiPatch(`parking_history?id=eq.${session.id}`, {
    time_out: checkedOutAt,
    duration_minutes: durationMinutes,
    status: 'completed',
  })

  await apiPost('parking_fee', {
    history_id: session.id,
    resident_id: session.resident_id,
    amount: fee,
    fee_per_hour: FEE_FIRST_HOUR,
    payment_method: 'cash',
  })

  await apiPatch(`parking_slot?id=eq.${slot.id}`, {
    status: 'free',
    resident_id: null,
  })
}
