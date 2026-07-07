import { useMemo, useState } from 'react'
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Landmark,
  QrCode,
  ReceiptText,
  Search,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from 'lucide-react'
import type { DashboardData } from '@/api/dashboard'
import { useResidentPayments } from '@/hooks/useResidentPayments'
import { useResidentParking } from '@/hooks/useResidentParking'
import { useResidentProfile } from '@/hooks/useResidentProfile'
import { calculateFee, formatVND } from '@/lib/formatters'
import type { PaymentHistory } from '@/types'
import { AreaPanelChart, DonutPanelChart } from '@/components/charts/Charts'
import { Metric, Panel, StatusPill, TableShell } from '@/components/ui/Primitives'

interface CustomerPaymentsProps {
  residentId: string
  data: DashboardData
}

type MethodKey = 'momo' | 'banking' | 'card' | 'cash'
type StatusFilter = 'all' | 'pending' | 'paid'

const paymentMethods: { id: MethodKey; label: string; icon: typeof Smartphone }[] = [
  { id: 'momo', label: 'MoMo', icon: Smartphone },
  { id: 'banking', label: 'Chuyển khoản', icon: Landmark },
  { id: 'card', label: 'Thẻ', icon: CreditCard },
  { id: 'cash', label: 'Tiền mặt', icon: Banknote },
]

