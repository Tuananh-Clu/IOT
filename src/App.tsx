import { useEffect, useMemo, useState } from 'react'
import { Activity, CarFront, CreditCard, IdCard, LogOut, RadioTower, UserRound } from 'lucide-react'
import { fetchDashboard, type DashboardData } from '@/api/dashboard'
import { useSensorStream } from '@/hooks/useSensorStream'
import { Login, type UserAccount } from '@/pages/Login'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { CustomerPayments } from '@/pages/CustomerPayments'
import { Residents } from '@/pages/Residents'
import { Sensors } from '@/pages/Sensors'
import { UserDashboard } from '@/pages/UserDashboard'
import { EmptyState, LoadingDeck } from '@/components/ui/Primitives'

type Tab = 'overview' | 'devices' | 'residents' | 'resident' | 'billing'

const SESSION_KEY = 'parking_floor_session'

export default function App() {
  const [account, setAccount] = useState<UserAccount | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { flameDetected } = useSensorStream(1)

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserAccount
        setAccount(parsed)
        setTab(parsed.role === 'admin' ? 'overview' : 'resident')
      } catch {
        localStorage.removeItem(SESSION_KEY)
      }
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchDashboard()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu bãi xe'))
      .finally(() => setLoading(false))
  }, [])

  const tabs = useMemo(() => {
    if (account?.role === 'admin') {
      return [
        { id: 'overview' as const, label: 'Tổng quan', icon: CarFront },
        { id: 'devices' as const, label: 'Thiết bị', icon: RadioTower },
        { id: 'residents' as const, label: 'Cư dân', icon: IdCard },
      ]
    }
    return [
      { id: 'resident' as const, label: 'Xe của tôi', icon: UserRound },
      { id: 'billing' as const, label: 'Thanh toán', icon: CreditCard },
    ]
  }, [account?.role])

  const handleLogin = (nextAccount: UserAccount) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextAccount))
    setAccount(nextAccount)
    setTab(nextAccount.role === 'admin' ? 'overview' : 'resident')
  }

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY)
    setAccount(null)
  }

  if (!account) return <Login onLogin={handleLogin} />

  if (loading) {
    return (
      <main className="min-h-screen p-4 md:p-6">
        <LoadingDeck />
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen p-4 md:p-6">
        <EmptyState title="Kết nối dữ liệu bị gián đoạn" message={error ?? 'Không có dữ liệu dashboard trả về.'} />
      </main>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-lot-divider bg-lot-asphalt/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-control border border-lot-divider bg-lot-panel">
              <CarFront className="h-5 w-5 text-lot-reserved" />
            </div>
            <div>
              <p className="digital-text text-xl font-bold leading-5 text-lot-lane">Vung Tau Plaza</p>
              <p className="text-xs text-lot-muted">Trung tâm điều phối bãi xe thông minh</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {flameDetected && (
              <span className="rounded-control border border-lot-occupied/50 bg-lot-occupied/15 px-3 py-2 text-sm text-lot-occupied">
                Cảnh báo an toàn
              </span>
            )}
            <span className="rounded-control border border-lot-divider px-3 py-2 text-sm text-lot-muted">
              {account.role === 'admin' ? 'Khu quản trị' : account.username}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="focus-track grid h-10 w-10 place-items-center rounded-control border border-lot-divider text-lot-muted hover:text-lot-lane"
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 md:grid-cols-[84px_minmax(0,1fr)] md:px-6">
        <nav className="control-surface flex gap-2 rounded-control p-2 md:sticky md:top-[76px] md:h-[calc(100vh-100px)] md:flex-col">
          {tabs.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`focus-track flex flex-1 items-center justify-center gap-2 rounded-control px-3 py-3 text-sm md:flex-none md:flex-col ${
                  active
                    ? 'bg-lot-reserved text-lot-asphalt'
                    : 'text-lot-muted hover:bg-lot-lane/8 hover:text-lot-lane'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="md:text-[11px]">{item.label}</span>
              </button>
            )
          })}
          <div className="mt-auto hidden rounded-control border border-lot-divider p-2 text-center md:block">
            <Activity className="mx-auto mb-2 h-4 w-4 text-lot-empty" />
            <p className="digital-text text-lg font-bold text-lot-empty">{data.slots.length}</p>
            <p className="text-[10px] text-lot-muted">ô đỗ</p>
          </div>
        </nav>

        <main className="min-w-0 pb-10">
          {tab === 'overview' && account.role === 'admin' && <AdminDashboard data={data} />}
          {tab === 'devices' && account.role === 'admin' && <Sensors sensors={data.sensors} />}
          {tab === 'residents' && account.role === 'admin' && <Residents data={data} />}
          {tab === 'resident' && <UserDashboard residentId={account.resident_id ?? data.residents[0]?.id ?? ''} data={data} />}
          {tab === 'billing' && <CustomerPayments residentId={account.resident_id ?? data.residents[0]?.id ?? ''} data={data} />}
        </main>
      </div>
    </div>
  )
}
