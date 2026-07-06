import { useState } from 'react'
import { type Resident } from '@/types'
import { ResidentModal } from '@/components/residents/ResidentModal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

export function Residents({ data, onUpdateData }: { data: Resident[], onUpdateData: (newData: Resident[]) => void }) {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingResident, setEditingResident] = useState<Resident | null>(null)

  const filteredResidents = data.filter(r => 
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.apartment.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  )

  const handleSave = (residentData: any) => {
    if (residentData.id) {
      onUpdateData(data.map(r => r.id === residentData.id ? { ...r, ...residentData } : r))
    } else {
      const newResident: Resident = {
        ...residentData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      }
      onUpdateData([newResident, ...data])
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this resident?')) {
      onUpdateData(data.filter(r => r.id !== id))
    }
  }

  const openAddModal = () => {
    setEditingResident(null)
    setModalOpen(true)
  }

  const openEditModal = (resident: Resident) => {
    setEditingResident(resident)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader 
        title="Resident Directory" 
        subtitle="Manage customer profiles and access credentials" 
        action={
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-sp-brand text-white rounded-lg font-medium hover:bg-sp-brand/90 transition-all shadow-brand-glow focus-ring"
          >
            <Plus className="w-4 h-4" />
            Add Resident
          </button>
        }
      />

      <div className="sp-panel overflow-hidden flex flex-col">
        <div className="p-4 border-b border-sp-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-sp-elevated/30">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-sp-text-3 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search residents..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-sp-base border border-sp-border rounded-lg pl-10 pr-4 py-2 text-sm text-sp-text focus-ring transition-all placeholder:text-sp-text-3"
            />
          </div>
          <div className="text-sm text-sp-text-3 font-medium">
            Showing {filteredResidents.length} residents
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sp-border bg-sp-elevated/50 text-sp-text-3 text-[11px] font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Apartment</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">RFID UID</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sp-border text-sm">
              {filteredResidents.map(resident => (
                <tr key={resident.id} className="hover:bg-sp-elevated/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-sp-text">{resident.full_name}</td>
                  <td className="px-6 py-4 text-sp-text-2">{resident.apartment}</td>
                  <td className="px-6 py-4 text-sp-text-2">{resident.phone}</td>
                  <td className="px-6 py-4 text-sp-text-2 font-mono text-[13px]">{resident.rfid_uid}</td>
                  <td className="px-6 py-4 text-sp-text-3">
                    {new Date(resident.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(resident)}
                        className="text-sp-text-3 hover:text-sp-brand transition-colors p-1 rounded hover:bg-sp-elevated"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(resident.id)}
                        className="text-sp-text-3 hover:text-sp-danger transition-colors p-1 rounded hover:bg-sp-danger-dim"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResidents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sp-text-3">
                    No residents found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ResidentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSave}
        resident={editingResident}
      />
    </div>
  )
}
