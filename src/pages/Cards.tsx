import type { Resident } from '@/types'
import { Panel } from '@/components/ui/Primitives'

export function Cards({ data }: { data: Resident[] }) {
  return (
    <Panel title="RFID Cards" subtitle="Card access is now presented through resident profiles and assigned slots.">
      <p className="text-lot-muted">{data.length} RFID-linked resident records available.</p>
    </Panel>
  )
}
