import { supabase } from '@/lib/supabase'
import type { ParkingSensorData } from '@/types'

/**
 * Fetch sensor history for the last N hours.
 * Uses the Supabase Edge Function which proxies to InfluxDB.
 */
export async function fetchSensorHistory(hours = 1): Promise<ParkingSensorData[]> {
  const { data, error } = await supabase.functions.invoke('get-sensor-history', {
    body: { hours }
  })
  
  if (error) {
    throw new Error(`Không thể tải lịch sử cảm biến: ${error.message}`)
  }
  
  return data as ParkingSensorData[]
}
