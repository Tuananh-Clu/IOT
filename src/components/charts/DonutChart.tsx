import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonChart } from '@/components/ui/SkeletonCard'
import { PieChart as PieIcon } from 'lucide-react'

interface DonutDataPoint {
  name: string
  value: number
  color?: string
}

interface DonutChartProps {
  data: DonutDataPoint[]
  loading?: boolean
  error?: string | null
  formatValue?: (v: number) => string
  height?: number
  innerLabel?: string
}

const DEFAULT_COLORS = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4']

function CustomTooltip({ active, payload, formatValue }: any) {
  if (!active || !payload?.length) return null
  const { name, value, payload: p } = payload[0]
  return (
    <div className="bg-sp-elevated border border-sp-border-md rounded-lg px-3 py-2 shadow-elevated text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
        <span className="text-sp-text-2">{name}</span>
      </div>
      <div className="font-semibold text-sp-text">{formatValue ? formatValue(value) : value}</div>
    </div>
  )
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload?.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-[11px] text-sp-text-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
          {entry.value}
        </div>
      ))}
    </div>
  )
}

export function DonutChart({
  data,
  loading = false,
  error = null,
  formatValue,
  height = 220,
}: DonutChartProps) {
  if (loading) return <SkeletonChart height={height} />
  if (error) return (
    <div className="flex items-center justify-center text-sp-text-3 text-body-sm" style={{ height }}>
      {error}
    </div>
  )
  if (!data?.length || data.every((d) => d.value === 0)) {
    return <EmptyState icon={PieIcon} message="No data to display" className="py-6" />
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius="55%"
          outerRadius="78%"
          dataKey="value"
          strokeWidth={0}
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              style={{ filter: `drop-shadow(0 0 6px ${entry.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}60)` }}
            />
          ))}
          {/* Center label rendered via label prop */}
        </Pie>
        <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
        <Legend content={<CustomLegend />} />
        {/* Center text via absolute overlay trick — done in parent if needed */}
      </PieChart>
    </ResponsiveContainer>
  )
}
