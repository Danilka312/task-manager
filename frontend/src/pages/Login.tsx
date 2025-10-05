import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { setTokens } from '../store/auth'

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demopass')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (tab === 'login') {
        const form = new URLSearchParams()
        form.set('username', email)
        form.set('password', password)
        const { data } = await api.post('/api/auth/login', form, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        setTokens({ access: data.access, refresh: data.refresh })
        navigate('/app')
      } else {
        // basic client-side validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error('Please enter a valid email')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        const payload: { email: string; password: string; full_name?: string } = { email, password }
        if (fullName.trim()) payload.full_name = fullName.trim()
        const { data } = await api.post('/api/auth/register', payload)
        setTokens({ access: data.access, refresh: data.refresh })
        navigate('/app')
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const msg =
        tab === 'login'
          ? detail || 'Login failed'
          : detail === 'email_taken'
          ? 'This email is already taken'
          : detail || err?.message || 'Sign up failed'
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-start md:place-items-center">
      <div className="max-w-5xl w-full mx-auto px-4 md:px-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm mx-auto bg-white shadow-sm rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`px-3 py-1 rounded-lg border transition ${tab==='login' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`px-3 py-1 rounded-lg border transition ${tab==='signup' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            >
              Sign up
            </button>
          </div>
          {error && <div className="text-rose-600 text-sm">{error}</div>}
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          {tab === 'signup' && (
            <div className="space-y-1">
              <label className="text-sm text-slate-600">Full name (optional)</label>
              <input value={fullName} onChange={e=>setFullName(e.target.value)} type="text" className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <button disabled={loading} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 transition disabled:opacity-60">
            {loading ? (tab==='login' ? 'Signing in...' : 'Creating account...') : (tab==='login' ? 'Sign in' : 'Create account')}
          </button>
        </form>
      </div>
    </div>
  )
}


