type StatusType =
  | 'available' | 'free'
  | 'occupied'
  | 'reserved'
  | 'maintenance'
  | 'paid'
  | 'pending'
  | 'failed'
  | 'safe'
  | 'warning'
  | 'danger'
  | 'parking'
  | 'in_progress'
  | 'completed'
  | string

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  available:    { label: 'Available',    cls: 'bg-sp-available-dim text-sp-available border border-sp-available/25' },
  free:         { label: 'Free',         cls: 'bg-sp-available-dim text-sp-available border border-sp-available/25' },
  occupied:     { label: 'Occupied',     cls: 'bg-sp-occupied-dim text-sp-occupied border border-sp-occupied/25' },
  reserved:     { label: 'Reserved',     cls: 'bg-sp-reserved-dim text-sp-reserved border border-sp-reserved/25' },
  maintenance:  { label: 'Maintenance',  cls: 'bg-sp-maintenance-dim text-sp-maintenance border border-sp-maintenance/25' },
  paid:         { label: 'Paid',         cls: 'bg-sp-available-dim text-sp-paid border border-sp-paid/25' },
  completed:    { label: 'Completed',    cls: 'bg-sp-available-dim text-sp-paid border border-sp-paid/25' },
  pending:      { label: 'Pending',      cls: 'bg-sp-reserved-dim text-sp-pending border border-sp-pending/25' },
  failed:       { label: 'Failed',       cls: 'bg-sp-occupied-dim text-sp-failed border border-sp-failed/25' },
  parking:      { label: 'Parked',       cls: 'bg-sp-brand-dim text-sp-brand border border-sp-brand/25' },
  in_progress:  { label: 'In Progress',  cls: 'bg-sp-brand-dim text-sp-brand border border-sp-brand/25' },
  safe:         { label: 'Safe',         cls: 'bg-sp-available-dim text-sp-safe border border-sp-safe/25' },
  warning:      { label: 'Warning',      cls: 'bg-sp-reserved-dim text-sp-warning border border-sp-warning/25' },
  danger:       { label: 'Danger',       cls: 'bg-sp-danger-dim text-sp-danger border border-sp-danger/25' },
}

export function StatusBadge({
  status,
  label: labelOverride,
  size = 'sm',
}: {
  status: StatusType
  label?: string
  size?: 'xs' | 'sm'
}) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    cls: 'bg-sp-elevated text-sp-text-2 border border-sp-border',
  }
  const label = labelOverride ?? config.label

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wide ${config.cls} ${
        size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'
      }`}
    >
      {label}
    </span>
  )
}
