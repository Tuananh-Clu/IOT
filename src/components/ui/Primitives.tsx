import type { LucideIcon } from 'lucide-react'

interface PanelProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function Panel({ title, subtitle, children, className = '', action }: PanelProps) {
  return (
    <section className={`painted-panel min-w-0 p-4 ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="digital-text text-2xl font-semibold leading-7 text-lot-lane">{title}</h2>}
            {subtitle && <p className="text-sm text-lot-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

interface MetricProps {
  label: string
  value: string | number
  tone?: 'empty' | 'reserved' | 'occupied' | 'sensor' | 'lane'
  icon?: LucideIcon
  helper?: string
}

export function Metric({ label, value, tone = 'lane', icon: Icon, helper }: MetricProps) {
  const toneClass = {
    empty: 'text-lot-empty',
    reserved: 'text-lot-reserved',
    occupied: 'text-lot-occupied',
    sensor: 'text-lot-sensor',
    lane: 'text-lot-lane',
  }[tone]

  return (
    <div className="rounded-control border border-lot-divider bg-black/18 p-4">
      <div className="mb-2 flex items-center justify-between gap-2 text-sm text-lot-muted">
        <span>{label}</span>
        {Icon && <Icon className={`h-4 w-4 ${toneClass}`} />}
      </div>
      <p className={`digital-text text-4xl font-bold leading-9 ${toneClass}`}>{value}</p>
      {helper && <p className="mt-1 text-xs text-lot-muted">{helper}</p>}
    </div>
  )
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const normalized = status.toLowerCase()
  const style = normalized.includes('success') || normalized.includes('paid') || normalized.includes('online') || normalized.includes('empty') || normalized.includes('free')
    ? 'border-lot-empty/45 bg-lot-empty/12 text-lot-empty'
    : normalized.includes('pending') || normalized.includes('reserved') || normalized.includes('open')
      ? 'border-lot-reserved/45 bg-lot-reserved/12 text-lot-reserved'
      : normalized.includes('failed') || normalized.includes('offline') || normalized.includes('occupied') || normalized.includes('alert')
        ? 'border-lot-occupied/45 bg-lot-occupied/12 text-lot-occupied'
        : 'border-lot-divider bg-lot-lane/8 text-lot-muted'

  return (
    <span className={`inline-flex items-center rounded-control border px-2 py-1 text-xs font-semibold ${style}`}>
      {label ?? translateStatus(status)}
    </span>
  )
}

function translateStatus(status: string) {
  const normalized = status.toLowerCase()
  if (normalized.includes('success') || normalized.includes('paid')) return 'Đã thanh toán'
  if (normalized.includes('pending')) return 'Đang chờ'
  if (normalized.includes('reserved')) return 'Đã giữ chỗ'
  if (normalized.includes('occupied')) return 'Đang có xe'
  if (normalized.includes('empty') || normalized.includes('free')) return 'Còn trống'
  if (normalized.includes('online')) return 'Trực tuyến'
  if (normalized.includes('offline')) return 'Mất kết nối'
  if (normalized.includes('open')) return 'Đang mở'
  if (normalized.includes('closed')) return 'Đang đóng'
  if (normalized.includes('alert')) return 'Cảnh báo'
  if (normalized.includes('parking') || normalized.includes('in_progress') || normalized.includes('parked')) return 'Đang đỗ'
  if (normalized.includes('completed')) return 'Hoàn tất'
  if (normalized.includes('failed')) return 'Thất bại'
  return status
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="painted-panel mx-auto max-w-xl p-6 text-center">
      <div className="lane-stripe mx-auto mb-4 w-32" />
      <h1 className="digital-text text-3xl font-bold text-lot-lane">{title}</h1>
      <p className="mt-2 text-sm text-lot-muted">{message}</p>
    </div>
  )
}

export function LoadingDeck() {
  return (
    <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="painted-panel h-44 animate-pulse p-4">
          <div className="mb-4 h-3 w-24 rounded bg-lot-lane/10" />
          <div className="h-10 w-32 rounded bg-lot-lane/10" />
        </div>
      ))}
    </div>
  )
}

export function TableShell({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-control border border-lot-divider">{children}</div>
}
