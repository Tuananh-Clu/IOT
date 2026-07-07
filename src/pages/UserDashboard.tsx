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
  const { currentSession: hookCurrentSession, history } = useResidentParking(residentId, data)
  const { payments, totalPaid, totalPending, groupByMonth } = useResidentPayments(residentId, data)

  if (!resident) {
    return (
      <Panel title="Không tìm thấy cư dân" subtitle="Tài khoản này chưa được liên kết với hồ sơ cư dân.">
        <p className="text-lot-muted">Vui lòng nhờ quản trị viên gán giá trị account.resident_id.</p>
      </Panel>
    )
  }

  const assignedSlot = data.slots.find((slot) => slot.resident_id === resident.id)
  const currentSession = hookCurrentSession ?? history.find((item) => item.status === 'parked') ?? null
  const monthlySpend = groupByMonth(6).map((item) => ({ month: item.month.slice(5), amount: item.amount }))
  const minutesParked = currentSession ? Math.max(1, Math.floor((Date.now() - new Date(currentSession.time_in).getTime()) / 60_000)) : 0

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="rounded-control border border-lot-divider bg-black/20 p-4">
        <div className="lane-stripe mb-4 w-40" />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-lot-muted">Thẻ gửi xe cư dân</p>
            <h1 className="digital-text text-4xl font-bold text-lot-lane">{resident.full_name}</h1>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <Info icon={Home} label="Căn hộ" value={resident.apartment} />
            <Info icon={Phone} label="Điện thoại" value={resident.phone} />
            <Info icon={CreditCard} label="RFID" value={maskRfid(resident.rfid_uid)} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Ô đã gán" value={assignedSlot?.slot_number ?? 'Chưa có'} helper={assignedSlot ? translateSlotStatus(assignedSlot.status) : 'Chưa có ô cố định'} icon={CarFront} tone={assignedSlot?.status === 'occupied' ? 'occupied' : 'empty'} />
        <Metric label="Xe hiện tại" value={currentSession ? 'ĐANG ĐỖ' : 'ĐÃ RA'} helper={currentSession?.license_plate ?? 'Không có phiên đang hoạt động'} tone={currentSession ? 'reserved' : 'lane'} />
        <Metric label="Thời gian đỗ" value={currentSession ? `${Math.floor(minutesParked / 60)}g ${minutesParked % 60}p` : '--'} helper="Ước tính trực tiếp" tone="sensor" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Chi tiêu theo tháng" subtitle="Lịch sử thanh toán theo mã cư dân">
          <AreaPanelChart data={monthlySpend} xKey="month" yKey="amount" color="#2FBF71" />
        </Panel>
        <Panel title="Tóm tắt thanh toán" subtitle="Dùng tab Thanh toán để checkout">
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Đã thanh toán" value={formatCompact(totalPaid)} icon={WalletCards} tone="empty" />
            <Metric label="Đang chờ" value={formatCompact(totalPending)} tone={totalPending > 0 ? 'reserved' : 'lane'} />
          </div>
          <div className="mt-4 space-y-2">
            {payments.slice(0, 4).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-3 rounded-control border border-lot-divider bg-black/18 p-3">
                <div>
                  <p className="font-semibold text-lot-lane">{formatVND(Number(payment.amount))}</p>
                  <p className="text-sm text-lot-muted">{translatePaymentMethod(payment.payment_method)} - {new Date(payment.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
                <StatusPill status={payment.status} />
              </div>
            ))}
            {payments.length === 0 && <p className="text-sm text-lot-muted">Chưa có lịch sử thanh toán.</p>}
          </div>
        </Panel>
      </div>

      <Panel title="Lịch sử đỗ xe" subtitle="Các bản ghi parking_history của cư dân">
        <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
          <div className="rounded-control border border-lot-divider bg-black/18 p-4">
            <p className="mb-3 text-sm text-lot-muted">Trạng thái xe hiện tại</p>
            {currentSession ? (
              <div>
                <p className="digital-text text-4xl font-bold text-lot-reserved">{currentSession.license_plate}</p>
                <p className="text-lot-muted">Ô {currentSession.slot_number}</p>
                <p className="mt-3 text-sm">Đỗ từ {new Date(currentSession.time_in).toLocaleString('vi-VN')}</p>
              </div>
            ) : (
              <div>
                <p className="digital-text text-4xl font-bold text-lot-empty">TRỐNG</p>
                <p className="text-lot-muted">Không có xe đang đỗ.</p>
              </div>
            )}
          </div>

          <TableShell>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-black/24 text-xs uppercase text-lot-muted">
                <tr>
                  <th className="px-3 py-3">Giờ vào</th>
                  <th className="px-3 py-3">Giờ ra</th>
                  <th className="px-3 py-3">Biển số</th>
                  <th className="px-3 py-3">Ô đỗ</th>
                  <th className="px-3 py-3">Phí</th>
                  <th className="px-3 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lot-divider">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-lot-lane/5">
                    <td className="px-3 py-3 text-lot-muted">{new Date(item.time_in).toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-3 text-lot-muted">{item.time_out ? new Date(item.time_out).toLocaleString('vi-VN') : 'Đang đỗ'}</td>
                    <td className="px-3 py-3 digital-text text-lg">{item.license_plate}</td>
                    <td className="px-3 py-3">{item.slot_number}</td>
                    <td className="px-3 py-3">{formatVND(Number((item as { fee?: number }).fee ?? 0))}</td>
                    <td className="px-3 py-3"><StatusPill status={item.status} /></td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-lot-muted">Chưa có lịch sử đỗ xe</td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableShell>
        </div>
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
  if (!value || value.length <= 4) return '****'
  return `${value.slice(0, 2)}****${value.slice(-2)}`
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  return formatVND(value)
}

function translatePaymentMethod(value?: string | null) {
  const normalized = (value ?? '').toLowerCase()
  if (normalized.includes('momo')) return 'MoMo'
  if (normalized.includes('bank')) return 'Chuyển khoản'
  if (normalized.includes('card')) return 'Thẻ'
  if (normalized.includes('cash')) return 'Tiền mặt'
  if (!normalized || normalized === 'unknown') return 'Chưa rõ'
  return value ?? 'Chưa rõ'
}

function translateSlotStatus(value?: string | null) {
  const normalized = (value ?? '').toLowerCase()
  if (normalized.includes('occupied')) return 'Đang có xe'
  if (normalized.includes('reserved')) return 'Đã giữ chỗ'
  if (normalized.includes('empty') || normalized.includes('free')) return 'Còn trống'
  return value ?? 'Chưa rõ'
}
