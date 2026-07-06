import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ParkingSensorData } from '@/types'
import { Activity, Thermometer, Droplets, Flame, AlertTriangle, CheckCircle2 } from 'lucide-react'

export function Sensors({ sensors }: { sensors: ParkingSensorData[] }) {
  const latestSensor = sensors && sensors.length > 0 ? sensors[0] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader 
        title="Sensor Dashboard" 
        subtitle="Real-time status and historical logs of all IoT devices" 
      />

      {/* Current Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* IR Sensor */}
        <div className="sp-panel p-4 flex flex-col gap-2">
          <div className="text-sp-text-3 text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between">
            IR Sensor
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            {latestSensor ? (
              latestSensor.ir_sensor === 1 ? (
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold text-lg">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sp-text-3">
                  <Activity className="w-5 h-5" />
                  <span className="font-semibold text-lg">Idle</span>
                </div>
              )
            ) : (
              <span className="text-sp-text-3">N/A</span>
            )}
          </div>
        </div>

        {/* Buzzer */}
        <div className="sp-panel p-4 flex flex-col gap-2">
          <div className="text-sp-text-3 text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between">
            Buzzer
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            {latestSensor ? (
              latestSensor.buzzer === 1 ? (
                <div className="flex items-center gap-2 text-sp-warning">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold text-lg">Ringing</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sp-text-3">
                  <Activity className="w-5 h-5" />
                  <span className="font-semibold text-lg">Off</span>
                </div>
              )
            ) : (
              <span className="text-sp-text-3">N/A</span>
            )}
          </div>
        </div>

        {/* Barrier */}
        <div className="sp-panel p-4 flex flex-col gap-2">
          <div className="text-sp-text-3 text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between">
            Barrier
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            {latestSensor ? (
              latestSensor.barrier === 1 ? (
                <div className="flex items-center gap-2 text-sp-brand">
                  <Activity className="w-5 h-5" />
                  <span className="font-semibold text-lg">Open</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sp-text-3">
                  <Activity className="w-5 h-5" />
                  <span className="font-semibold text-lg">Closed</span>
                </div>
              )
            ) : (
              <span className="text-sp-text-3">N/A</span>
            )}
          </div>
        </div>

        {/* Temperature */}
        <div className="sp-panel p-4 flex flex-col gap-2">
          <div className="text-sp-text-3 text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between">
            Temperature
            <Thermometer className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1 mt-1">
            {latestSensor ? (
              <>
                <span className={`font-semibold text-2xl ${latestSensor.temperature > 35 ? 'text-sp-warning' : 'text-sp-text'}`}>
                  {latestSensor.temperature.toFixed(1)}
                </span>
                <span className="text-sp-text-3 text-sm">°C</span>
              </>
            ) : (
              <span className="text-sp-text-3">N/A</span>
            )}
          </div>
        </div>

        {/* Humidity */}
        <div className="sp-panel p-4 flex flex-col gap-2">
          <div className="text-sp-text-3 text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between">
            Humidity
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1 mt-1">
            {latestSensor ? (
              <>
                <span className="font-semibold text-2xl text-sp-brand">
                  {latestSensor.humidity.toFixed(1)}
                </span>
                <span className="text-sp-text-3 text-sm">%</span>
              </>
            ) : (
              <span className="text-sp-text-3">N/A</span>
            )}
          </div>
        </div>

        {/* Flame Detector */}
        <div className="sp-panel p-4 flex flex-col gap-2">
          <div className="text-sp-text-3 text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between">
            Flame Detector
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            {latestSensor ? (
              latestSensor.flame_detected === 1 ? (
                <div className="flex items-center gap-2 text-sp-danger animate-pulse">
                  <Flame className="w-5 h-5" />
                  <span className="font-semibold text-lg">Detected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold text-lg">Safe</span>
                </div>
              )
            ) : (
              <span className="text-sp-text-3">N/A</span>
            )}
          </div>
        </div>
      </div>

      <div className="sp-panel overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-200px)] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-sp-surface z-10 shadow-sm border-b border-sp-border">
              <tr className="text-sp-text-3 text-[11px] font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-center">Car Count</th>
                <th className="px-6 py-4 text-center">IR Sensor</th>
                <th className="px-6 py-4 text-center">Buzzer</th>
                <th className="px-6 py-4 text-center">Barrier</th>
                <th className="px-6 py-4 text-center">Temp (°C)</th>
                <th className="px-6 py-4 text-center">Humidity (%)</th>
                <th className="px-6 py-4 text-center">Flame</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sp-border text-sm">
              {sensors?.map((s, idx) => (
                <tr key={idx} className="hover:bg-sp-elevated/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sp-text">{new Date(s.time).toLocaleString('vi-VN')}</td>
                  <td className="px-6 py-4 text-center text-sp-brand font-mono font-medium">{s.car_count}</td>
                  <td className="px-6 py-4 text-center text-sp-text-2">{s.ir_sensor}</td>
                  <td className="px-6 py-4 text-center text-sp-text-2">{s.buzzer}</td>
                  <td className="px-6 py-4 text-center text-sp-chart2 font-semibold">{s.barrier}</td>
                  <td className="px-6 py-4 text-center text-sp-warning font-medium">{s.temperature}</td>
                  <td className="px-6 py-4 text-center text-sp-brand font-medium">{s.humidity}</td>
                  <td className={`px-6 py-4 text-center font-bold ${s.flame_detected ? 'text-sp-danger animate-pulse' : 'text-sp-text-3'}`}>
                    {s.flame_detected}
                  </td>
                </tr>
              ))}
              {(!sensors || sensors.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sp-text-3">
                    No sensor data available in the current timeframe
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
