import { AlertTriangle, Armchair, RadioTower, ShieldCheck } from 'lucide-react'
import type { ParkingSensorData } from '@/types'
import { AreaPanelChart } from '@/components/charts/Charts'
import { Metric, Panel, StatusPill, TableShell } from '@/components/ui/Primitives'

// TODO: Replace this mock type with the real per-device Supabase/InfluxDB API when available.
interface MockDeviceStatus {
  sensor_id: string
  type: 'rfid_reader' | 'barrier_servo'
  location: string
  status: 'online' | 'offline'
  last_seen: string
  state?: 'open' | 'closed'
  activation_count_today?: number
}

const mockDevices: MockDeviceStatus[] = [
  { sensor_id: 'RFID-IN-01', type: 'rfid_reader', location: 'Entry lane', status: 'online', last_seen: new Date(Date.now() - 45_000).toISOString() },
  { sensor_id: 'RFID-OUT-01', type: 'rfid_reader', location: 'Exit lane', status: 'online', last_seen: new Date(Date.now() - 80_000).toISOString() },
  { sensor_id: 'RFID-B1-02', type: 'rfid_reader', location: 'Basement B1', status: 'offline', last_seen: new Date(Date.now() - 18 * 60_000).toISOString() },
  { sensor_id: 'SERVO-IN-01', type: 'barrier_servo', location: 'Entry barrier', status: 'online', last_seen: new Date(Date.now() - 30_000).toISOString(), state: 'closed', activation_count_today: 84 },
  { sensor_id: 'SERVO-OUT-01', type: 'barrier_servo', location: 'Exit barrier', status: 'online', last_seen: new Date(Date.now() - 55_000).toISOString(), state: 'open', activation_count_today: 76 },
]

export function Sensors({ sensors }: { sensors: ParkingSensorData[] }) {
  const latest = sensors.at(-1) ?? null
  const offlineDevices = mockDevices.filter((device) => offlineMinutes(device.last_seen) > 10)
  const activity = sensors.slice(-48).map((item) => ({
    time: new Date(item.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    cars: item.car_count,
    barrier: item.barrier,
    temperature: item.temperature,
  }))

  return (
    <div className="space-y-4">
      <div>
        <div className="lane-stripe mb-3 w-44" />
        <h1 className="digital-text text-4xl font-bold text-lot-lane">Device Monitoring</h1>
        <p className="text-lot-muted">RFID readers, entry barriers, servo activity, and InfluxDB sensor logs.</p>
      </div>

      {offlineDevices.length > 0 && (
        <div className="rounded-control border border-lot-occupied/45 bg-lot-occupied/12 p-3 text-lot-occupied">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5" />
            {offlineDevices.length} device needs attention
          </div>
          <p className="mt-1 text-sm">Offline threshold is 10 minutes. Check basement readers first.</p>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="RFID readers online" value={`${mockDevices.filter((device) => device.type === 'rfid_reader' && device.status === 'online').length}/3`} icon={RadioTower} tone="empty" />
        <Metric label="Barrier state" value={latest?.barrier === 1 ? 'OPEN' : 'CLOSED'} icon={Armchair} tone={latest?.barrier === 1 ? 'reserved' : 'lane'} />
        <Metric label="Activations today" value={mockDevices.reduce((sum, device) => sum + (device.activation_count_today ?? 0), 0)} helper="Mock until device API is wired" tone="sensor" />
        <Metric label="Safety" value={latest?.flame_detected ? 'ALERT' : 'CLEAR'} icon={ShieldCheck} tone={latest?.flame_detected ? 'occupied' : 'empty'} />
      </div>

      <Panel title="Per-device status" subtitle="Mock device status type: sensor_id, type, location, status, last_seen">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {mockDevices.map((device) => (
            <article key={device.sensor_id} className="rounded-control border border-lot-divider bg-black/18 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="digital-text text-2xl font-semibold text-lot-lane">{device.sensor_id}</p>
                  <p className="text-sm text-lot-muted">{device.location}</p>
                </div>
                <StatusPill status={offlineMinutes(device.last_seen) > 10 ? 'offline' : device.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <DeviceFact label="Type" value={device.type.replace('_', ' ')} />
                <DeviceFact label="Last seen" value={`${offlineMinutes(device.last_seen)}m ago`} />
                {device.state && <DeviceFact label="State" value={device.state} />}
                {device.activation_count_today !== undefined && <DeviceFact label="Today" value={`${device.activation_count_today} cycles`} />}
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Sensor activity log" subtitle="Existing InfluxDB stream through Supabase Edge Function">
        <AreaPanelChart data={activity} xKey="time" yKey="cars" color="#2C7DA0" height={260} />
      </Panel>

      <Panel title="Raw sensor records" subtitle="Latest rows from ParkingSensorData">
        <TableShell>
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-black/24 text-xs uppercase text-lot-muted">
              <tr>
                <th className="px-3 py-3">Time</th>
                <th className="px-3 py-3">Cars</th>
                <th className="px-3 py-3">IR</th>
                <th className="px-3 py-3">Buzzer</th>
                <th className="px-3 py-3">Barrier</th>
                <th className="px-3 py-3">Temp</th>
                <th className="px-3 py-3">Humidity</th>
                <th className="px-3 py-3">Flame</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lot-divider">
              {sensors.slice(-50).reverse().map((item, index) => (
                <tr key={`${item.time}-${index}`} className="hover:bg-lot-lane/5">
                  <td className="px-3 py-3 text-lot-muted">{new Date(item.time).toLocaleString('vi-VN')}</td>
                  <td className="px-3 py-3 digital-text text-lg">{item.car_count}</td>
                  <td className="px-3 py-3">{item.ir_sensor}</td>
                  <td className="px-3 py-3">{item.buzzer}</td>
                  <td className="px-3 py-3">{item.barrier}</td>
                  <td className="px-3 py-3">{item.temperature}</td>
                  <td className="px-3 py-3">{item.humidity}</td>
                  <td className="px-3 py-3"><StatusPill status={item.flame_detected ? 'alert' : 'online'} label={item.flame_detected ? 'detected' : 'clear'} /></td>
                </tr>
              ))}
              {sensors.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-lot-muted">No sensor records loaded</td>
                </tr>
              )}
            </tbody>
          </table>
        </TableShell>
      </Panel>
    </div>
  )
}

function offlineMinutes(value: string) {
  return Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000))
}

function DeviceFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control border border-lot-divider p-2">
      <p className="text-xs text-lot-muted">{label}</p>
      <p className="font-semibold capitalize text-lot-lane">{value}</p>
    </div>
  )
}
