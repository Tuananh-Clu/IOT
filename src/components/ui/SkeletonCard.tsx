export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`sp-panel p-5 animate-fade-in ${className}`}>
      <div className="skeleton h-4 w-24 mb-4 rounded" />
      <div className="skeleton h-8 w-20 mb-2 rounded" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  )
}

export function SkeletonChart({ className = '', height = 220 }: { className?: string; height?: number }) {
  return (
    <div className={`sp-panel p-5 animate-fade-in ${className}`}>
      <div className="skeleton h-4 w-32 mb-2 rounded" />
      <div className="skeleton h-3 w-20 mb-5 rounded" />
      <div className="skeleton rounded" style={{ height }} />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-sp-border">
      <div className="skeleton w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-36 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
  )
}
