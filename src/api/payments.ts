import { apiGet } from '@/api/client'
import type { PaymentHistory } from '@/types'

export async function fetchPayments(): Promise<PaymentHistory[]> {
  return apiGet<PaymentHistory[]>(
    'payment_history?select=*,resident:resident_id(*),parking_history:parking_history_id(*)&order=created_at.desc'
  )
}

export async function fetchPaymentsByResident(residentId: string): Promise<PaymentHistory[]> {
  return apiGet<PaymentHistory[]>(
    `payment_history?select=*,resident:resident_id(*),parking_history:parking_history_id(*)&resident_id=eq.${residentId}&order=created_at.desc`
  )
}
