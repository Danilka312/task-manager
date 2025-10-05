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
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-2xl border shadow p-6 space-y-4">
        <div className="text-xl font-semibold">Sign in</div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="space-y-1">
          <label className="text-sm text-slate-600">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-600">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        <button disabled={loading} className="w-full rounded-xl bg-slate-900 text-white py-2 hover:bg-slate-800 transition disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}


