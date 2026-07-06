import { Bell, Search, User, Menu, LogOut } from 'lucide-react'

interface TopBarProps {
  userRole?: 'admin' | 'user'
  onLogout?: () => void
}

export function TopBar({ userRole = 'admin', onLogout }: TopBarProps) {
  return (
    <header className="h-[72px] bg-sp-base border-b border-sp-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 backdrop-blur-md bg-opacity-80">
      <div className="flex items-center gap-4">
        {/* Mobile menu button (hidden on md) */}
        <button className="md:hidden p-2 text-sp-text-2 hover:bg-sp-surface rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-sp-text-3 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-sp-surface border border-sp-border rounded-full pl-10 pr-4 py-1.5 text-sm text-sp-text focus-ring placeholder:text-sp-text-3 w-64 transition-all focus:w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-sp-text-2 hover:text-sp-text hover:bg-sp-surface rounded-full transition-colors focus-ring">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sp-brand" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-sp-border">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-sp-text">
              {userRole === 'admin' ? 'System Admin' : 'Resident'}
            </span>
            <span className="text-[11px] text-sp-text-3 uppercase tracking-wider">
              {userRole === 'admin' ? 'Management' : 'User'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-sp-elevated border border-sp-border flex items-center justify-center cursor-pointer hover:border-sp-border-strong transition-colors">
            <User className="w-5 h-5 text-sp-text-2" />
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="ml-2 p-2 text-sp-danger hover:bg-sp-danger-dim rounded-lg transition-colors md:hidden"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
