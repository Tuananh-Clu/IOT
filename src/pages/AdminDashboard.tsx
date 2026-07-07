import { useMemo, useState } from 'react'
import { CarFront, Clock3, Users, WalletCards } from 'lucide-react'
import type { DashboardData } from '@/api/dashboard'
import { useParkingHistory } from '@/hooks/useParkingHistory'
import { usePaymentsOverview } from '@/hooks/usePaymentsOverview'
import { useSlotsOverview } from '@/hooks/useSlotsOverview'
import { formatVND } from '@/lib/formatters'
import { AreaPanelChart, BarPanelChart, DonutPanelChart, Heatmap, TwoLineChart } from '@/components/charts/Charts'
import { ParkingLotMap } from '@/components/dashboard/ParkingLotMap'
import { Metric, Panel, StatusPill, TableShell } from '@/components/ui/Primitives'

type RangeKey = 'today' | '7d' | '30d'

export function AdminDashboard({ data }: { data: DashboardData }) {
  const [range, setRange] = useState<RangeKey>('7d')
  const { stats, slots } = useSlotsOverview(data)
  const { currentlyParked, buildHeatmap } = useParkingHistory(data)
  const { payments, totalRevenue, groupByStatus, groupByMethod } = usePaymentsOverview(data)

  const days = range === 'today' ? 1 : range === '7d' ? 7 : 30
  const traffic = useMemo(() => buildTraffic(data.history), [data.history])
  const revenue = useMemo(() => buildRevenue(payments, days), [payments, days])
  const topSlots = useMemo(() => buildTopSlots(data.history), [data.history])
  const methodData = groupByMethod().map((item, index) => ({
    name: item.method || 'unknown',
    value: item.count,
    color: ['#2C7DA0', '#F0B429', '#2FBF71', '#D64545'][index % 4],
  }))
  const statusData = groupByStatus().map((item) => ({
    name: item.status || 'unknown',
    value: item.count,
    color: item.status === 'success' || item.status === 'paid' ? '#2FBF71' : item.status === 'pending' ? '#F0B429' : '#D64545',
  }))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="lane-stripe mb-3 w-44" />
          <h1 className="digital-text text-4xl font-bold text-lot-lane">Management Overview</h1>
          <p className="text-lot-muted">Live slot state, traffic flow, payments, and resident assignment.</p>
        </div>
        <div className="control-surface flex items-center gap-2 rounded-control p-2">
          {(['today', '7d', '30d'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={`focus-track rounded-control px-3 py-2 text-sm font-semibold ${
                range === item ? 'bg-lot-reserved text-lot-asphalt' : 'text-lot-muted hover:text-lot-lane'
              }`}
            >
              {item === 'today' ? 'Today' : item === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Occupancy" value={`${stats.occupancyRate}%`} helper={`${stats.occupied} of ${stats.total} slots occupied`} icon={CarFront} tone={stats.occupancyRate > 80 ? 'occupied' : 'empty'} />
        <Metric label="Currently parked" value={currentlyParked.length} helper="Realtime session table" icon={Clock3} tone="reserved" />
        <Metric label="Residents" value={data.residents.length} helper="Registered profiles" icon={Users} tone="lane" />
        <Metric label="Revenue" value={formatCompact(totalRevenue)} helper="Successful payments" icon={WalletCards} tone="sensor" />
      </div>

      <Panel title="Real-time floor plan" subtitle="Custom lot layout colored by parking_slot.status">
        <ParkingLotMap slots={slots} history={data.history} />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Hourly in/out traffic" subtitle="Entries from time_in, exits from time_out">
          <TwoLineChart data={traffic} xKey="hour" firstKey="entries" secondKey="exits" />
        </Panel>
        <Panel title="Peak hours by weekday" subtitle="24 hour by 7 day density">
          <Heatmap matrix={buildHeatmap()} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Revenue over time" subtitle={`Range: ${range}`}>
          <AreaPanelChart data={revenue} xKey="label" yKey="amount" color="#2FBF71" />
        </Panel>
        <Panel title="Most-used slots" subtitle="Top 10 by parking_history">
          <BarPanelChart data={topSlots} xKey="slot" yKey="count" layout="vertical" color="#F0B429" />
        </Panel>
        <Panel title="Payment status">
          <DonutPanelChart data={statusData} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Payment methods" subtitle="Count by payment method">
          <DonutPanelChart data={methodData} />
        </Panel>
        <Panel title="Currently parked vehicles" subtitle="Filter-ready realtime table" className="xl:col-span-2">
          <TableShell>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-black/24 text-xs uppercase text-lot-muted">
                <tr>
                  <th className="px-3 py-3">Slot</th>
                  <th className="px-3 py-3">Plate</th>
                  <th className="px-3 py-3">Resident</th>
                  <th className="px-3 py-3">Time in</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lot-divider">
                {currentlyParked.map((item) => (
                  <tr key={item.id} className="hover:bg-lot-lane/5">
                    <td className="px-3 py-3 font-semibold text-lot-lane">{item.slot_number}</td>
                    <td className="px-3 py-3 digital-text text-lg">{item.license_plate}</td>
                    <td className="px-3 py-3 text-lot-muted">{item.resident?.full_name ?? 'Visitor'}</td>
                    <td className="px-3 py-3 text-lot-muted">{new Date(item.time_in).toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-3"><StatusPill status={item.status} /></td>
                  </tr>
                ))}
                {currentlyParked.length === 0 && <EmptyRow colSpan={5} text="No active parked vehicles" />}
              </tbody>
            </table>
          </TableShell>
        </Panel>
      </div>

      <Panel title="Residents and assigned slots" subtitle="resident joined with parking_slot">
        <TableShell>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-black/24 text-xs uppercase text-lot-muted">
              <tr>
                <th className="px-3 py-3">Resident</th>
                <th className="px-3 py-3">Apartment</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">RFID</th>
                <th className="px-3 py-3">Assigned slot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lot-divider">
              {data.residents.map((resident) => {
                const assigned = slots.find((slot) => slot.resident_id === resident.id)
                return (
                  <tr key={resident.id} className="hover:bg-lot-lane/5">
                    <td className="px-3 py-3 font-semibold text-lot-lane">{resident.full_name}</td>
                    <td className="px-3 py-3 text-lot-muted">{resident.apartment}</td>
                    <td className="px-3 py-3 text-lot-muted">{resident.phone}</td>
                    <td className="px-3 py-3 digital-text">{maskRfid(resident.rfid_uid)}</td>
                    <td className="px-3 py-3">{assigned ? `${assigned.slot_number} (${assigned.status})` : 'Visitor / none'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableShell>
      </Panel>
    </div>
  )
}

function buildTraffic(history: DashboardData['history']) {
  return Array.from({ length: 24 }).map((_, hour) => {
    const entries = history.filter((item) => new Date(item.time_in).getHours() === hour).length
    const exits = history.filter((item) => item.time_out && new Date(item.time_out).getHours() === hour).length
    return { hour: `${hour}:00`, entries, exits }
  })
}

function buildRevenue(payments: DashboardData['payments'], days: number) {
  const now = new Date()
  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (days - 1 - index))
    const key = date.toISOString().split('T')[0]
    const amount = payments
      .filter((item) => (item.status === 'success' || item.status === 'paid') && (item.paid_at ?? item.created_at).startsWith(key))
      .reduce((sum, item) => sum + Number(item.amount), 0)
    return { label: days === 1 ? date.toLocaleTimeString('vi-VN', { hour: '2-digit' }) : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), amount }
  })
}

function buildTopSlots(history: DashboardData['history']) {
  const counts = new Map<string, number>()
  for (const item of history) counts.set(item.slot_number, (counts.get(item.slot_number) ?? 0) + 1)
  return Array.from(counts.entries())
    .map(([slot, count]) => ({ slot, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function formatCompact(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  return formatVND(amount)
}

function maskRfid(value: string) {
  if (value.length <= 4) return '****'
  return `${value.slice(0, 2)}****${value.slice(-2)}`
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-8 text-center text-lot-muted">{text}</td>
    </tr>
  )
}
