import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonChart } from '@/components/ui/SkeletonCard'
import { Activity } from 'lucide-react'
import type { ParkingSensorData } from '@/types'

interface SensorLineChartProps {
  data: ParkingSensorData[]
  lines: { key: keyof ParkingSensorData; label: string; color: string; unit?: string }[]
  loading?: boolean
  error?: string | null
  height?: number
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-sp-elevated border border-sp-border-md rounded-lg px-3 py-2 shadow-elevated text-xs min-w-[120px]">
      <div className="text-sp-text-2 mb-1.5 text-[10px]">
        {new Date(label).toLocaleTimeString('vi-VN')}
      </div>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-sp-text-2">{entry.name}</span>
          </div>
          <span className="font-semibold text-sp-text">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function SensorLineChart({
  data,
  lines,
  loading = false,
  error = null,
  height = 200,
}: SensorLineChartProps) {
  if (loading) return <SkeletonChart height={height} />
  if (error) return (
    <div className="flex items-center justify-center text-sp-text-3 text-body-sm" style={{ height }}>
      {error}
    </div>
  )
  if (!data?.length) return <EmptyState icon={Activity} message="No sensor data available" className="py-6" />

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => new Date(v).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          dy={6}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          dx={-4}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: 8, fontSize: 11, color: '#475569' }}
          iconType="circle"
          iconSize={8}
        />
        {lines.map((l) => (
          <Line
            key={String(l.key)}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
