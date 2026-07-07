import { CarFront, CreditCard, Home, Phone, WalletCards } from 'lucide-react'
import type { DashboardData } from '@/api/dashboard'
import { useResidentPayments } from '@/hooks/useResidentPayments'
import { useResidentParking } from '@/hooks/useResidentParking'
import { useResidentProfile } from '@/hooks/useResidentProfile'
import { formatVND } from '@/lib/formatters'
import { AreaPanelChart } from '@/components/charts/Charts'
import { Metric, Panel, StatusPill, TableShell } from '@/components/ui/Primitives'

interface UserDashboardProps {
  residentId: string
  data: DashboardData
}

export function UserDashboard({ residentId, data }: UserDashboardProps) {
  const { resident } = useResidentProfile(residentId, data)
  const { currentSession, history } = useResidentParking(residentId, data)
  const { payments, totalPaid, totalPending, groupByMonth } = useResidentPayments(residentId, data)

  if (!resident) {
    return (
      <Panel title="Resident not found" subtitle="This account is not linked to a resident profile.">
        <p className="text-lot-muted">Ask an administrator to link the account.resident_id value.</p>
      </Panel>
    )
  }

  const assignedSlot = data.slots.find((slot) => slot.resident_id === resident.id)
  const monthlySpend = groupByMonth(6).map((item) => ({ month: item.month.slice(5), amount: item.amount }))
  const minutesParked = currentSession ? Math.max(1, Math.floor((Date.now() - new Date(currentSession.time_in).getTime()) / 60_000)) : 0

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="rounded-control border border-lot-divider bg-black/20 p-4">
        <div className="lane-stripe mb-4 w-40" />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-lot-muted">Resident parking card</p>
            <h1 className="digital-text text-4xl font-bold text-lot-lane">{resident.full_name}</h1>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <Info icon={Home} label="Apartment" value={resident.apartment} />
            <Info icon={Phone} label="Phone" value={resident.phone} />
            <Info icon={CreditCard} label="RFID" value={maskRfid(resident.rfid_uid)} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Assigned slot" value={assignedSlot?.slot_number ?? 'None'} helper={assignedSlot?.status ?? 'No permanent slot'} icon={CarFront} tone={assignedSlot?.status === 'occupied' ? 'occupied' : 'empty'} />
        <Metric label="Current vehicle" value={currentSession ? 'PARKED' : 'OUT'} helper={currentSession?.license_plate ?? 'No active session'} tone={currentSession ? 'reserved' : 'lane'} />
        <Metric label="Parked duration" value={currentSession ? `${Math.floor(minutesParked / 60)}h ${minutesParked % 60}m` : '--'} helper="Live estimate" tone="sensor" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Monthly spend" subtitle="Own payment_history by resident_id">
          <AreaPanelChart data={monthlySpend} xKey="month" yKey="amount" color="#2FBF71" />
        </Panel>
        <Panel title="Payment balance" subtitle="Resident-only payment totals">
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Total paid" value={formatCompact(totalPaid)} icon={WalletCards} tone="empty" />
            <Metric label="Pending" value={formatCompact(totalPending)} tone={totalPending > 0 ? 'reserved' : 'lane'} />
          </div>
          <div className="mt-4 space-y-2">
            {payments.slice(0, 4).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-3 rounded-control border border-lot-divider bg-black/18 p-3">
                <div>
                  <p className="font-semibold text-lot-lane">{formatVND(Number(payment.amount))}</p>
                  <p className="text-sm text-lot-muted">{payment.payment_method || 'unknown'} · {new Date(payment.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
                <StatusPill status={payment.status} />
              </div>
            ))}
            {payments.length === 0 && <p className="text-sm text-lot-muted">No payment records yet.</p>}
          </div>
        </Panel>
      </div>

      <Panel title="Parking history" subtitle="Own parking_history records">
        <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
          <div className="rounded-control border border-lot-divider bg-black/18 p-4">
            <p className="mb-3 text-sm text-lot-muted">Current vehicle status</p>
            {currentSession ? (
              <div>
                <p className="digital-text text-4xl font-bold text-lot-reserved">{currentSession.license_plate}</p>
                <p className="text-lot-muted">Slot {currentSession.slot_number}</p>
                <p className="mt-3 text-sm">Parked since {new Date(currentSession.time_in).toLocaleString('vi-VN')}</p>
              </div>
            ) : (
              <div>
                <p className="digital-text text-4xl font-bold text-lot-empty">CLEAR</p>
                <p className="text-lot-muted">No active parked vehicle.</p>
              </div>
            )}
          </div>

          <TableShell>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-black/24 text-xs uppercase text-lot-muted">
                <tr>
                  <th className="px-3 py-3">Time in</th>
                  <th className="px-3 py-3">Time out</th>
                  <th className="px-3 py-3">Plate</th>
                  <th className="px-3 py-3">Slot</th>
                  <th className="px-3 py-3">Fee</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lot-divider">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-lot-lane/5">
                    <td className="px-3 py-3 text-lot-muted">{new Date(item.time_in).toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-3 text-lot-muted">{item.time_out ? new Date(item.time_out).toLocaleString('vi-VN') : 'Still parked'}</td>
                    <td className="px-3 py-3 digital-text text-lg">{item.license_plate}</td>
                    <td className="px-3 py-3">{item.slot_number}</td>
                    <td className="px-3 py-3">{formatVND(Number((item as { fee?: number }).fee ?? 0))}</td>
                    <td className="px-3 py-3"><StatusPill status={item.status} /></td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-lot-muted">No parking history yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableShell>
        </div>
      </Panel>

      <Panel title="Payment history" subtitle="Filterable by status and method in UI scope">
        <TableShell>
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-black/24 text-xs uppercase text-lot-muted">
              <tr>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Method</th>
                <th className="px-3 py-3">Linked slot</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lot-divider">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-lot-lane/5">
                  <td className="px-3 py-3 text-lot-muted">{new Date(payment.created_at).toLocaleString('vi-VN')}</td>
                  <td className="px-3 py-3 font-semibold text-lot-lane">{formatVND(Number(payment.amount))}</td>
                  <td className="px-3 py-3 capitalize">{payment.payment_method}</td>
                  <td className="px-3 py-3">{payment.parking_history?.slot_number ?? 'N/A'}</td>
                  <td className="px-3 py-3"><StatusPill status={payment.status} /></td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-lot-muted">No payment history yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </TableShell>
      </Panel>
    </div>
  )
}

function Info({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string }) {
  return (
    <div className="rounded-control border border-lot-divider bg-black/18 p-3">
      <Icon className="mb-2 h-4 w-4 text-lot-reserved" />
      <p className="text-xs text-lot-muted">{label}</p>
      <p className="font-semibold text-lot-lane">{value}</p>
    </div>
  )
}

function maskRfid(value: string) {
  if (value.length <= 4) return '****'
  return `${value.slice(0, 2)}****${value.slice(-2)}`
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  return formatVND(value)
}
