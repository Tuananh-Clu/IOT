import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { AlertBanner } from '@/components/ui/AlertBanner'

export function AppLayout({
  children,
  activeTab,
  onTabChange,
  userRole = 'admin',
  onLogout,
  flameDetected = false, // Prop for realtime from useSensorStream
}: {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  userRole?: 'admin' | 'user'
  onLogout?: () => void
  flameDetected?: boolean
}) {
  return (
    <div className="min-h-screen bg-sp-base text-sp-text flex overflow-hidden">
      <Sidebar active={activeTab} onChange={onTabChange} userRole={userRole} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {flameDetected && (
          <div className="shrink-0">
            <AlertBanner />
          </div>
        )}
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <TopBar userRole={userRole} onLogout={onLogout} />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
            <div className="max-w-[1440px] mx-auto w-full pb-12">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
