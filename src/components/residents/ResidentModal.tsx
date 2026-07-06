import { type Resident } from '@/types'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ResidentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (resident: Omit<Resident, 'id' | 'created_at'> & { id?: string }) => void
  resident?: Resident | null
}

export function ResidentModal({ isOpen, onClose, onSave, resident }: ResidentModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    apartment: '',
    phone: '',
    rfid_uid: '',
  })

  useEffect(() => {
    if (resident) {
      setFormData({
        full_name: resident.full_name,
        apartment: resident.apartment,
        phone: resident.phone,
        rfid_uid: resident.rfid_uid,
      })
    } else {
      setFormData({ full_name: '', apartment: '', phone: '', rfid_uid: '' })
    }
  }, [resident, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: resident?.id })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-nx-text-muted hover:text-nx-text transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-display font-bold text-nx-text mb-6">
          {resident ? 'Edit Resident' : 'Add New Resident'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nx-text-secondary mb-1">Full Name</label>
            <input 
              required
              type="text" 
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full bg-nx-deep border border-nx-border rounded-lg px-4 py-2 text-sm text-nx-text focus:outline-none focus:border-nx-cyan/50 focus:ring-1 focus:ring-nx-cyan/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nx-text-secondary mb-1">Apartment</label>
            <input 
              required
              type="text" 
              value={formData.apartment}
              onChange={e => setFormData({ ...formData, apartment: e.target.value })}
              className="w-full bg-nx-deep border border-nx-border rounded-lg px-4 py-2 text-sm text-nx-text focus:outline-none focus:border-nx-cyan/50 focus:ring-1 focus:ring-nx-cyan/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nx-text-secondary mb-1">Phone</label>
            <input 
              required
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-nx-deep border border-nx-border rounded-lg px-4 py-2 text-sm text-nx-text focus:outline-none focus:border-nx-cyan/50 focus:ring-1 focus:ring-nx-cyan/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nx-text-secondary mb-1">RFID UID</label>
            <input 
              required
              type="text" 
              value={formData.rfid_uid}
              onChange={e => setFormData({ ...formData, rfid_uid: e.target.value })}
              className="w-full bg-nx-deep border border-nx-border rounded-lg px-4 py-2 text-sm text-nx-text focus:outline-none focus:border-nx-cyan/50 focus:ring-1 focus:ring-nx-cyan/50 transition-all"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-nx-text-secondary hover:text-nx-text hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-nx-cyan text-nx-void hover:bg-nx-cyan/90 transition-all shadow-cyan-glow"
            >
              Save Resident
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
