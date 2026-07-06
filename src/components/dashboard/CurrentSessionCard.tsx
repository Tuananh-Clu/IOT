import type { ParkingHistory } from '@/types'
import { Car, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

export function CurrentSessionCard({ session }: { session: ParkingHistory | null }) {
  const [elapsed, setElapsed] = useState<string>('00:00:00')

  useEffect(() => {
    if (!session) return

    const timeIn = new Date(session.time_in).getTime()
    
    const updateElapsed = () => {
      const now = new Date().getTime()
      const diff = Math.max(0, now - timeIn)
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setElapsed(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [session])

  if (!session) {
    return (
      <div className="sp-panel p-6 flex flex-col items-center justify-center text-center h-full">
        <div className="w-12 h-12 rounded-full bg-sp-elevated flex items-center justify-center mb-3">
          <Car className="w-6 h-6 text-sp-text-3" />
        </div>
        <h3 className="font-semibold text-sp-text">No Active Session</h3>
        <p className="text-sm text-sp-text-3 mt-1">Your vehicle is not currently parked.</p>
      </div>
    )
  }

  return (
    <div className="sp-panel p-6 relative overflow-hidden h-full flex flex-col justify-between group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sp-brand-glow rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-70"></div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sp-text flex items-center gap-2">
            <Car className="w-5 h-5 text-sp-brand" />
            Vehicle Parked
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sp-brand-dim text-sp-brand border border-sp-brand/20">
            Active
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-sp-elevated border border-sp-border">
            <span className="text-sm text-sp-text-2">Slot</span>
            <span className="font-mono font-bold text-sp-brand">{session.slot_number}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-sp-elevated border border-sp-border">
            <span className="text-sm text-sp-text-2">License Plate</span>
            <span className="font-medium text-sp-text">{session.license_plate}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-sp-border">
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-sp-text-3 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Time Elapsed
          </span>
          <span className="font-mono text-2xl font-bold text-sp-text tracking-wider">{elapsed}</span>
        </div>
      </div>
    </div>
  )
}
