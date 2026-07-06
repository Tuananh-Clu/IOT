import type { ParkingHistory } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { Users } from 'lucide-react'

export function ResidentTable({ history }: { history: ParkingHistory[] }) {
  if (!history?.length) {
    return <EmptyState icon={Users} message="No residents currently parked." className="py-6" />
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-sp-border text-sp-text-3 text-xs font-semibold uppercase tracking-wider">
            <th className="px-4 py-3">Resident</th>
            <th className="px-4 py-3">Apartment</th>
            <th className="px-4 py-3">Slot</th>
            <th className="px-4 py-3">License Plate</th>
            <th className="px-4 py-3">Time In</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sp-border text-sm">
          {history.map((record) => (
            <tr key={record.id} className="hover:bg-sp-elevated/50 transition-colors">
              <td className="px-4 py-3 font-medium text-sp-text">{record.resident?.full_name || 'Unknown'}</td>
              <td className="px-4 py-3 text-sp-text-2">{record.resident?.apartment || '-'}</td>
              <td className="px-4 py-3 font-mono text-sp-brand">{record.slot_number}</td>
              <td className="px-4 py-3 text-sp-text-2">{record.license_plate}</td>
              <td className="px-4 py-3 text-sp-text-3">{new Date(record.time_in).toLocaleString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
