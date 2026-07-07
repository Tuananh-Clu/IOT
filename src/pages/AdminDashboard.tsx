import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  BellRing,
  CarFront,
  Clock3,
  Gauge,
  Radio,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react'
import type { DashboardData } from '@/api/dashboard'
import { useParkingHistory } from '@/hooks/useParkingHistory'
import { usePaymentsOverview } from '@/hooks/usePaymentsOverview'
import { useSlotsOverview } from '@/hooks/useSlotsOverview'
import { formatVND } from '@/lib/formatters'
import { AreaPanelChart, BarPanelChart, DonutPanelChart, Heatmap, TwoLineChart } from '@/components/charts/Charts'
import { ParkingLotMap } from '@/components/dashboard/ParkingLotMap'
import { Metric, Panel, StatusPill, TableShell } from '@/components/ui/Primitives'

type RangeKey = 'today' | '7d' | '30d'
type ScenarioKey = 'live' | 'rush' | 'vip' | 'maintenance'
type VehicleFilter = 'all' | 'resident' | 'visitor'

const scenarios: Record<ScenarioKey, { label: string; helper: string; queue: number; revenueBoost: number; risk: number }> = {
  live: {
    label: 'Trực tiếp',
    helper: 'Dùng dữ liệu cảm biến hiện tại',
    queue: 2,
    revenueBoost: 1,
    risk: 18,
  },
  rush: {
    label: 'Giờ cao điểm',
    helper: 'Mô phỏng nhiều ô trống chuyển sang có xe',
    queue: 11,
    revenueBoost: 1.18,
    risk: 62,
  },
  vip: {
    label: 'Sự kiện VIP',
    helper: 'Giữ ô phía trước và siết quyền ra vào',
    queue: 6,
    revenueBoost: 1.32,
    risk: 38,
  },
  maintenance: {
    label: 'Bảo trì',
    helper: 'Đóng một cụm ô để kiểm tra',
    queue: 8,
    revenueBoost: 0.82,
    risk: 74,
  },
}

