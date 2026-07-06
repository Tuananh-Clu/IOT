import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchSensorHistory } from '@/api/sensors'
import type { ParkingSensorData } from '@/types'

const POLL_INTERVAL_MS = 30_000 // 30 seconds

/**
 * Sensor stream hook with automatic polling every 30s.
 * Accepts a `hours` parameter to control the time window.
 */
export function useSensorStream(hours = 1) {
  const [data, setData] = useState<ParkingSensorData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetch = useCallback(async () => {
    try {
      const result = await fetchSensorHistory(hours)
      setData(result ?? [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sensor fetch failed')
    } finally {
      setLoading(false)
    }
  }, [hours])

  useEffect(() => {
    setLoading(true)
    fetch()

    intervalRef.current = setInterval(fetch, POLL_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetch])

  /** Latest single reading (most recent timestamp) */
  const latest = data.length > 0 ? data[data.length - 1] : null

  /** Whether any reading in the window has flame_detected = 1 */
  const flameDetected = data.some((d) => d.flame_detected === 1)

  /** Most recent buzzer state */
  const buzzerActive = latest?.buzzer === 1

  /** Most recent barrier state */
  const barrierOpen = latest?.barrier === 1

  /** Most recent IR sensor state */
  const irActive = latest?.ir_sensor === 1

  return { data, latest, flameDetected, buzzerActive, barrierOpen, irActive, loading, error }
}
