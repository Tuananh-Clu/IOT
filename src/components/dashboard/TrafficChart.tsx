import { AreaTimeChart } from '@/components/charts/AreaTimeChart'
import type { ParkingSensorData } from '@/types'

export function TrafficChart({ data, loading, error }: { data: ParkingSensorData[], loading?: boolean, error?: string | null }) {
  const chartData = data.map(d => ({
    time: new Date(d.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    car_count: d.car_count
  }))

  return (
    <AreaTimeChart
      data={chartData}
      xKey="time"
      yKey="car_count"
      color="#8B5CF6"
      loading={loading}
      error={error}
      height={240}
    />
  )
}
