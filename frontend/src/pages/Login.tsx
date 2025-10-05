import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { setTokens } from '../store/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demopass')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const form = new URLSearchParams()
      form.set('username', email)
      form.set('password', password)
      const { data } = await api.post('/api/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      setTokens({ access: data.access, refresh: data.refresh })
      navigate('/app')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Login failed'
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-start md:place-items-center">
      <div className="max-w-5xl w-full mx-auto px-4 md:px-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm mx-auto bg-white shadow-sm rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="text-xl font-semibold">Sign in</div>
          {error && <div className="text-rose-600 text-sm">{error}</div>}
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <button disabled={loading} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 transition disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}


