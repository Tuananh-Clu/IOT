import { useState } from 'react'
import { AlertCircle, CarFront, Loader2, Lock, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export interface UserAccount {
  id: string
  username: string
  resident_id: string | null
  role: 'user' | 'admin'
}

interface LoginProps {
  onLogin: (account: UserAccount) => void
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase
        .from('account')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      if (authError) throw authError
      if (!data) throw new Error('Account not found')

      onLogin({
        id: data.id,
        username: data.username,
        resident_id: data.resident_id,
        role: data.resident_id ? 'user' : 'admin',
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-[440px]">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-control border border-lot-divider bg-lot-panel">
            <CarFront className="h-6 w-6 text-lot-reserved" />
          </div>
          <div>
            <h1 className="digital-text text-3xl font-bold leading-8 text-lot-lane">Vung Tau Plaza</h1>
            <p className="text-sm text-lot-muted">RFID parking access console</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="painted-panel p-5">
          <div className="mb-5 rounded-control border border-lot-divider bg-black/20 p-4">
            <div className="lane-stripe mb-3 w-28" />
            <p className="digital-text text-2xl font-semibold text-lot-empty">ACCESS READY</p>
            <p className="text-sm text-lot-muted">Sign in with an admin or resident account.</p>
          </div>

          {error && (
            <div className="mb-4 flex gap-2 rounded-control border border-lot-occupied/40 bg-lot-occupied/10 p-3 text-sm text-lot-occupied">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-semibold text-lot-lane">Username</span>
            <span className="relative block">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lot-muted" />
              <input
                className="focus-track w-full rounded-control border border-lot-divider bg-lot-asphalt px-10 py-3 text-lot-lane placeholder:text-lot-muted"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="operator"
                required
              />
            </span>
          </label>

          <label className="mb-5 block">
            <span className="mb-1 block text-sm font-semibold text-lot-lane">Password</span>
            <span className="relative block">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lot-muted" />
              <input
                className="focus-track w-full rounded-control border border-lot-divider bg-lot-asphalt px-10 py-3 text-lot-lane placeholder:text-lot-muted"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="password"
                required
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="focus-track flex w-full items-center justify-center gap-2 rounded-control bg-lot-reserved px-4 py-3 font-bold text-lot-asphalt disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Open dashboard
          </button>
        </form>
      </section>
    </main>
  )
}
