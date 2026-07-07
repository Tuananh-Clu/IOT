import type { Resident } from '@/types'
import { Panel } from '@/components/ui/Primitives'

export function Cards({ data }: { data: Resident[] }) {
  return (
    <Panel title="Thẻ RFID" subtitle="Quyền truy cập thẻ hiện được hiển thị qua hồ sơ cư dân và ô đã gán.">
      <p className="text-lot-muted">Có {data.length} hồ sơ cư dân đã liên kết RFID.</p>
    </Panel>
  )
}
