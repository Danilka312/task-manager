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

  // reserved for potential future use: segment width helper

  return (
    <div className="space-y-6">
      {error && <div className="text-rose-600 text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-slate-500 dark:text-slate-300 text-sm">Active</div>
          <div className="text-3xl font-bold">{data?.active ?? 0}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-slate-500 dark:text-slate-300 text-sm">Done</div>
          <div className="text-3xl font-bold">{data?.done ?? 0}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-slate-500 dark:text-slate-300 text-sm">Overdue</div>
          <div className="text-3xl font-bold">{data?.overdue ?? 0}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="font-semibold">Summary</div>
        <div className="space-y-2">
          {chartData.map((it) => (
            <div key={it.label} className="space-y-1">
              <div className="text-sm text-slate-600 dark:text-slate-300 flex justify-between">
                <span>{it.label}</span>
                <span>{it.value}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
                <div className={`h-2 ${it.color}`} style={{ width: `${Math.round(it.ratio * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


