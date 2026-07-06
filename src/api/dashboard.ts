import { fetchHistory } from '@/api/history'
import { fetchSlots } from '@/api/slots'
import { fetchResidents } from '@/api/residents'
import { fetchPayments } from '@/api/payments'
import { fetchSensorHistory } from '@/api/sensors'
import type { ParkingHistory, ParkingSlot, Resident, PaymentHistory, ParkingSensorData } from '@/types'

export interface DashboardData {
  slots: ParkingSlot[]
  history: ParkingHistory[]
  residents: Resident[]
  payments: PaymentHistory[]
  sensors: ParkingSensorData[]
}

export async function fetchDashboard(): Promise<DashboardData> {
  const [slots, history, residents, payments, sensors] = await Promise.all([
    fetchSlots(),
    fetchHistory(),
    fetchResidents(),
    fetchPayments(),
    fetchSensorHistory(24), // last 24h of sensor data for initial load
  ])

  return { slots, history, residents, payments, sensors }
}
