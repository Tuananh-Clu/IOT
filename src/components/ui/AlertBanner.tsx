import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

interface AlertBannerProps {
  message?: string
  onDismiss?: () => void
}

/**
 * Full-width flame/danger alert banner.
 * HIGHEST PRIORITY UI ELEMENT — always renders above all other content.
 * This should be placed at the very top of the layout.
 */
export function AlertBanner({ message = 'FIRE DETECTED — Immediate action required!', onDismiss }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-danger-flash relative z-[9999] flex items-center gap-3 px-4 py-3 border-b border-sp-danger/50"
    >
      {/* Pulsing ring icon */}
      <div className="relative shrink-0 flex items-center justify-center w-8 h-8">
        <span className="absolute inline-flex h-full w-full rounded-full bg-sp-danger opacity-40 animate-pulse-ring" />
        <AlertTriangle className="w-5 h-5 text-sp-danger relative z-10" />
      </div>

      <div className="flex-1 min-w-0">
        <span className="font-display font-bold text-sp-danger text-sm tracking-wide uppercase">
          🔥 Emergency Alert
        </span>
        <span className="ml-3 text-sm text-red-300 font-medium">{message}</span>
      </div>

      <button
        onClick={handleDismiss}
        aria-label="Dismiss alert"
        className="shrink-0 p-1 rounded-lg text-sp-danger/70 hover:text-sp-danger hover:bg-sp-danger-dim transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
