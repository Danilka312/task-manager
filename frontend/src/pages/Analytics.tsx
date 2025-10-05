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
    const total = a + d + o
    const safeTotal = total > 0 ? total : 0
    const ratio = (v: number) => (safeTotal === 0 ? 0 : v / safeTotal)
    return [
      { label: 'Active', value: a, color: 'bg-indigo-500', ratio: ratio(a) },
      { label: 'Done', value: d, color: 'bg-emerald-500', ratio: ratio(d) },
      { label: 'Overdue', value: o, color: 'bg-rose-500', ratio: ratio(o) },
    ]
  }, [data])

  const widthClass = (ratio: number) => {
    const step = Math.round(ratio * 12)
    const clamped = Math.max(0, Math.min(12, step))
    return [
      'w-0','w-1/12','w-2/12','w-3/12','w-4/12','w-5/12','w-6/12',
      'w-7/12','w-8/12','w-9/12','w-10/12','w-11/12','w-full'
    ][clamped]
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {error && <div className="text-rose-600 text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-4">
          <div className="text-slate-500 text-sm">Active</div>
          <div className="text-3xl font-bold">{data?.active ?? 0}</div>
        </div>
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-4">
          <div className="text-slate-500 text-sm">Done</div>
          <div className="text-3xl font-bold">{data?.done ?? 0}</div>
        </div>
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-4">
          <div className="text-slate-500 text-sm">Overdue</div>
          <div className="text-3xl font-bold">{data?.overdue ?? 0}</div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="font-semibold">Summary</div>
        <div className="space-y-2">
          {chartData.map((it) => (
            <div key={it.label} className="space-y-1">
              <div className="text-sm text-slate-600 flex justify-between">
                <span>{it.label}</span>
                <span>{it.value}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded overflow-hidden">
                <div className={`h-2 ${it.color}`} style={{ width: `${Math.round(it.ratio * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


