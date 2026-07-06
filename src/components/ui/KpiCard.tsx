import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: { value: string; up: boolean } | null
  accentClass?: string
}

export function KpiCard({ title, value, subtitle, icon: Icon, iconColor = 'text-sp-brand', trend, accentClass }: KpiCardProps) {
  return (
    <div className="sp-panel p-5 flex flex-col gap-4 hover:border-sp-border-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-sp-elevated ${accentClass ?? ''}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.up
              ? 'text-sp-available bg-sp-available-dim'
              : 'text-sp-occupied bg-sp-occupied-dim'
          }`}>
            <span>{trend.up ? '↑' : '↓'}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      <div>
        <div className="font-display text-kpi text-sp-text leading-none">{value}</div>
        <div className="text-caption text-sp-text-2 mt-1.5">{title}</div>
        {subtitle && <div className="text-[11px] text-sp-text-3 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  )
}
