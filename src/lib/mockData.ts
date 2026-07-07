import type { ParkingHistory, ParkingSlot, Resident, PaymentHistory } from '@/types'

const INFLUX_TOKEN = "yruJFZ8T2q5ZiNV4jnyUG_7J1uxncsmvNaa-BGXZ-iCt62OgoYq_GENmEMtyaJYtEIhjaNm2yajAjwe2tKIEfg=="
const apiUrl = 'https://vtaeykptzpymrybqocog.supabase.co/rest/v1/'
const apiKey = 'sb_publishable_U7wvxDTEC38KuRt6ghEl5Q_6wSGbOUs'

const headers = {
  apikey: apiKey,
  Authorization: `Bearer ${apiKey}`,
}

async function fetchTable<T>(table: string, query = ''): Promise<T[]> {
  const response = await fetch(`${apiUrl}${table}${query}`, { headers })
  if (!response.ok) {
    throw new Error(`Không thể tải bảng ${table}: ${response.statusText}`)
  }
  return response.json()
}

export async function getResidents(): Promise<Resident[]> {
  const data = await fetchTable<any>('resident')
  return data.map((resident) => ({
    id: resident.id,
    full_name: resident.full_name,
    apartment: resident.apartment,
    phone: resident.phone,
    rfid_uid: resident.rfid_uid,
    created_at: resident.created_at,
  }))
}

export async function getParkingSlots(): Promise<ParkingSlot[]> {
  const data = await fetchTable<any>(
    'parking_slot',
    '?select=*,resident:resident_id(*)'
  )
  return data.map((slot) => ({
    id: slot.id,
    slot_number: slot.slot_number,
    status: slot.status,
    resident_id: slot.resident_id,
    resident: slot.resident ?? null,
  }))
}

export async function getParkingHistory(): Promise<ParkingHistory[]> {
  const data = await fetchTable<any>(
    'parking_history',
    '?select=*,resident:resident_id(*)&order=time_in.desc'
  )
  return data.map((row) => ({
    id: row.id,
    resident_id: row.resident_id,
    slot_number: row.slot_number,
    license_plate: row.license_plate,
    time_in: row.time_in,
    time_out: row.time_out,
    status: row.status,
    resident: row.resident ?? null,
  }))
}

export async function getPaymentHistory(): Promise<PaymentHistory[]> {
  const data = await fetchTable<any>(
    'payment_history',
    '?select=*,resident:resident_id(*),parking_history:parking_history_id(*)&order=created_at.desc'
  )
  return data.map((row) => ({
    id: row.id,
    parking_history_id: row.parking_history_id,
    resident_id: row.resident_id,
    amount: row.amount,
    payment_method: row.payment_method,
    status: row.status,
    paid_at: row.paid_at,
    created_at: row.created_at,
    resident: row.resident ?? null,
    parking_history: row.parking_history ?? null,
  }))
}

export async function getZoneOccupancy() {
  const slots = await getParkingSlots()
  const zones = new Map<string, { zone: string; count: number; occupiedCount: number }>()
  for (const slot of slots) {
    const zone = slot.slot_number.charAt(0)
    const entry = zones.get(zone) ?? { zone, count: 0, occupiedCount: 0 }
    entry.count += 1
    if (slot.status === 'occupied') entry.occupiedCount += 1
    zones.set(zone, entry)
  }
  return Array.from(zones.values())
}

export async function getDailyRevenue() {
  const payments = await getPaymentHistory()
  const now = new Date()
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    return {
      day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      date: date.toISOString().split('T')[0],
      amount: 0,
    }
  })

  for (const payment of payments) {
    if (payment.status !== 'paid' && payment.status !== 'completed' && payment.status !== 'success') {
      continue
    }
    
    const paymentDateStr = payment.paid_at || payment.created_at
    if (!paymentDateStr) continue
    
    const paymentDate = new Date(paymentDateStr).toISOString().split('T')[0]
    const dayRecord = last7Days.find((d) => d.date === paymentDate)
    if (dayRecord) {
      dayRecord.amount += Number(payment.amount)
    }
  }

  return last7Days
}

export async function getSensorHistory(hours = 1) {
  const response = await fetch(
    'https://vtaeykptzpymrybqocog.supabase.co/functions/v1/get-sensor-history',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: INFLUX_TOKEN, 
      },
      body: JSON.stringify({ hours }),
    }
  )
  if (!response.ok) {
    throw new Error(`Không thể tải lịch sử cảm biến: ${response.statusText}`)
  }
  return response.json()
}
