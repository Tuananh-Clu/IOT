import { SensorLineChart } from '@/components/charts/SensorLineChart'
import type { ParkingSensorData } from '@/types'

export function EnvironmentChart({ data, loading, error }: { data: ParkingSensorData[], loading?: boolean, error?: string | null }) {
  return (
    <SensorLineChart
      data={data}
      lines={[
        { key: 'temperature', label: 'Temperature (°C)', color: '#F59E0B' },
        { key: 'humidity', label: 'Humidity (%)', color: '#3B82F6' },
      ]}
      loading={loading}
      error={error}
      height={240}
    />
  )
}
