import { useMemo } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonChart } from '@/components/ui/SkeletonCard'
import { Grid } from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface HeatmapChartProps {
  /** 7×24 matrix: matrix[weekday][hour] = count. weekday 0=Mon, 6=Sun */
  matrix: number[][]
  loading?: boolean
  error?: string | null
  height?: number
}

export function HeatmapChart({ matrix, loading = false, error = null, height = 200 }: HeatmapChartProps) {
  if (loading) return <SkeletonChart height={height} />
  if (error) return (
    <div className="flex items-center justify-center text-sp-text-3 text-body-sm" style={{ height }}>
      {error}
    </div>
  )
  if (!matrix?.length) return <EmptyState icon={Grid} message="No traffic data available" className="py-6" />

  const maxVal = useMemo(() => Math.max(...matrix.flat()), [matrix])

  function getColor(val: number): string {
    if (maxVal === 0 || val === 0) return 'rgba(148,163,184,0.06)'
    const intensity = val / maxVal
    if (intensity < 0.25) return `rgba(34,197,94,${0.2 + intensity * 0.5})`
    if (intensity < 0.6)  return `rgba(245,158,11,${0.3 + intensity * 0.4})`
    return `rgba(239,68,68,${0.4 + intensity * 0.5})`
  }

  const cellSize = 16

  return (
    <div style={{ height }} className="overflow-x-auto">
      {/* Hour labels */}
      <div className="flex pl-10 mb-1">
        {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
          <div
            key={h}
            className="text-[10px] text-sp-text-3 text-center"
            style={{ width: `${(3 / 24) * 100}%` }}
          >
            {String(h).padStart(2, '0')}h
          </div>
        ))}
      </div>

      {/* Grid */}
      {DAYS.map((day, di) => (
        <div key={day} className="flex items-center gap-1 mb-1">
          <span className="text-[10px] text-sp-text-3 w-9 shrink-0 text-right pr-1">{day}</span>
          <div className="flex gap-px flex-1">
            {HOURS.map((h) => {
              const val = matrix[di]?.[h] ?? 0
              return (
                <div
                  key={h}
                  className="rounded-[2px] flex-1 cursor-default group relative"
                  style={{ height: cellSize, background: getColor(val) }}
                  title={`${day} ${String(h).padStart(2, '0')}:00 — ${val} sessions`}
                />
              )
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 pl-10">
        <span className="text-[10px] text-sp-text-3">Less</span>
        {[0, 0.2, 0.5, 0.8, 1].map((v, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-[2px]"
            style={{ background: getColor(v * maxVal) }}
          />
        ))}
        <span className="text-[10px] text-sp-text-3">More</span>
      </div>
    </div>
  )
}