export function CustomerPayments({ residentId, data }: CustomerPaymentsProps) {
  const { resident } = useResidentProfile(residentId, data)
  const { payments, groupByMethod } = useResidentPayments(residentId, data)
  const { currentSession: hookCurrentSession, history } = useResidentParking(residentId, data)
  const [method, setMethod] = useState<MethodKey>('momo')
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null)
  const [paidIds, setPaidIds] = useState<number[]>([])
  const [paidMethods, setPaidMethods] = useState<Record<number, MethodKey>>({})
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [receiptCode, setReceiptCode] = useState<string | null>(null)

  const displayPayments = useMemo(
    () =>
      payments.map((payment) =>
        paidIds.includes(payment.id)
          ? { ...payment, payment_method: paidMethods[payment.id] ?? payment.payment_method, status: 'paid', paid_at: new Date().toISOString() }
          : payment,
      ),
    [paidIds, paidMethods, payments],
  )
  const currentSession = hookCurrentSession ?? history.find((item) => item.status === 'parked') ?? null
  const pendingPayments = displayPayments.filter((payment) => payment.status === 'pending')
  const selectedPayment = pendingPayments.find((payment) => payment.id === selectedPaymentId) ?? pendingPayments[0] ?? null
  const liveMinutes = currentSession ? Math.max(1, Math.floor((Date.now() - new Date(currentSession.time_in).getTime()) / 60_000)) : 0
  const liveEstimate = currentSession ? calculateFee(liveMinutes) : 0
  const checkoutAmount = selectedPayment ? Number(selectedPayment.amount) : liveEstimate
  const totalPaid = displayPayments.filter((payment) => payment.status === 'paid').reduce((sum, payment) => sum + Number(payment.amount), 0)
  const totalPending = pendingPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)

  const filteredPayments = displayPayments.filter((payment) => {
    const haystack = [
      payment.payment_method,
      payment.status,
      payment.parking_history?.slot_number,
      payment.parking_history?.license_plate,
      String(payment.amount),
    ]
      .join(' ')
      .toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    return matchesQuery && matchesStatus
  })

  const methodData = groupByMethod().map((item, index) => ({
    name: translatePaymentMethod(item.method),
    value: item.count,
    color: ['#2C7DA0', '#2FBF71', '#F0B429', '#D64545'][index % 4],
  }))
  const monthlyData = buildMonthlyPayments(displayPayments)

  const handlePay = () => {
    if (selectedPayment) {
      setPaidIds((current) => Array.from(new Set([...current, selectedPayment.id])))
      setPaidMethods((current) => ({ ...current, [selectedPayment.id]: method }))
      setReceiptCode(`PAY-${selectedPayment.id}-${Date.now().toString().slice(-5)}`)
      return
    }
    if (checkoutAmount > 0) {
      setReceiptCode(`LIVE-${Date.now().toString().slice(-6)}`)
    }
  }

  if (!resident) {
    return (
      <Panel title="Không tìm thấy tài khoản thanh toán" subtitle="Tài khoản này chưa được liên kết với hồ sơ cư dân.">
        <p className="text-lot-muted">Vui lòng nhờ quản trị viên gán resident_id cho tài khoản đăng nhập này.</p>
      </Panel>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="lane-stripe mb-3 w-40" />
          <h1 className="digital-text text-4xl font-bold text-lot-lane">Trung tâm thanh toán</h1>
          <p className="text-lot-muted">{resident.full_name} - căn hộ {resident.apartment}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Đã thanh toán" value={formatCompact(totalPaid)} icon={WalletCards} tone="empty" />
          <Metric label="Đang chờ" value={formatCompact(totalPending)} icon={ReceiptText} tone={totalPending > 0 ? 'reserved' : 'lane'} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Panel title="Thanh toán" subtitle="Chọn hoá đơn và phương thức thanh toán">
          <div className="space-y-4">
            <div className="rounded-control border border-lot-divider bg-black/18 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-lot-muted">Số tiền cần thanh toán</p>
                  <p className="digital-text text-4xl font-bold text-lot-reserved">{formatVND(checkoutAmount)}</p>
                </div>
                <QrCode className="h-12 w-12 text-lot-lane" />
              </div>
              <p className="text-sm text-lot-muted">
                {selectedPayment
                  ? `Hoá đơn #${selectedPayment.id} - ${selectedPayment.parking_history?.slot_number ?? 'bãi xe'}`
                  : currentSession
                    ? `Ước tính hiện tại cho xe ${currentSession.license_plate}`
                    : 'Không có hoá đơn đang chờ. Cổng thanh toán sẽ sẵn sàng cho phiên đỗ tiếp theo.'}
              </p>
            </div>

            {pendingPayments.length > 0 && (
              <div className="grid gap-2">
                {pendingPayments.slice(0, 4).map((payment) => (
                  <button
                    key={payment.id}
                    type="button"
                    onClick={() => setSelectedPaymentId(payment.id)}
                    className={`focus-track flex items-center justify-between gap-3 rounded-control border p-3 text-left ${
                      selectedPayment?.id === payment.id
                        ? 'border-lot-reserved bg-lot-reserved/10'
                        : 'border-lot-divider bg-black/18 hover:bg-lot-lane/5'
                    }`}
                  >
                    <span>
                      <span className="block font-semibold text-lot-lane">{formatVND(Number(payment.amount))}</span>
                      <span className="text-sm text-lot-muted">{new Date(payment.created_at).toLocaleDateString('vi-VN')}</span>
                    </span>
                    <StatusPill status={payment.status} />
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id)}
                    className={`focus-track flex items-center gap-2 rounded-control border px-3 py-3 text-sm font-semibold ${
                      method === item.id ? 'border-lot-empty bg-lot-empty/12 text-lot-empty' : 'border-lot-divider text-lot-muted hover:text-lot-lane'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={checkoutAmount <= 0}
              className="focus-track flex w-full items-center justify-center gap-2 rounded-control bg-lot-reserved px-4 py-3 font-bold text-lot-asphalt disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              Xác nhận thanh toán
            </button>

            {receiptCode && (
              <div className="flex items-center gap-3 rounded-control border border-lot-empty/40 bg-lot-empty/10 p-3 text-sm text-lot-empty">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Đã ghi nhận thanh toán. Mã biên nhận {receiptCode}</span>
              </div>
            )}
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Thanh toán theo tháng" subtitle="Hoá đơn đã thanh toán và thanh toán mô phỏng">
            <AreaPanelChart data={monthlyData} xKey="month" yKey="amount" color="#2FBF71" />
          </Panel>
          <Panel title="Phương thức thanh toán" subtitle="Tỷ trọng phương thức đã dùng">
            <DonutPanelChart data={methodData} />
          </Panel>
        </div>
      </div>

      <Panel
        title="Lịch sử thanh toán"
        subtitle="Tìm theo biển số, ô đỗ, phương thức, trạng thái hoặc số tiền"
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lot-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="focus-track w-full rounded-control border border-lot-divider bg-lot-asphalt px-9 py-2 text-sm text-lot-lane placeholder:text-lot-muted"
                placeholder="Tìm kiếm"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="focus-track rounded-control border border-lot-divider bg-lot-asphalt px-3 py-2 text-sm text-lot-lane"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang chờ</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
        }
      >
        <TableShell>
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-black/24 text-xs uppercase text-lot-muted">
              <tr>
                <th className="px-3 py-3">Ngày tạo</th>
                <th className="px-3 py-3">Số tiền</th>
                <th className="px-3 py-3">Phương thức</th>
                <th className="px-3 py-3">Xe</th>
                <th className="px-3 py-3">Ô đỗ</th>
                <th className="px-3 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lot-divider">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-lot-lane/5">
                  <td className="px-3 py-3 text-lot-muted">{new Date(payment.created_at).toLocaleString('vi-VN')}</td>
                  <td className="px-3 py-3 font-semibold text-lot-lane">{formatVND(Number(payment.amount))}</td>
                  <td className="px-3 py-3 capitalize">{translatePaymentMethod(payment.payment_method)}</td>
                  <td className="px-3 py-3 digital-text text-lg">{payment.parking_history?.license_plate ?? 'Không có'}</td>
                  <td className="px-3 py-3">{payment.parking_history?.slot_number ?? 'Không có'}</td>
                  <td className="px-3 py-3"><StatusPill status={payment.status} /></td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-lot-muted">Không có thanh toán nào khớp bộ lọc</td>
                </tr>
              )}
            </tbody>
          </table>
        </TableShell>
      </Panel>
    </div>
  )
}

function buildMonthlyPayments(payments: PaymentHistory[]) {
  const now = new Date()
  return Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = payments
      .filter((payment) => payment.status === 'paid')
      .filter((payment) => {
        const value = payment.paid_at ?? payment.created_at
        return value.startsWith(key)
      })
      .reduce((sum, payment) => sum + Number(payment.amount), 0)
    return { month: key.slice(5), amount }
  })
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
