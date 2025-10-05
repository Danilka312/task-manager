import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

type Summary = { active: number; done: number; overdue: number }

export default function AnalyticsPage() {
  const [data, setData] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Summary>('/api/analytics/summary')
        setData(res.data)
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load analytics')
      }
    })()
  }, [])

  const chartData = useMemo(() => {
    const a = data?.active ?? 0
    const d = data?.done ?? 0
    const o = data?.overdue ?? 0
    const max = Math.max(1, a, d, o)
    return [
      { label: 'Active', value: a, color: 'bg-blue-500' },
      { label: 'Done', value: d, color: 'bg-emerald-500' },
      { label: 'Overdue', value: o, color: 'bg-rose-500' },
    ].map(it => ({ ...it, width: `${(it.value / max) * 100}%` }))
  }, [data])

  return (
    <div className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border shadow-sm p-4">
          <div className="text-slate-500 text-sm">Active</div>
          <div className="text-3xl font-semibold">{data?.active ?? 0}</div>
        </div>
        <div className="rounded-2xl border shadow-sm p-4">
          <div className="text-slate-500 text-sm">Done</div>
          <div className="text-3xl font-semibold">{data?.done ?? 0}</div>
        </div>
        <div className="rounded-2xl border shadow-sm p-4">
          <div className="text-slate-500 text-sm">Overdue</div>
          <div className="text-3xl font-semibold">{data?.overdue ?? 0}</div>
        </div>
      </div>

      <div className="rounded-2xl border shadow-sm p-4 space-y-3">
        <div className="font-semibold">Summary</div>
        <div className="space-y-2">
          {chartData.map((it) => (
            <div key={it.label} className="space-y-1">
              <div className="text-sm text-slate-600 flex justify-between">
                <span>{it.label}</span>
                <span>{it.value}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full">
                <div className={`h-2 ${it.color} rounded-full transition`} style={{ width: it.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


