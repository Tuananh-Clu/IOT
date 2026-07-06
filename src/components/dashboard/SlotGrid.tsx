import { useState } from 'react'
import type { ParkingSlot } from '@/types'
import { Car } from 'lucide-react'

function SlotCell({ slot }: { slot: ParkingSlot }) {
  const [hovered, setHovered] = useState(false)
  const isOccupied = slot.status === 'occupied'

  // Map slot statuses to Tailwind color variables from our new sp-* theme
  const getSlotStyle = () => {
    switch (slot.status) {
      case 'occupied':
        return 'bg-sp-occupied-dim border-sp-occupied/60 shadow-[0_0_14px_rgba(239,68,68,0.25)]'
      case 'reserved':
        return 'bg-sp-reserved-dim border-sp-reserved/60'
      case 'maintenance':
        return 'bg-sp-maintenance-dim border-sp-maintenance/60'
      default: // available or free
        return 'bg-sp-available-dim border-sp-available/40 hover:border-sp-available/70 hover:shadow-[0_0_14px_rgba(34,197,94,0.2)]'
    }
  }

  const getTextColor = () => {
    switch (slot.status) {
      case 'occupied': return 'text-sp-occupied'
      case 'reserved': return 'text-sp-reserved'
      case 'maintenance': return 'text-sp-maintenance'
      default: return 'text-sp-available'
    }
  }

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-300 select-none ${getSlotStyle()}`}
        style={{ height: 76, minWidth: 52 }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-[2px] flex flex-col gap-1.5 py-1.5 items-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[2px] h-2 bg-white/10 rounded-full" />
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-[2px] flex flex-col gap-1.5 py-1.5 items-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[2px] h-2 bg-white/10 rounded-full" />
          ))}
        </div>

        {isOccupied ? (
          <>
            <div className={getTextColor()}>
              <Car className="w-6 h-6 drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
            </div>
            {slot.resident?.full_name && (
              <div className="mt-1 text-[8px] font-bold text-sp-occupied/80 leading-none tracking-tight text-center px-1 truncate max-w-full">
                {slot.resident.full_name.split(' ').pop()}
              </div>
            )}
          </>
        ) : (
          <div className="text-sp-available/50 flex flex-col items-center gap-0.5">
            <div className="w-4 h-[2px] bg-sp-available/30 rounded" />
            <div className="w-3 h-[2px] bg-sp-available/20 rounded" />
          </div>
        )}

        <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${isOccupied ? 'bg-sp-occupied/30 text-sp-occupied border border-sp-occupied/40' : 'bg-sp-elevated text-sp-text-2 border border-sp-border'}`}>
          {slot.slot_number}
        </div>
      </div>

      {hovered && (
        <div className="absolute z-20 bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-max max-w-[160px] bg-sp-surface border border-sp-border rounded-lg px-3 py-2 shadow-elevated text-xs pointer-events-none animate-fade-in">
          <div className="font-semibold text-sp-text mb-1">Slot {slot.slot_number}</div>
          {isOccupied ? (
            <>
              <div className="text-sp-text-2">{slot.resident?.full_name}</div>
              <div className="text-sp-text-3">{slot.resident?.apartment}</div>
            </>
          ) : (
            <div className={getTextColor()}>{slot.status === 'available' || slot.status === 'free' ? 'Available' : slot.status}</div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-sp-border" />
        </div>
      )}
    </div>
  )
}

export function SlotGrid({ slots }: { slots: ParkingSlot[] }) {
  const zones = ['A', 'B', 'C']

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-auto custom-scrollbar">
      {zones.map(zone => {
        const zoneSlots = slots.filter(s => s.slot_number.startsWith(zone))
        if (zoneSlots.length === 0) return null
        const occ = zoneSlots.filter(s => s.status === 'occupied').length
        const rate = zoneSlots.length ? Math.round((occ / zoneSlots.length) * 100) : 0

        return (
          <div key={zone}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-sp-elevated border border-sp-border flex items-center justify-center">
                  <span className="text-xs font-bold text-sp-text-2">{zone}</span>
                </div>
                <span className="text-sm font-semibold text-sp-text">Zone {zone}</span>
                <span className="text-xs text-sp-text-3">({occ}/{zoneSlots.length} slots)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 bg-sp-elevated rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${rate > 70 ? 'bg-sp-occupied' : rate > 40 ? 'bg-sp-reserved' : 'bg-sp-available'}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${rate > 70 ? 'text-sp-occupied' : rate > 40 ? 'text-sp-reserved' : 'text-sp-available'}`}>{rate}%</span>
              </div>
            </div>

            <div className="relative rounded-xl bg-sp-void/60 border border-sp-border overflow-hidden px-4 py-5">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px border-t border-dashed border-white/10" />
              <div className="flex gap-3 flex-wrap">
                {zoneSlots.map(slot => (
                  <SlotCell key={slot.id} slot={slot} />
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
