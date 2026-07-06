import type { DashboardData } from '@/api/dashboard'
import { KpiCard } from '@/components/ui/KpiCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SlotGrid } from '@/components/dashboard/SlotGrid'
import { ResidentTable } from '@/components/dashboard/ResidentTable'
import { SensorStatusPanel } from '@/components/dashboard/SensorStatusPanel'
import { TrafficChart } from '@/components/dashboard/TrafficChart'
import { EnvironmentChart } from '@/components/dashboard/EnvironmentChart'
import { BarCategoryChart } from '@/components/charts/BarCategoryChart'
import { HeatmapChart } from '@/components/charts/HeatmapChart'
import { DonutChart } from '@/components/charts/DonutChart'

import { useSlotsOverview } from '@/hooks/useSlotsOverview'
import { useParkingHistory } from '@/hooks/useParkingHistory'
import { usePaymentsOverview } from '@/hooks/usePaymentsOverview'
import { useSensorStream } from '@/hooks/useSensorStream'

import { Car, Users, Wallet, Activity } from 'lucide-react'

export function AdminDashboard({ data }: { data: DashboardData }) {
  // Hooks
  const { stats: slotStats, slots } = useSlotsOverview(data)
  const { currentlyParked, buildHeatmap } = useParkingHistory(data)
  const { totalRevenue, groupByDay, groupByStatus } = usePaymentsOverview(data)
  
  // Realtime sensor stream (polling every 30s)
  const { data: sensorData, flameDetected, buzzerActive, barrierOpen, irActive, loading: sensorLoading } = useSensorStream(24)

  const revenueData = groupByDay(7)
  const paymentStatusData = groupByStatus().map(s => {
    let color = '#3B82F6'
    if (s.status === 'paid') color = '#22C55E'
    if (s.status === 'pending') color = '#F59E0B'
    if (s.status === 'failed') color = '#EF4444'
    return { name: s.status, value: s.amount, color }
  })
  const heatmapMatrix = buildHeatmap()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          title="Occupancy Rate"
          value={`${slotStats.occupancyRate}%`}
          subtitle={`${slotStats.occupied} / ${slotStats.total - slotStats.maintenance} active slots`}
          icon={Car}
          trend={{ value: 'Stable', up: slotStats.occupancyRate < 80 }}
          accentClass={slotStats.occupancyRate >= 80 ? 'bg-sp-danger-dim text-sp-danger' : 'bg-sp-brand-dim text-sp-brand'}
          iconColor={slotStats.occupancyRate >= 80 ? 'text-sp-danger' : 'text-sp-brand'}
        />
        <KpiCard
          title="Currently Parked"
          value={currentlyParked.length}
          subtitle="Vehicles in facility"
          icon={Activity}
          accentClass="bg-sp-available-dim"
          iconColor="text-sp-available"
        />
        <KpiCard
          title="Total Residents"
          value={data.residents.length}
          subtitle="Registered accounts"
          icon={Users}
          accentClass="bg-sp-elevated"
          iconColor="text-sp-text"
        />
        <KpiCard
          title="Revenue (7d)"
          value={`${(totalRevenue / 1000000).toFixed(1)}M`}
          subtitle="VND total"
          icon={Wallet}
          accentClass="bg-sp-reserved-dim"
          iconColor="text-sp-reserved"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Center Area: Map & Heatmap (2/3 width) ── */}
        <div className="xl:col-span-2 space-y-6">
          {/* Parking Map */}
          <div className="sp-panel p-6">
            <SectionHeader title="Realtime Slot Map" subtitle="Live view of parking facility" className="mb-6" />
            <div className="h-[400px] flex flex-col">
              <SlotGrid slots={slots} />
            </div>
          </div>

          {/* Traffic Heatmap */}
          <div className="sp-panel p-6">
            <SectionHeader title="Peak-hour Heatmap" subtitle="Traffic density by hour and day" className="mb-6" />
            <HeatmapChart matrix={heatmapMatrix} height={200} />
          </div>

          {/* Currently Parked Drill-down */}
          <div className="sp-panel p-6">
            <SectionHeader 
              title="Active Parking Sessions" 
              subtitle="Vehicles currently inside the facility" 
              className="mb-6" 
              action={<StatusBadge status="in_progress" label={`${currentlyParked.length} Active`} />}
            />
            <ResidentTable history={currentlyParked} />
          </div>
        </div>

        {/* ── Right Column: Charts & Sensors (1/3 width) ── */}
        <div className="xl:col-span-1 space-y-6">
          {/* Safety & Sensors */}
          <div className="sp-panel p-6 relative overflow-hidden">
            {flameDetected && (
              <div className="absolute inset-0 bg-sp-danger-dim animate-danger-flash pointer-events-none" />
            )}
            <SectionHeader title="Live IoT Sensors" subtitle="Security and environment" className="mb-6" />
            <div className="space-y-6">
              <SensorStatusPanel 
                flameDetected={flameDetected}
                buzzerActive={buzzerActive}
                barrierOpen={barrierOpen}
                irActive={irActive}
              />
              <div>
                <h4 className="text-xs font-semibold text-sp-text-3 uppercase tracking-wider mb-3 pl-1">Environment (24h)</h4>
                <EnvironmentChart data={sensorData} loading={sensorLoading} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-sp-text-3 uppercase tracking-wider mb-3 pl-1">Traffic (24h)</h4>
                <TrafficChart data={sensorData} loading={sensorLoading} />
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="sp-panel p-6">
            <SectionHeader title="Financial Overview" subtitle="Revenue tracking" className="mb-6" />
            <div className="space-y-8">
              <div>
                <h4 className="text-xs font-semibold text-sp-text-3 uppercase tracking-wider mb-3 pl-1">Revenue (Last 7 Days)</h4>
                <BarCategoryChart 
                  data={revenueData} 
                  xKey="label" 
                  yKey="amount" 
                  formatY={(v) => `${(v / 1000).toFixed(0)}k`} 
                  height={180} 
                  color="#22C55E"
                />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-sp-text-3 uppercase tracking-wider mb-3 pl-1">Payment Status</h4>
                <DonutChart 
                  data={paymentStatusData} 
                  height={180} 
                  formatValue={(v) => `${(v / 1000).toFixed(0)}k VND`} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
