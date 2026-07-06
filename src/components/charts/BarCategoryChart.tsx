import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonChart } from '@/components/ui/SkeletonCard'
import { BarChart2 } from 'lucide-react'

interface BarDataPoint {
  [key: string]: string | number
}

interface BarCategoryChartProps {
  data: BarDataPoint[]
  xKey: string
  yKey: string
  color?: string
  formatY?: (v: number) => string
  formatTooltipY?: (v: number) => string
  loading?: boolean
  error?: string | null
  height?: number
  highlightMax?: boolean
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

export function BarCategoryChart({
  data,
  xKey,
  yKey,
  color = DEFAULT_COLOR,
  formatY,
  formatTooltipY,
  loading = false,
  error = null,
  height = 200,
  highlightMax = true,
}: BarCategoryChartProps) {
  if (loading) return <SkeletonChart height={height} />
  if (error) return (
    <div className="flex items-center justify-center text-sp-text-3 text-body-sm" style={{ height }}>
      {error}
    </div>
  )
  if (!data?.length) return <EmptyState icon={BarChart2} message="No data available for this period" className="py-6" />

  const maxVal = Math.max(...data.map((d) => Number(d[yKey]) || 0))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="35%">
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
        <Tooltip content={<CustomTooltip formatY={formatTooltipY ?? formatY} />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((entry, i) => {
            const isMax = highlightMax && Number(entry[yKey]) === maxVal && maxVal > 0
            return (
              <Cell
                key={i}
                fill={isMax ? color : `${color}80`}
                style={{ filter: isMax ? `drop-shadow(0 0 8px ${color}60)` : 'none' }}
              />
            )
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
