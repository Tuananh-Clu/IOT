export interface Resident {
  id: string
  full_name: string
  apartment: string
  phone: string
  rfid_uid: string
  created_at: string
}

export interface ParkingSlot {
  id: number
  slot_number: string
  status: string
  resident_id: string | null
  resident?: Resident | null
}

export interface ParkingHistory {
  id: number
  resident_id: string
  slot_number: string
  license_plate: string
  time_in: string
  time_out: string | null
  status: string
  resident?: Resident | null
}

export interface PaymentHistory {
  id: number
  parking_history_id: number
  resident_id: string
  amount: number
  payment_method: string
  status: string
  paid_at: string | null
  created_at: string
  resident?: Resident | null
  parking_history?: ParkingHistory | null
}
export interface ParkingSensorData {
  time: string
  car_count: number
  ir_sensor: number
  buzzer: number
  barrier: number
  temperature: number
  humidity: number
  flame_detected: number
}