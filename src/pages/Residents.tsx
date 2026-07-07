import type { Resident } from '@/types'
import { Panel } from '@/components/ui/Primitives'

export function Residents({ data }: { data: Resident[]; onUpdateData?: (next: Resident[]) => void }) {
  return (
    <Panel title="Residents" subtitle="Resident management has moved into the management overview assignment table.">
      <p className="text-lot-muted">{data.length} resident records loaded from the preserved data layer.</p>
    </Panel>
  )
}
