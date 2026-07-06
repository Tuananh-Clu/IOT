import { useState } from 'react'
import { type Resident } from '@/types'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Search, CreditCard, CheckCircle2, XCircle } from 'lucide-react'

export function Cards({ data }: { data: Resident[] }) {
  const [search, setSearch] = useState('')

  const filteredCards = data.filter(r => 
    r.rfid_uid.toLowerCase().includes(search.toLowerCase()) ||
    r.full_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader 
        title="Card Management" 
        subtitle="Manage RFID cards and access permissions" 
      />

      <div className="sp-panel overflow-hidden flex flex-col">
        <div className="p-4 border-b border-sp-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-sp-elevated/30">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-sp-text-3 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by UID or Owner..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-sp-base border border-sp-border rounded-lg pl-10 pr-4 py-2 text-sm text-sp-text focus-ring transition-all placeholder:text-sp-text-3"
            />
          </div>
          <div className="text-sm text-sp-text-3 font-medium">
            Showing {filteredCards.length} cards
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sp-border bg-sp-elevated/50 text-sp-text-3 text-[11px] font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Card UID</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Issue Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sp-border text-sm">
              {filteredCards.map((resident, idx) => (
                <tr key={idx} className="hover:bg-sp-elevated/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-sp-brand-dim text-sp-brand flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-sp-text font-medium">{resident.rfid_uid || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sp-text-2">{resident.full_name}</td>
                  <td className="px-6 py-4 text-center">
                    {resident.rfid_uid ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sp-danger/10 text-sp-danger text-xs font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Inactive
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sp-text-3">
                    {new Date(resident.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredCards.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sp-text-3">
                    No cards found matching your search.
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
