import type { DashboardData } from '@/api/dashboard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { KpiCard } from '@/components/ui/KpiCard'
import { CurrentSessionCard } from '@/components/dashboard/CurrentSessionCard'
import { ParkingTimeline } from '@/components/dashboard/ParkingTimeline'
import { AreaTimeChart } from '@/components/charts/AreaTimeChart'
import { BarCategoryChart } from '@/components/charts/BarCategoryChart'
import { DonutChart } from '@/components/charts/DonutChart'

import { useResidentProfile } from '@/hooks/useResidentProfile'
import { useResidentParking } from '@/hooks/useResidentParking'
import { useResidentPayments } from '@/hooks/useResidentPayments'

import { CreditCard as RfidCard, Home, Smartphone, Wallet, CheckCircle2 } from 'lucide-react'

interface UserDashboardProps {
  residentId: string
  data: DashboardData
}

export function UserDashboard({ residentId, data }: UserDashboardProps) {
  const { resident } = useResidentProfile(residentId, data)
  const { currentSession, completedHistory, groupByDay: groupParkingByDay } = useResidentParking(residentId, data)
  const { payments, totalPaid, totalPending, groupByMonth: groupPaymentsByMonth, groupByMethod: groupPaymentsByMethod } = useResidentPayments(residentId, data)

  if (!resident) {
    return <div className="p-8 text-sp-danger">Error: Resident information not found.</div>
  }

  const parkingFreqData = groupParkingByDay(14)
  const spendingData = groupPaymentsByMonth(6).reverse() // oldest first for chart
  
  const methodColors: Record<string, string> = {
    'cash': '#3B82F6',
    'transfer': '#8B5CF6',
    'momo': '#EC4899',
    'vnpay': '#06B6D4'
  }
  
  const paymentMethodData = groupPaymentsByMethod().map(m => ({
    name: m.method.toUpperCase(),
    value: m.amount,
    color: methodColors[m.method] || '#94A3B8'
  }))

  // Personalized insight
  const insightText = currentSession 
    ? "Your vehicle is currently parked. Session is active."
    : (completedHistory.length > 0 
      ? `You have parked ${parkingFreqData.reduce((sum, d) => sum + d.count, 0)} times in the last 14 days.`
      : "Welcome to ParkFlow. You haven't parked yet.")

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader 
        title="My Resident Portal" 
        subtitle="Manage your parking access and payments" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column (1/3) ── */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card Info Panel */}
          <div className="sp-panel p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sp-brand-glow rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <h2 className="text-lg font-semibold text-sp-text flex items-center gap-2 mb-6">
              <RfidCard className="w-5 h-5 text-sp-brand" />
              Issued Parking Card
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-sp-base border border-sp-border relative overflow-hidden group">
                <div className="absolute inset-y-0 left-0 w-1 bg-sp-brand"></div>
                <p className="text-xs text-sp-text-3 uppercase tracking-wider mb-1 pl-2">Card Holder</p>
                <p className="text-sp-text font-medium pl-2">{resident.full_name}</p>
              </div>

              <div className="p-4 rounded-lg bg-sp-base border border-sp-border relative overflow-hidden group">
                <div className="absolute inset-y-0 left-0 w-1 bg-sp-chart2"></div>
                <p className="text-xs text-sp-text-3 uppercase tracking-wider mb-1 pl-2">RFID UID</p>
                <p className="text-sp-text font-mono text-sm pl-2">{resident.rfid_uid}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-sp-base border border-sp-border flex flex-col gap-1.5">
                  <Home className="w-4 h-4 text-sp-text-2" />
                  <p className="text-sm font-medium text-sp-text">{resident.apartment}</p>
                </div>
                <div className="p-3 rounded-lg bg-sp-base border border-sp-border flex flex-col gap-1.5">
                  <Smartphone className="w-4 h-4 text-sp-text-2" />
                  <p className="text-sm font-medium text-sp-text">{resident.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Session */}
          <div className="h-[260px]">
            <CurrentSessionCard session={currentSession} />
          </div>

          <div className="sp-panel p-6">
            <p className="text-sm text-sp-text-2 italic">{insightText}</p>
          </div>
        </div>

        {/* ── Right Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KpiCard
              title="Outstanding Balance"
              value={`${(totalPending / 1000).toFixed(0)}k`}
              subtitle="VND total pending"
              icon={Wallet}
              accentClass={totalPending > 0 ? "bg-sp-reserved-dim text-sp-pending" : "bg-sp-available-dim text-sp-available"}
              iconColor={totalPending > 0 ? "text-sp-pending" : "text-sp-available"}
            />
            <KpiCard
              title="Total Paid"
              value={`${(totalPaid / 1000).toFixed(0)}k`}
              subtitle="VND all time"
              icon={CheckCircle2}
              accentClass="bg-sp-elevated text-sp-text"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="sp-panel p-6">
              <SectionHeader title="Spending Over Time" subtitle="Last 6 months (VND)" className="mb-6" />
              <AreaTimeChart 
                data={spendingData} 
                xKey="month" 
                yKey="amount" 
                formatY={(v) => `${(v/1000).toFixed(0)}k`}
                color="#3B82F6"
              />
            </div>
            <div className="sp-panel p-6">
              <SectionHeader title="Payment Methods" subtitle="All time breakdown" className="mb-6" />
              <DonutChart 
                data={paymentMethodData} 
                formatValue={(v) => `${v.toLocaleString('vi-VN')} VND`} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parking Timeline */}
            <div className="sp-panel p-6 flex flex-col h-[500px]">
              <SectionHeader title="Parking Timeline" subtitle="Recent activity" className="mb-6 shrink-0" />
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <ParkingTimeline history={currentSession ? [currentSession, ...completedHistory] : completedHistory} />
              </div>
            </div>

            <div className="space-y-6 flex flex-col h-[500px]">
              {/* Parking Frequency Chart */}
              <div className="sp-panel p-6 flex-1">
                <SectionHeader title="Parking Frequency" subtitle="Sessions per day (14d)" className="mb-4" />
                <BarCategoryChart 
                  data={parkingFreqData} 
                  xKey="date" 
                  yKey="count" 
                  color="#8B5CF6"
                  height={150}
                />
              </div>

              {/* Recent Payments List */}
              <div className="sp-panel p-6 flex-1 flex flex-col min-h-[220px]">
                <SectionHeader title="Recent Invoices" subtitle="Payment history" className="mb-4 shrink-0" />
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                  {payments.length === 0 ? (
                    <div className="text-center text-sp-text-3 text-sm py-4">No invoices yet.</div>
                  ) : (
                    payments.slice(0, 5).map(payment => (
                      <div key={payment.id} className="p-3 rounded-lg bg-sp-base border border-sp-border flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-sp-text mb-0.5">
                            {payment.parking_history ? `Slot ${payment.parking_history.slot_number}` : 'Parking Fee'}
                          </p>
                          <p className="text-xs text-sp-text-3">
                            {new Date(payment.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <p className="text-sm font-bold text-sp-text">
                            {Number(payment.amount).toLocaleString('vi-VN')} đ
                          </p>
                          <StatusBadge status={payment.status} size="xs" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
