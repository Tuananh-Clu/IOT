import { LayoutDashboard, Users, Cpu, Settings, LogOut, Car, CreditCard } from 'lucide-react'

interface SidebarProps {
  active: string
  onChange: (id: string) => void
  userRole?: 'admin' | 'user'
  onLogout?: () => void
}

export function Sidebar({ active, onChange, userRole = 'admin', onLogout }: SidebarProps) {
  const navItems = [
    { id: 'overview',   label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'user'] },
    { id: 'residents',  label: 'Residents', icon: Users,           roles: ['admin'] },
    { id: 'cards',      label: 'Cards',     icon: CreditCard,      roles: ['admin'] },
    { id: 'sensors',    label: 'Sensors',   icon: Cpu,             roles: ['admin'] },
  ].filter(item => item.roles.includes(userRole))

  return (
    <aside className="w-[260px] h-screen bg-sp-void border-r border-sp-border flex flex-col shrink-0 hidden md:flex z-40">
      <div className="h-[72px] flex items-center px-6 border-b border-sp-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sp-brand flex items-center justify-center shadow-brand-glow">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-display font-bold tracking-wide text-sp-text">
            ParkFlow<span className="text-sp-brand">.OS</span>
          </span>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        <p className="px-3 text-[11px] font-semibold text-sp-text-3 uppercase tracking-wider mb-2">
          {userRole === 'admin' ? 'Admin Navigation' : 'User Portal'}
        </p>
        
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-sp-brand ${
                isActive
                  ? 'bg-sp-brand-dim text-sp-brand'
                  : 'text-sp-text-2 hover:bg-sp-surface hover:text-sp-text'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sp-brand rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              )}
              <div className="relative shrink-0">
                <Icon className={`w-5 h-5 ${isActive ? 'text-sp-brand' : 'text-sp-text-3 group-hover:text-sp-text-2'}`} />
              </div>
              <span className="font-medium text-sm flex-1">{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-sp-border shrink-0">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sp-text-2 hover:bg-sp-surface hover:text-sp-text transition-all w-full outline-none focus-visible:ring-2 focus-visible:ring-sp-brand">
          <Settings className="w-5 h-5 text-sp-text-3" />
          <span className="font-medium text-sm">Settings</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sp-danger hover:bg-sp-danger-dim transition-all w-full mt-1 outline-none focus-visible:ring-2 focus-visible:ring-sp-brand"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  )
}
