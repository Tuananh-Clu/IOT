import { useMemo, useState } from 'react'
import type { ParkingHistory, ParkingSlot } from '@/types'
import { StatusPill } from '@/components/ui/Primitives'

function slotTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'occupied') return { fill: '#D64545', text: '#ECE7D8' }
  if (normalized === 'reserved') return { fill: '#F0B429', text: '#111714' }
  return { fill: '#2FBF71', text: '#111714' }
}

export function ParkingLotMap({ slots, history }: { slots: ParkingSlot[]; history: ParkingHistory[] }) {
  const [selected, setSelected] = useState<ParkingSlot | null>(slots[0] ?? null)
  const activeSession = useMemo(() => {
    if (!selected) return null
    return history.find((item) => item.slot_number === selected.slot_number && (item.status === 'parked' || item.status === 'parking' || item.status === 'in_progress')) ?? null
  }, [history, selected])

  const displaySlots = slots.length > 0 ? slots : Array.from({ length: 12 }).map((_, index) => ({
    id: index + 1,
    slot_number: `A${index + 1}`,
    status: index % 3 === 0 ? 'occupied' : index % 4 === 0 ? 'reserved' : 'empty',
    resident_id: null,
  }))

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="relative min-h-[430px] overflow-hidden rounded-control border border-lot-divider bg-[#252923] p-4">
        <div className="absolute left-1/2 top-0 h-full w-28 -translate-x-1/2 bg-[#1B201B]" />
        <div className="absolute left-1/2 top-8 h-[calc(100%-64px)] w-1 -translate-x-1/2 bg-lot-reserved" />
        <div className="absolute left-4 top-4 rounded-control border border-lot-empty/50 px-3 py-2 text-xs text-lot-empty">LỐI VÀO</div>
        <div className="absolute bottom-4 right-4 rounded-control border border-lot-occupied/50 px-3 py-2 text-xs text-lot-occupied">LỐI RA</div>
        <div className="relative z-10 grid min-h-[390px] grid-cols-2 gap-x-24 gap-y-3">
          {displaySlots.map((slot, index) => {
            const tone = slotTone(slot.status)
            const leftSide = index % 2 === 0
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelected(slot)}
                className={`focus-track h-14 rounded-sm border-2 border-lot-lane/65 px-2 text-left transition-transform hover:scale-[1.02] ${
                  leftSide ? '-skew-y-6' : 'skew-y-6'
                } ${selected?.id === slot.id ? 'ring-2 ring-lot-reserved' : ''}`}
                style={{ background: tone.fill, color: tone.text }}
              >
                <span className="digital-text block text-xl font-bold">{slot.slot_number}</span>
                <span className="block text-[10px] font-semibold uppercase">{translateSlotStatus(slot.status)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <aside className="rounded-control border border-lot-divider bg-black/18 p-4">
        <p className="mb-2 text-sm text-lot-muted">Ô đang chọn</p>
        <p className="digital-text text-5xl font-bold text-lot-lane">{selected?.slot_number ?? '--'}</p>
        {selected && <StatusPill status={selected.status} />}
        <div className="mt-5 space-y-3 text-sm">
          <Detail label="Cư dân" value={selected?.resident?.full_name ?? activeSession?.resident?.full_name ?? 'Chưa gán'} />
          <Detail label="Biển số" value={activeSession?.license_plate ?? 'Không có xe đang đỗ'} />
          <Detail label="Đỗ từ" value={activeSession?.time_in ? new Date(activeSession.time_in).toLocaleString('vi-VN') : 'Không có'} />
        </div>
      </aside>
    </div>
  )
}

function translateSlotStatus(value: string) {
  const normalized = value.toLowerCase()
  if (normalized.includes('occupied')) return 'Có xe'
  if (normalized.includes('reserved')) return 'Giữ chỗ'
  if (normalized.includes('empty') || normalized.includes('free')) return 'Trống'
  return value
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-lot-divider pb-2">
      <p className="text-xs text-lot-muted">{label}</p>
      <p className="font-semibold text-lot-lane">{value}</p>
    </div>
  )
}
