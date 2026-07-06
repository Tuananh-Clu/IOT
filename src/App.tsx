import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { UserDashboard } from '@/pages/UserDashboard'
import { Residents } from '@/pages/Residents'
import { Cards } from '@/pages/Cards'
import { Sensors } from '@/pages/Sensors'
import { Login, type UserAccount } from '@/pages/Login'
import { useDashboardData } from '@/hooks/useDashboardData'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { AlertTriangle } from 'lucide-react'
import { type Resident } from '@/types'
import { useSensorStream } from '@/hooks/useSensorStream'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user')
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  const { data, loading, error } = useDashboardData()
  
  // Real-time flame detection for the top-level layout
  const { flameDetected } = useSensorStream(1) // Keep a short stream just for the layout banner

  // Local state for residents to simulate CRUD
  const [localResidents, setLocalResidents] = useState<Resident[]>([])

  useEffect(() => {
    const savedSession = localStorage.getItem('nexus_session')
    if (savedSession) {
      try {
        const account = JSON.parse(savedSession) as UserAccount
        setCurrentUser(account)
        setUserRole(account.role)
        setIsAuthenticated(true)
      } catch (e) {
        localStorage.removeItem('nexus_session')
      }
    }
    setIsAuthLoading(false)
  }, [])

  const handleLogin = (account: UserAccount) => {
    localStorage.setItem('nexus_session', JSON.stringify(account))
    setCurrentUser(account)
    setUserRole(account.role)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('nexus_session')
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  useEffect(() => {
    if (data?.residents) {
      setLocalResidents(data.residents)
    }
  }, [data])

  if (isAuthLoading) {
    return <div className="min-h-screen bg-sp-base flex items-center justify-center"><SkeletonCard className="w-80" /></div>
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  if (loading) return (
    <div className="min-h-screen bg-sp-base flex items-center justify-center">
      <div className="w-full max-w-4xl p-8 space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen bg-sp-base flex items-center justify-center p-8">
      <EmptyState 
        icon={AlertTriangle} 
        title="Connection Error" 
        message={error} 
        className="bg-sp-surface border border-sp-border rounded-xl p-12"
      />
    </div>
  )
  
  if (!data) return null

  // Inject locally managed residents into data stream
  const currentData = { ...data, residents: localResidents }

  return (
    <AppLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      userRole={userRole}
      onLogout={handleLogout}
      flameDetected={flameDetected}
    >
      {activeTab === 'overview' && (
        currentUser?.role === 'user' ? (
          <UserDashboard residentId={currentUser.resident_id!} data={currentData} />
        ) : (
          <AdminDashboard data={currentData} />
        )
      )}
      {activeTab === 'residents' && <Residents data={currentData.residents} onUpdateData={setLocalResidents} />}
      {activeTab === 'cards' && <Cards data={currentData.residents} />}
      {activeTab === 'sensors' && <Sensors sensors={currentData.sensors} />}
    </AppLayout>
  )
}
