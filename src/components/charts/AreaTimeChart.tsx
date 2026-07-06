import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonChart } from '@/components/ui/SkeletonCard'
import { TrendingUp } from 'lucide-react'

interface DataPoint {
  [key: string]: string | number
}

interface AreaTimeChartProps {
  data: DataPoint[]
  xKey: string
  yKey: string
  xLabel?: string
  yLabel?: string
  color?: string
  formatY?: (v: number) => string
  formatTooltipY?: (v: number) => string
  loading?: boolean
  error?: string | null
  height?: number
}

const DEFAULT_COLOR = '#3B82F6'

function CustomTooltip({ active, payload, label, formatY }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-sp-elevated border border-sp-border-md rounded-lg px-3 py-2 shadow-elevated text-xs">
      <div className="text-sp-text-2 mb-1">{label}</div>
      <div className="font-semibold text-sp-text">{formatY ? formatY(payload[0].value) : payload[0].value}</div>
    </div>
  )
}

export function AreaTimeChart({
  data,
  xKey,
  yKey,
  color = DEFAULT_COLOR,
  formatY,
  formatTooltipY,
  loading = false,
  error = null,
  height = 200,
}: AreaTimeChartProps) {
  if (loading) return <SkeletonChart height={height} />
  if (error) return (
    <div className="flex items-center justify-center text-sp-text-3 text-body-sm" style={{ height }}>
      {error}
    </div>
  )
  if (!data?.length) return <EmptyState icon={TrendingUp} message="No data available for this period" className="py-6" />

  const gradientId = `area-gradient-${yKey}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: '#475569', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fill: '#475569', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          dx={-4}
          tickFormatter={formatY}
          width={60}
        />
        <Tooltip content={<CustomTooltip formatY={formatTooltipY ?? formatY} />} />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
