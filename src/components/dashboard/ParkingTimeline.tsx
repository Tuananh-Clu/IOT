import type { ParkingHistory } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { History, ArrowRight, MapPin } from 'lucide-react'

export function ParkingTimeline({ history }: { history: ParkingHistory[] }) {
  if (!history?.length) {
    return <EmptyState icon={History} message="No parking history found." className="py-8" />
  }

  return (
    <div className="relative pl-4 space-y-6">
      {/* Vertical line connecting timeline items */}
      <div className="absolute top-2 bottom-2 left-[23px] w-px bg-sp-border-md" />

      {history.slice(0, 10).map((record) => {
        const isActive = record.status === 'parking' || record.status === 'in_progress'
        
        return (
          <div key={record.id} className="relative flex items-start gap-4">
            {/* Timeline dot */}
            <div className={`relative z-10 w-4 h-4 rounded-full border-[3px] border-sp-surface mt-1 shrink-0 ${isActive ? 'bg-sp-brand shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-sp-text-3'}`} />
            
            <div className="flex-1 sp-panel p-4 hover:border-sp-border-strong transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sp-text">{record.license_plate}</span>
                  {isActive && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sp-brand-dim text-sp-brand">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-sp-text-2 bg-sp-elevated px-2 py-1 rounded">
                  <MapPin className="w-3 h-3 text-sp-text-3" />
                  Slot {record.slot_number}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-sp-text-2">
                <div className="flex flex-col">
                  <span className="text-sp-text-3 mb-0.5">Time In</span>
                  <span>{new Date(record.time_in).toLocaleString('vi-VN')}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-sp-text-3 mx-1" />
                <div className="flex flex-col">
                  <span className="text-sp-text-3 mb-0.5">Time Out</span>
                  <span className={isActive ? 'text-sp-brand font-medium' : ''}>
                    {isActive ? 'Ongoing' : (record.time_out ? new Date(record.time_out).toLocaleString('vi-VN') : 'Unknown')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
