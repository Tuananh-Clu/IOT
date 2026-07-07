import { useEffect, useMemo, useState } from 'react'
import { CarFront, IdCard, KeyRound, Phone, Plus, Radio, Search, Users } from 'lucide-react'
import type { DashboardData } from '@/api/dashboard'
import type { ParkingSlot, Resident } from '@/types'
import { BarPanelChart, DonutPanelChart } from '@/components/charts/Charts'
import { Metric, Panel, StatusPill, TableShell } from '@/components/ui/Primitives'

type ResidentFilter = 'all' | 'assigned' | 'unassigned' | 'active'

interface ResidentForm {
  full_name: string
  apartment: string
  phone: string
  rfid_uid: string
}

const emptyForm: ResidentForm = {
  full_name: '',
  apartment: '',
  phone: '',
  rfid_uid: '',
}

export function Residents({ data }: { data: DashboardData }) {
  const [residents, setResidents] = useState<Resident[]>(data.residents)
  const [slots, setSlots] = useState<ParkingSlot[]>(data.slots)
  const [selectedId, setSelectedId] = useState(data.residents[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ResidentFilter>('all')
  const [rfidDraft, setRfidDraft] = useState('')
  const [slotDraft, setSlotDraft] = useState('')
  const [scanUid, setScanUid] = useState('')
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [form, setForm] = useState<ResidentForm>(emptyForm)

  useEffect(() => {
    setResidents(data.residents)
    setSlots(data.slots)
    setSelectedId((current) => current || data.residents[0]?.id || '')
  }, [data])

  const activeResidentIds = useMemo(
    () => new Set(data.history.filter((item) => item.status === 'parking' || item.status === 'in_progress' || item.status === 'parked').map((item) => item.resident_id)),
    [data.history],
  )

  const selectedResident = residents.find((resident) => resident.id === selectedId) ?? residents[0] ?? null
  const selectedSlot = selectedResident ? slots.find((slot) => slot.resident_id === selectedResident.id) ?? null : null
  const selectedHistory = selectedResident ? data.history.filter((item) => item.resident_id === selectedResident.id).slice(0, 8) : []
  const availableSlots = slots.filter((slot) => !slot.resident_id || slot.resident_id === selectedResident?.id)
  const duplicateRfidCount = countDuplicates(residents.map((resident) => resident.rfid_uid).filter(Boolean))
  const assignedCount = residents.filter((resident) => slots.some((slot) => slot.resident_id === resident.id)).length
  const filteredResidents = residents.filter((resident) => {
    const assigned = slots.some((slot) => slot.resident_id === resident.id)
    const active = activeResidentIds.has(resident.id)
    const matchesFilter =
      filter === 'all' ||
      (filter === 'assigned' && assigned) ||
      (filter === 'unassigned' && !assigned) ||
      (filter === 'active' && active)
    const haystack = `${resident.full_name} ${resident.apartment} ${resident.phone} ${resident.rfid_uid}`.toLowerCase()
    return matchesFilter && haystack.includes(query.toLowerCase())
  })

  const apartmentData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const resident of residents) {
      const tower = resident.apartment.trim().charAt(0).toUpperCase() || 'N'
      counts.set(tower, (counts.get(tower) ?? 0) + 1)
    }
    return Array.from(counts.entries()).map(([tower, count]) => ({ tower, count }))
  }, [residents])

  const slotStatusData = [
    { name: 'Đã gán', value: assignedCount, color: '#2FBF71' },
    { name: 'Chưa gán', value: Math.max(0, residents.length - assignedCount), color: '#F0B429' },
    { name: 'Đang đỗ', value: activeResidentIds.size, color: '#2C7DA0' },
  ].filter((item) => item.value > 0)

  const handleSelect = (resident: Resident) => {
    const assigned = slots.find((slot) => slot.resident_id === resident.id)
    setSelectedId(resident.id)
    setRfidDraft(resident.rfid_uid)
    setSlotDraft(assigned ? String(assigned.id) : '')
  }

  const handleSaveRfid = () => {
    if (!selectedResident) return
    setResidents((current) =>
      current.map((resident) => (resident.id === selectedResident.id ? { ...resident, rfid_uid: rfidDraft.trim() } : resident)),
    )
  }

  const handleAssignSlot = () => {
    if (!selectedResident) return
    const nextSlotId = Number(slotDraft)
    setSlots((current) =>
      current.map((slot) => {
        if (slot.resident_id === selectedResident.id) return { ...slot, resident_id: null, resident: null }
        if (slot.id === nextSlotId) return { ...slot, resident_id: selectedResident.id, resident: selectedResident }
        return slot
      }),
    )
  }

  const handleScan = () => {
    const match = residents.find((resident) => resident.rfid_uid.toLowerCase() === scanUid.trim().toLowerCase())
    if (!match) {
      setScanResult('Không tìm thấy RFID')
      return
    }
    handleSelect(match)
    const assigned = slots.find((slot) => slot.resident_id === match.id)
    setScanResult(`${match.full_name} - ${assigned?.slot_number ?? 'chưa gán ô'}`)
  }

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    const nextResident: Resident = {
      id: `local-${Date.now()}`,
      full_name: form.full_name.trim(),
      apartment: form.apartment.trim(),
      phone: form.phone.trim(),
      rfid_uid: form.rfid_uid.trim(),
      created_at: new Date().toISOString(),
    }
    setResidents((current) => [nextResident, ...current])
    setSelectedId(nextResident.id)
    setRfidDraft(nextResident.rfid_uid)
    setSlotDraft('')
    setForm(emptyForm)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="lane-stripe mb-3 w-44" />
          <h1 className="digital-text text-4xl font-bold text-lot-lane">Quản lý cư dân & RFID</h1>
          <p className="text-lot-muted">Quản lý hồ sơ cư dân, thẻ RFID, phân ô đỗ và kiểm tra quyền ra vào.</p>
        </div>
        <div className="control-surface grid gap-2 rounded-control p-2 sm:grid-cols-4">
          {(['all', 'assigned', 'unassigned', 'active'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`focus-track rounded-control px-3 py-2 text-sm font-semibold capitalize ${
                filter === item ? 'bg-lot-reserved text-lot-asphalt' : 'text-lot-muted hover:text-lot-lane'
              }`}
            >
              {translateFilter(item)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Cư dân" value={residents.length} helper="Dữ liệu đã tải và mục thêm tạm" icon={Users} tone="lane" />
        <Metric label="Ô đã gán" value={assignedCount} helper={`${residents.length - assignedCount} đang chờ`} icon={CarFront} tone="empty" />
        <Metric label="Đang đỗ" value={activeResidentIds.size} helper="Phiên đỗ liên kết RFID" icon={Radio} tone="sensor" />
        <Metric label="Trùng RFID" value={duplicateRfidCount} helper="Số UID bị trùng" icon={KeyRound} tone={duplicateRfidCount > 0 ? 'occupied' : 'reserved'} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.6fr)]">
        <Panel
          title="Danh bạ cư dân"
          subtitle="Tìm kiếm, lọc và chọn hồ sơ"
          action={
            <label className="relative block w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lot-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="focus-track w-full rounded-control border border-lot-divider bg-lot-asphalt px-9 py-2 text-sm text-lot-lane placeholder:text-lot-muted"
                placeholder="Tìm cư dân"
              />
            </label>
          }
        >
          <TableShell>
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-black/24 text-xs uppercase text-lot-muted">
                <tr>
                  <th className="px-3 py-3">Cư dân</th>
                  <th className="px-3 py-3">Căn hộ</th>
                  <th className="px-3 py-3">Điện thoại</th>
                  <th className="px-3 py-3">RFID</th>
                  <th className="px-3 py-3">Ô đỗ</th>
                  <th className="px-3 py-3">Quyền vào</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lot-divider">
                {filteredResidents.map((resident) => {
                  const assigned = slots.find((slot) => slot.resident_id === resident.id)
                  const active = activeResidentIds.has(resident.id)
                  return (
                    <tr
                      key={resident.id}
                      onClick={() => handleSelect(resident)}
                      className={`cursor-pointer hover:bg-lot-lane/5 ${selectedResident?.id === resident.id ? 'bg-lot-reserved/8' : ''}`}
                    >
                      <td className="px-3 py-3 font-semibold text-lot-lane">{resident.full_name}</td>
                      <td className="px-3 py-3 text-lot-muted">{resident.apartment}</td>
                      <td className="px-3 py-3 text-lot-muted">{resident.phone}</td>
                      <td className="px-3 py-3 digital-text">{maskRfid(resident.rfid_uid)}</td>
                      <td className="px-3 py-3">{assigned ? `${assigned.slot_number} (${translateSlotStatus(assigned.status)})` : 'Chưa gán'}</td>
                      <td className="px-3 py-3"><StatusPill status={active ? 'online' : assigned ? 'reserved' : 'open'} label={active ? 'Đang đỗ' : assigned ? 'Đã gán' : 'Mở'} /></td>
                    </tr>
                  )
                })}
                {filteredResidents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-lot-muted">Không có cư dân nào khớp bộ lọc</td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableShell>
        </Panel>

        <div className="space-y-4">
          <Panel title="Máy quét RFID" subtitle="Mô phỏng đọc thẻ">
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={scanUid}
                  onChange={(event) => setScanUid(event.target.value)}
                  className="focus-track min-w-0 flex-1 rounded-control border border-lot-divider bg-lot-asphalt px-3 py-2 text-lot-lane placeholder:text-lot-muted"
                  placeholder="RFID UID"
                />
                <button type="button" onClick={handleScan} className="focus-track rounded-control bg-lot-reserved px-4 py-2 font-bold text-lot-asphalt">
                  Quét
                </button>
              </div>
              {scanResult && (
                <div className="rounded-control border border-lot-divider bg-black/18 p-3 text-sm text-lot-lane">{scanResult}</div>
              )}
            </div>
          </Panel>

          <Panel title="Hồ sơ đang chọn" subtitle={selectedResident ? selectedResident.full_name : 'Chưa chọn cư dân'}>
            {selectedResident ? (
              <div className="space-y-3">
                <div className="grid gap-2 text-sm">
                  <Info icon={IdCard} label="Căn hộ" value={selectedResident.apartment} />
                  <Info icon={Phone} label="Điện thoại" value={selectedResident.phone} />
                  <Info icon={CarFront} label="Ô đã gán" value={selectedSlot ? `${selectedSlot.slot_number} - ${translateSlotStatus(selectedSlot.status)}` : 'Chưa có'} />
                </div>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-lot-lane">RFID UID</span>
                  <input
                    value={rfidDraft || selectedResident.rfid_uid}
                    onChange={(event) => setRfidDraft(event.target.value)}
                    className="focus-track w-full rounded-control border border-lot-divider bg-lot-asphalt px-3 py-2 text-lot-lane"
                  />
                </label>
                <button type="button" onClick={handleSaveRfid} className="focus-track w-full rounded-control bg-lot-reserved px-4 py-2 font-bold text-lot-asphalt">
                  Lưu RFID
                </button>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-lot-lane">Gán ô đỗ</span>
                  <select
                    value={slotDraft || (selectedSlot ? String(selectedSlot.id) : '')}
                    onChange={(event) => setSlotDraft(event.target.value)}
                    className="focus-track w-full rounded-control border border-lot-divider bg-lot-asphalt px-3 py-2 text-lot-lane"
                  >
                    <option value="">Chưa gán ô</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>{slot.slot_number} - {translateSlotStatus(slot.status)}</option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={handleAssignSlot} className="focus-track w-full rounded-control border border-lot-divider px-4 py-2 font-bold text-lot-lane hover:bg-lot-lane/8">
                  Cập nhật phân ô
                </button>
              </div>
            ) : (
              <p className="text-sm text-lot-muted">Chọn một cư dân trong danh bạ.</p>
            )}
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Cư dân theo toà" subtitle="Nhóm theo ký tự đầu căn hộ">
          <BarPanelChart data={apartmentData} xKey="tower" yKey="count" color="#2C7DA0" />
        </Panel>
        <Panel title="Tỷ lệ phân ô" subtitle="Đã gán, đang chờ và đang đỗ">
          <DonutPanelChart data={slotStatusData} />
        </Panel>
        <Panel title="Thêm cư dân" subtitle="Thêm tạm trên giao diện để nhập nhanh">
          <form onSubmit={handleCreate} className="space-y-3">
            <input required value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className="focus-track w-full rounded-control border border-lot-divider bg-lot-asphalt px-3 py-2 text-lot-lane placeholder:text-lot-muted" placeholder="Họ tên" />
            <input required value={form.apartment} onChange={(event) => setForm({ ...form, apartment: event.target.value })} className="focus-track w-full rounded-control border border-lot-divider bg-lot-asphalt px-3 py-2 text-lot-lane placeholder:text-lot-muted" placeholder="Căn hộ" />
            <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="focus-track w-full rounded-control border border-lot-divider bg-lot-asphalt px-3 py-2 text-lot-lane placeholder:text-lot-muted" placeholder="Điện thoại" />
            <input required value={form.rfid_uid} onChange={(event) => setForm({ ...form, rfid_uid: event.target.value })} className="focus-track w-full rounded-control border border-lot-divider bg-lot-asphalt px-3 py-2 text-lot-lane placeholder:text-lot-muted" placeholder="RFID UID" />
            <button type="submit" className="focus-track flex w-full items-center justify-center gap-2 rounded-control bg-lot-reserved px-4 py-2 font-bold text-lot-asphalt">
              <Plus className="h-4 w-4" />
              Thêm cư dân
            </button>
          </form>
        </Panel>
      </div>

      <Panel title="Hoạt động của cư dân đang chọn" subtitle="Lịch sử đỗ xe gần đây của cư dân">
        <TableShell>
          <table className="w-full min-w-[740px] text-left text-sm">
            <thead className="bg-black/24 text-xs uppercase text-lot-muted">
              <tr>
                <th className="px-3 py-3">Giờ vào</th>
                <th className="px-3 py-3">Giờ ra</th>
                <th className="px-3 py-3">Biển số</th>
                <th className="px-3 py-3">Ô đỗ</th>
                <th className="px-3 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lot-divider">
              {selectedHistory.map((item) => (
                <tr key={item.id} className="hover:bg-lot-lane/5">
                  <td className="px-3 py-3 text-lot-muted">{new Date(item.time_in).toLocaleString('vi-VN')}</td>
                  <td className="px-3 py-3 text-lot-muted">{item.time_out ? new Date(item.time_out).toLocaleString('vi-VN') : 'Đang đỗ'}</td>
                  <td className="px-3 py-3 digital-text text-lg">{item.license_plate}</td>
                  <td className="px-3 py-3">{item.slot_number}</td>
                  <td className="px-3 py-3"><StatusPill status={item.status} /></td>
                </tr>
              ))}
              {selectedHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-lot-muted">Chưa có hoạt động của cư dân này</td>
                </tr>
              )}
            </tbody>
          </table>
        </TableShell>
      </Panel>
    </div>
  )
}

function Info({ icon: Icon, label, value }: { icon: typeof IdCard; label: string; value: string }) {
  return (
    <div className="rounded-control border border-lot-divider bg-black/18 p-3">
      <Icon className="mb-2 h-4 w-4 text-lot-reserved" />
      <p className="text-xs text-lot-muted">{label}</p>
      <p className="font-semibold text-lot-lane">{value}</p>
    </div>
  )
}

function maskRfid(value: string) {
  if (!value || value.length <= 4) return '****'
  return `${value.slice(0, 2)}****${value.slice(-2)}`
}

function countDuplicates(values: string[]) {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return Array.from(counts.values()).filter((count) => count > 1).length
}

function translateFilter(value: ResidentFilter) {
  return {
    all: 'Tất cả',
    assigned: 'Đã gán',
    unassigned: 'Chưa gán',
    active: 'Đang đỗ',
  }[value]
}

function translateSlotStatus(value?: string | null) {
  const normalized = (value ?? '').toLowerCase()
  if (normalized.includes('occupied')) return 'đang có xe'
  if (normalized.includes('reserved')) return 'đã giữ chỗ'
  if (normalized.includes('empty') || normalized.includes('free')) return 'còn trống'
  return value ?? 'chưa rõ'
}
