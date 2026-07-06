import type { DashboardData } from '@/api/dashboard'

/**
 * Derive flame alert status from initial dashboard sensor data.
 * For realtime, use useSensorStream().flameDetected instead.
 */
export function useFlameAlert(data: DashboardData | null): boolean {
  if (!data?.sensors) return false
  return data.sensors.some((s) => s.flame_detected === 1)
}
