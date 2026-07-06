import { useState } from "react"
import {
  KeyRound,
  Lock,
  User,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

export interface UserAccount {
  id: string
  username: string
  resident_id: string | null
  role: "user" | "admin"
}

interface LoginProps {
  onLogin: (account: UserAccount) => void
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("account")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("Invalid username or password")
        }
        throw error
      }

      if (data) {
        const account: UserAccount = {
          id: data.id,
          username: data.username,
          resident_id: data.resident_id,
          role: data.resident_id ? "user" : "admin",
        }
        onLogin(account)
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sp-void flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sp-brand-glow via-sp-void to-sp-void opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sp-void/80 to-sp-void z-0 pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sp-elevated border border-sp-border shadow-brand-glow mb-5">
            <KeyRound className="w-8 h-8 text-sp-brand" />
          </div>
          <h1 className="font-display text-display-sm text-sp-text tracking-tight mb-2">
            ParkFlow<span className="text-sp-brand">.OS</span>
          </h1>
          <p className="text-body-sm text-sp-text-3">
            Authentication Gateway
          </p>
        </div>

        <div className="sp-panel-elevated p-8 animate-fade-in relative shadow-[0_0_40px_rgba(59,130,246,0.1)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-sp-brand to-transparent opacity-50"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-sp-danger-dim border border-sp-danger/30 text-sp-danger text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-sp-text-3 tracking-wider uppercase pl-1">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sp-text-3 group-focus-within:text-sp-brand transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-sp-base border border-sp-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-sp-text placeholder:text-sp-text-3 focus:outline-none focus:border-sp-brand focus:ring-1 focus:ring-sp-brand transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1 pr-1">
                  <label className="text-[11px] font-semibold text-sp-text-3 tracking-wider uppercase">
                    Security Key
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sp-text-3 group-focus-within:text-sp-brand transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-sp-base border border-sp-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-sp-text placeholder:text-sp-text-3 focus:outline-none focus:border-sp-brand focus:ring-1 focus:ring-sp-brand transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full group flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed bg-sp-brand hover:bg-sp-brand/90 text-white shadow-brand-glow focus-ring`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Authenticate</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-sp-border text-center">
            <p className="text-xs text-sp-text-3 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sp-available shadow-available-glow animate-pulse"></span>
              System Online - Secure Connection
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
