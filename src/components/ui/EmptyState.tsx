import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  message: string
  className?: string
}

export function EmptyState({ icon: Icon = Inbox, title, message, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-sp-elevated border border-sp-border flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-sp-text-3" />
      </div>
      {title && <div className="text-heading text-sp-text mb-1">{title}</div>}
      <div className="text-body-sm text-sp-text-3 max-w-xs">{message}</div>
    </div>
  )
}