export function AdminDashboard({ data }: { data: DashboardData }) {
  const [range, setRange] = useState<RangeKey>('7d')
  const [scenario, setScenario] = useState<ScenarioKey>('live')
  const [staffing, setStaffing] = useState(3)
  const [priceMultiplier, setPriceMultiplier] = useState(100)
  const [vehicleQuery, setVehicleQuery] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>('all')
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null)
  const [gateLog, setGateLog] = useState<string[]>(['Hệ thống đã sẵn sàng - đầu đọc RFID đã đồng bộ'])
  const { slots } = useSlotsOverview(data)
  const { currentlyParked, buildHeatmap } = useParkingHistory(data)
  const { payments, totalRevenue, groupByStatus, groupByMethod } = usePaymentsOverview(data)

  const days = range === 'today' ? 1 : range === '7d' ? 7 : 30
  const scenarioConfig = scenarios[scenario]
  const displaySlots = useMemo(() => applyScenario(slots, scenario), [scenario, slots])
  const displayStats = useMemo(() => buildSlotStats(displaySlots), [displaySlots])
  const traffic = useMemo(() => buildTraffic(data.history), [data.history])
  const revenue = useMemo(() => buildRevenue(payments, days), [payments, days])
  const topSlots = useMemo(() => buildTopSlots(data.history), [data.history])
  const parkedRecords = useMemo(
    () => uniqueById([...currentlyParked, ...data.history.filter((item) => item.status === 'parked')]),
    [currentlyParked, data.history],
  )
  const projectedQueue = Math.max(0, scenarioConfig.queue - staffing * 2)
  const projectedRevenue = Math.round(totalRevenue * scenarioConfig.revenueBoost * (priceMultiplier / 100))
  const pressureScore = Math.min(100, Math.round(displayStats.occupancyRate * 0.55 + scenarioConfig.risk * 0.35 + projectedQueue * 2.5))
  const filteredParked = useMemo(() => {
    return parkedRecords.filter((item) => {
      const query = vehicleQuery.toLowerCase()
      const matchesQuery = `${item.slot_number} ${item.license_plate} ${item.resident?.full_name ?? 'khach'}`.toLowerCase().includes(query)
      const matchesFilter =
        vehicleFilter === 'all' ||
        (vehicleFilter === 'resident' && Boolean(item.resident_id)) ||
        (vehicleFilter === 'visitor' && !item.resident_id)
      return matchesQuery && matchesFilter
    })
  }, [parkedRecords, vehicleFilter, vehicleQuery])
  const alertFeed = useMemo(
    () => buildAlertFeed(displayStats.occupancyRate, projectedQueue, pressureScore, data.payments.filter((item) => item.status === 'pending').length),
    [data.payments, displayStats.occupancyRate, pressureScore, projectedQueue],
  )
  const methodData = groupByMethod().map((item, index) => ({
    name: translatePaymentMethod(item.method),
    value: item.count,
    color: ['#2C7DA0', '#F0B429', '#2FBF71', '#D64545'][index % 4],
  }))
  const statusData = groupByStatus().map((item) => ({
    name: translatePaymentStatus(item.status),
    value: item.count,
    color: item.status === 'success' || item.status === 'paid' ? '#2FBF71' : item.status === 'pending' ? '#F0B429' : '#D64545',
  }))
  const selectedPayment = payments.find((payment) => payment.id === selectedPaymentId) ?? payments[0] ?? null
  const pushLog = (message: string) => {
    const stamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setGateLog((current) => [`${stamp} - ${message}`, ...current].slice(0, 6))
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="lane-stripe mb-3 w-44" />
          <h1 className="digital-text text-4xl font-bold text-lot-lane">Tổng quan vận hành</h1>
          <p className="text-lot-muted">Theo dõi ô đỗ, luồng xe, thanh toán và phân bổ cư dân theo thời gian thực.</p>
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
              {item === 'today' ? 'Hôm nay' : item === '7d' ? '7 ngày' : '30 ngày'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Tỷ lệ lấp đầy" value={`${displayStats.occupancyRate}%`} helper={`${displayStats.occupied}/${displayStats.total} ô đang có xe${scenario === 'live' ? '' : ' trong mô phỏng'}`} icon={CarFront} tone={displayStats.occupancyRate > 80 ? 'occupied' : 'empty'} />
        <Metric label="Xe đang đỗ" value={parkedRecords.length} helper="Bảng phiên đỗ thời gian thực" icon={Clock3} tone="reserved" />
        <Metric label="Cư dân" value={data.residents.length} helper="Hồ sơ đã đăng ký" icon={Users} tone="lane" />
        <Metric label="Doanh thu dự kiến" value={formatCompact(projectedRevenue)} helper={`${priceMultiplier}% biểu phí - ${scenarioConfig.label}`} icon={WalletCards} tone="sensor" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel
          title="Sơ đồ bãi xe thời gian thực"
          subtitle={scenario === 'live' ? 'Sơ đồ bãi xe được tô màu theo trạng thái ô đỗ' : `Chế độ mô phỏng: ${scenarioConfig.helper}`}
          action={<StatusPill status={scenario === 'live' ? 'online' : 'pending'} label={scenario === 'live' ? 'Trực tiếp' : 'Mô phỏng'} />}
        >
          <ParkingLotMap slots={displaySlots} history={data.history} />
        </Panel>

        <Panel title="Buồng điều phối" subtitle="Thử kịch bản vận hành và thao tác nhanh">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(scenarios) as ScenarioKey[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setScenario(item)
                    pushLog(`Đã tải kịch bản ${scenarios[item].label}`)
                  }}
                  className={`focus-track rounded-control border px-3 py-3 text-left ${
                    scenario === item ? 'border-lot-reserved bg-lot-reserved/12 text-lot-reserved' : 'border-lot-divider text-lot-muted hover:text-lot-lane'
                  }`}
                >
                  <span className="block font-semibold">{scenarios[item].label}</span>
                  <span className="block text-xs">{scenarios[item].helper}</span>
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniGauge label="Áp lực" value={pressureScore} icon={Gauge} tone={pressureScore > 70 ? 'occupied' : pressureScore > 45 ? 'reserved' : 'empty'} />
              <MiniGauge label="Hàng chờ cổng" value={projectedQueue} suffix="xe" icon={Radio} tone={projectedQueue > 8 ? 'occupied' : 'sensor'} />
              <MiniGauge label="Ô còn trống" value={displayStats.empty} icon={ShieldCheck} tone={displayStats.empty < 3 ? 'reserved' : 'empty'} />
            </div>

            <div className="space-y-3 rounded-control border border-lot-divider bg-black/18 p-3">
              <label className="block">
                <span className="mb-2 flex justify-between text-sm text-lot-muted">
                  <span>Nhân sự tại bãi</span>
                  <span className="digital-text text-lot-lane">{staffing}</span>
                </span>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={staffing}
                  onChange={(event) => setStaffing(Number(event.target.value))}
                  className="w-full accent-[#F0B429]"
                />
              </label>
              <label className="block">
                <span className="mb-2 flex justify-between text-sm text-lot-muted">
                  <span>Hệ số biểu phí</span>
                  <span className="digital-text text-lot-lane">{priceMultiplier}%</span>
                </span>
                <input
                  type="range"
                  min="80"
                  max="140"
                  step="5"
                  value={priceMultiplier}
                  onChange={(event) => setPriceMultiplier(Number(event.target.value))}
                  className="w-full accent-[#2FBF71]"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => pushLog('Đã kích cổng vào cho một xe')} className="focus-track flex items-center justify-center gap-2 rounded-control bg-lot-reserved px-3 py-2 text-sm font-bold text-lot-asphalt">
                <Zap className="h-4 w-4" />
                Mở cổng
              </button>
              <button type="button" onClick={() => pushLog('Đã điều nhân sự tới làn thanh toán')} className="focus-track flex items-center justify-center gap-2 rounded-control border border-lot-divider px-3 py-2 text-sm font-bold text-lot-lane hover:bg-lot-lane/8">
                <BellRing className="h-4 w-4" />
                Điều phối
              </button>
              <button type="button" onClick={() => pushLog('Đã yêu cầu rà soát RFID')} className="focus-track flex items-center justify-center gap-2 rounded-control border border-lot-divider px-3 py-2 text-sm font-bold text-lot-lane hover:bg-lot-lane/8">
                <Radio className="h-4 w-4" />
                Rà RFID
              </button>
              <button
                type="button"
                onClick={() => {
                  setScenario('live')
                  setStaffing(3)
                  setPriceMultiplier(100)
                  pushLog('Đã đặt lại buồng điều phối về trạng thái trực tiếp')
                }}
                className="focus-track flex items-center justify-center gap-2 rounded-control border border-lot-divider px-3 py-2 text-sm font-bold text-lot-lane hover:bg-lot-lane/8"
              >
                <RotateCcw className="h-4 w-4" />
                Đặt lại
              </button>
            </div>

            <div className="rounded-control border border-lot-divider bg-black/18 p-3">
              <p className="mb-2 text-sm font-semibold text-lot-lane">Nhật ký thao tác</p>
              <div className="space-y-2">
                {gateLog.map((item) => (
                  <p key={item} className="text-xs text-lot-muted">{item}</p>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Luồng cảnh báo thông minh" subtitle="Tự tạo từ tỷ lệ lấp đầy, hàng chờ và thanh toán">
          <div className="space-y-2">
            {alertFeed.map((item) => (
              <div key={item.title} className="flex gap-3 rounded-control border border-lot-divider bg-black/18 p-3">
                <AlertTriangle className={`mt-0.5 h-4 w-4 ${item.tone === 'occupied' ? 'text-lot-occupied' : item.tone === 'reserved' ? 'text-lot-reserved' : 'text-lot-empty'}`} />
                <div>
                  <p className="font-semibold text-lot-lane">{item.title}</p>
                  <p className="text-sm text-lot-muted">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Cơ cấu trạng thái ô đỗ" subtitle="Thay đổi theo chế độ mô phỏng">
          <DonutPanelChart data={buildSlotStatusData(displayStats)} />
        </Panel>
        <Panel title="Dự báo vận hành" subtitle="Tóm tắt theo kịch bản giả lập">
          <div className="space-y-3">
            <ForecastRow label="Hàng chờ sau điều phối" value={`${projectedQueue} xe`} tone={projectedQueue > 8 ? 'occupied' : 'empty'} />
            <ForecastRow label="Điểm áp lực" value={`${pressureScore}/100`} tone={pressureScore > 70 ? 'occupied' : pressureScore > 45 ? 'reserved' : 'empty'} />
            <ForecastRow label="Doanh thu theo kịch bản" value={formatVND(projectedRevenue)} tone="sensor" />
            <ForecastRow label="Sức chứa còn mở" value={`${displayStats.empty} ô`} tone={displayStats.empty < 3 ? 'reserved' : 'empty'} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Lưu lượng vào/ra theo giờ" subtitle="Lượt vào từ time_in, lượt ra từ time_out">
          <TwoLineChart data={traffic} xKey="hour" firstKey="entries" secondKey="exits" />
        </Panel>
        <Panel title="Giờ cao điểm theo ngày" subtitle="Mật độ 24 giờ trong 7 ngày">
          <Heatmap matrix={buildHeatmap()} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Doanh thu theo thời gian" subtitle={`Khoảng: ${range === 'today' ? 'hôm nay' : range === '7d' ? '7 ngày' : '30 ngày'}`}>
          <AreaPanelChart data={revenue} xKey="label" yKey="amount" color="#2FBF71" />
        </Panel>
        <Panel title="Ô đỗ dùng nhiều nhất" subtitle="Top 10 theo lịch sử đỗ xe">
          <BarPanelChart data={topSlots} xKey="slot" yKey="count" layout="vertical" color="#F0B429" />
        </Panel>
        <Panel title="Trạng thái thanh toán">
          <DonutPanelChart data={statusData} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Phương thức thanh toán" subtitle="Số lượt theo phương thức">
          <DonutPanelChart data={methodData} />
        </Panel>
        <Panel
          title="Xe đang đỗ"
          subtitle="Tìm theo ô, biển số hoặc cư dân"
          className="xl:col-span-2"
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lot-muted" />
                <input
                  value={vehicleQuery}
                  onChange={(event) => setVehicleQuery(event.target.value)}
                  className="focus-track w-full rounded-control border border-lot-divider bg-lot-asphalt px-9 py-2 text-sm text-lot-lane placeholder:text-lot-muted"
                  placeholder="Tìm xe"
                />
              </label>
              <select
                value={vehicleFilter}
                onChange={(event) => setVehicleFilter(event.target.value as VehicleFilter)}
                className="focus-track rounded-control border border-lot-divider bg-lot-asphalt px-3 py-2 text-sm text-lot-lane"
              >
                <option value="all">Tất cả xe</option>
                <option value="resident">Xe cư dân</option>
                <option value="visitor">Xe khách</option>
              </select>
            </div>
          }
        >
          <TableShell>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-black/24 text-xs uppercase text-lot-muted">
                <tr>
                  <th className="px-3 py-3">Ô đỗ</th>
                  <th className="px-3 py-3">Biển số</th>
                  <th className="px-3 py-3">Cư dân</th>
                  <th className="px-3 py-3">Giờ vào</th>
                  <th className="px-3 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lot-divider">
                {filteredParked.map((item) => (
                  <tr key={item.id} className="hover:bg-lot-lane/5">
                    <td className="px-3 py-3 font-semibold text-lot-lane">{item.slot_number}</td>
                    <td className="px-3 py-3 digital-text text-lg">{item.license_plate}</td>
                    <td className="px-3 py-3 text-lot-muted">{item.resident?.full_name ?? 'Khách vãng lai'}</td>
                    <td className="px-3 py-3 text-lot-muted">{new Date(item.time_in).toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-3"><StatusPill status={item.status} /></td>
                  </tr>
                ))}
                {filteredParked.length === 0 && <EmptyRow colSpan={5} text="Không có xe đang đỗ khớp bộ lọc" />}
              </tbody>
            </table>
          </TableShell>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Giao dịch doanh thu" subtitle="Bấm một dòng để xem payment_history và parking_history">
          <TableShell>
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-black/24 text-xs uppercase text-lot-muted">
                <tr>
                  <th className="px-3 py-3">Thời điểm</th>
                  <th className="px-3 py-3">Cư dân</th>
                  <th className="px-3 py-3">Xe</th>
                  <th className="px-3 py-3">Phương thức</th>
                  <th className="px-3 py-3">Số tiền</th>
                  <th className="px-3 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lot-divider">
                {payments.slice(0, 12).map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => setSelectedPaymentId(payment.id)}
                    className={`cursor-pointer hover:bg-lot-lane/5 ${selectedPayment?.id === payment.id ? 'bg-lot-reserved/8' : ''}`}
                  >
                    <td className="px-3 py-3 text-lot-muted">{new Date(payment.paid_at ?? payment.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-3 font-semibold text-lot-lane">{payment.resident?.full_name ?? 'Chưa rõ'}</td>
                    <td className="px-3 py-3 digital-text text-lg">{payment.parking_history?.license_plate ?? 'Không có'}</td>
                    <td className="px-3 py-3 capitalize">{translatePaymentMethod(payment.payment_method)}</td>
                    <td className="px-3 py-3 font-semibold">{formatVND(Number(payment.amount))}</td>
                    <td className="px-3 py-3"><StatusPill status={payment.status} /></td>
                  </tr>
                ))}
                {payments.length === 0 && <EmptyRow colSpan={6} text="Chưa tải được giao dịch thanh toán" />}
              </tbody>
            </table>
          </TableShell>
        </Panel>

        <Panel title="Chi tiết giao dịch" subtitle={selectedPayment ? `Thanh toán #${selectedPayment.id}` : 'Chưa chọn giao dịch'}>
          {selectedPayment ? (
            <div className="space-y-3 text-sm">
              <Detail label="Số tiền" value={formatVND(Number(selectedPayment.amount))} />
              <Detail label="Trạng thái" value={translatePaymentStatus(selectedPayment.status)} />
              <Detail label="Phương thức" value={translatePaymentMethod(selectedPayment.payment_method)} />
              <Detail label="Cư dân" value={selectedPayment.resident?.full_name ?? 'Chưa rõ'} />
              <Detail label="Ô đỗ" value={selectedPayment.parking_history?.slot_number ?? 'Không có'} />
              <Detail label="Biển số" value={selectedPayment.parking_history?.license_plate ?? 'Không có'} />
              <Detail label="Giờ vào" value={selectedPayment.parking_history?.time_in ? new Date(selectedPayment.parking_history.time_in).toLocaleString('vi-VN') : 'Không có'} />
              <Detail label="Giờ ra" value={selectedPayment.parking_history?.time_out ? new Date(selectedPayment.parking_history.time_out).toLocaleString('vi-VN') : 'Đang đỗ / không có'} />
            </div>
          ) : (
            <p className="text-sm text-lot-muted">Chọn một dòng giao dịch.</p>
          )}
        </Panel>
      </div>

      <Panel title="Cư dân và ô đã gán" subtitle="Dữ liệu resident kết hợp parking_slot">
        <TableShell>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-black/24 text-xs uppercase text-lot-muted">
              <tr>
                <th className="px-3 py-3">Cư dân</th>
                <th className="px-3 py-3">Căn hộ</th>
                <th className="px-3 py-3">Điện thoại</th>
                <th className="px-3 py-3">RFID</th>
                <th className="px-3 py-3">Ô đã gán</th>
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
                    <td className="px-3 py-3">{assigned ? `${assigned.slot_number} (${translateSlotStatus(assigned.status)})` : 'Khách / chưa gán'}</td>
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

function uniqueById<T extends { id: number }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values())
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-lot-divider pb-2">
      <p className="text-xs text-lot-muted">{label}</p>
      <p className="font-semibold text-lot-lane">{value}</p>
    </div>
  )
}

function applyScenario(slots: DashboardData['slots'], scenario: ScenarioKey) {
  if (scenario === 'live') return slots

  return slots.map((slot, index) => {
    if (scenario === 'rush' && slot.status !== 'occupied' && index % 3 !== 0) {
      return { ...slot, status: 'occupied' }
    }
    if (scenario === 'vip' && index < 4) {
      return { ...slot, status: 'reserved' }
    }
    if (scenario === 'maintenance' && index >= 2 && index <= 4) {
      return { ...slot, status: 'occupied' }
    }
    return slot
  })
}

function buildSlotStats(slots: DashboardData['slots']) {
  const total = Math.max(1, slots.length)
  const occupied = slots.filter((slot) => slot.status === 'occupied').length
  const reserved = slots.filter((slot) => slot.status === 'reserved').length
  const empty = slots.filter((slot) => slot.status === 'empty' || slot.status === 'free').length
  return {
    total,
    occupied,
    reserved,
    empty,
    occupancyRate: Math.round((occupied / total) * 100),
  }
}

function buildSlotStatusData(stats: ReturnType<typeof buildSlotStats>) {
  return [
    { name: 'Đang có xe', value: stats.occupied, color: '#D64545' },
    { name: 'Đã giữ chỗ', value: stats.reserved, color: '#F0B429' },
    { name: 'Còn trống', value: stats.empty, color: '#2FBF71' },
  ].filter((item) => item.value > 0)
}

function buildAlertFeed(occupancyRate: number, queue: number, pressureScore: number, pendingPayments: number) {
  const alerts = []
  if (occupancyRate >= 85) {
    alerts.push({
      title: 'Sắp hết sức chứa',
      message: 'Tỷ lệ lấp đầy vượt 85%. Nên chuyển làn vào sang chế độ ưu tiên cư dân.',
      tone: 'occupied' as const,
    })
  }
  if (queue >= 8) {
    alerts.push({
      title: 'Hàng chờ cổng tăng',
      message: 'Hàng chờ dự kiến đang cao. Hãy điều một nhân sự tới barrier cổng vào.',
      tone: 'reserved' as const,
    })
  }
  if (pendingPayments > 0) {
    alerts.push({
      title: 'Cần xử lý thanh toán chờ',
      message: `${pendingPayments} giao dịch đang chờ, có thể làm chậm luồng ra bãi.`,
      tone: 'reserved' as const,
    })
  }
  if (pressureScore < 45) {
    alerts.push({
      title: 'Bãi đang vận hành ổn định',
      message: 'Áp lực giao thông thấp. Giữ quy tắc RFID bình thường.',
      tone: 'empty' as const,
    })
  }
  return alerts.slice(0, 3)
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

function translatePaymentStatus(value?: string | null) {
  const normalized = (value ?? '').toLowerCase()
  if (normalized.includes('paid') || normalized.includes('success')) return 'Đã thanh toán'
  if (normalized.includes('pending')) return 'Đang chờ'
  if (normalized.includes('failed')) return 'Thất bại'
  if (normalized.includes('completed')) return 'Hoàn tất'
  if (!normalized || normalized === 'unknown') return 'Chưa rõ'
  return value ?? 'Chưa rõ'
}

function translateSlotStatus(value?: string | null) {
  const normalized = (value ?? '').toLowerCase()
  if (normalized.includes('occupied')) return 'đang có xe'
  if (normalized.includes('reserved')) return 'đã giữ chỗ'
  if (normalized.includes('empty') || normalized.includes('free')) return 'còn trống'
  return value ?? 'chưa rõ'
}

function MiniGauge({
  label,
  value,
  suffix,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  suffix?: string
  icon: typeof Gauge
  tone: 'empty' | 'reserved' | 'occupied' | 'sensor'
}) {
  const toneClass = {
    empty: 'text-lot-empty',
    reserved: 'text-lot-reserved',
    occupied: 'text-lot-occupied',
    sensor: 'text-lot-sensor',
  }[tone]

  return (
    <div className="rounded-control border border-lot-divider bg-black/18 p-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-lot-muted">
        <span>{label}</span>
        <Icon className={`h-4 w-4 ${toneClass}`} />
      </div>
      <p className={`digital-text text-3xl font-bold leading-8 ${toneClass}`}>
        {value}
        {suffix && <span className="ml-1 text-sm">{suffix}</span>}
      </p>
    </div>
  )
}

function ForecastRow({ label, value, tone }: { label: string; value: string; tone: 'empty' | 'reserved' | 'occupied' | 'sensor' }) {
  const toneClass = {
    empty: 'text-lot-empty',
    reserved: 'text-lot-reserved',
    occupied: 'text-lot-occupied',
    sensor: 'text-lot-sensor',
  }[tone]

  return (
    <div className="flex items-center justify-between gap-3 rounded-control border border-lot-divider bg-black/18 p-3">
      <span className="text-sm text-lot-muted">{label}</span>
      <span className={`digital-text text-xl font-bold ${toneClass}`}>{value}</span>
    </div>
  )
}
