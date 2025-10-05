import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
} from 'date-fns'

type Task = {
  id: number
  title: string
  description?: string | null
  due_date?: string | null
  priority: 'low'|'medium'|'high'|'urgent'
  status: 'todo'|'in_progress'|'done'
}

type TaskList = {
  items: Task[]
  total: number
  page: number
  page_size: number
}

type ByDate = Record<string, Task[]>

const priorityBadge = (p: Task['priority']) => {
  switch (p) {
    case 'urgent': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
    case 'high': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
    case 'medium': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200 border border-sky-200 dark:border-sky-800'
    case 'low': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
  }
}

export default function CalendarPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [viewDate, setViewDate] = useState<Date>(new Date())
  const [openDay, setOpenDay] = useState<string | null>(null) // 'YYYY-MM-DD'
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get<TaskList>('/api/tasks/', { params: { page: 1, page_size: 100 } })
        setTasks(data.items)
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  // Keyboard shortcuts: ← prev, → next, T today
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setViewDate(d => subMonths(d, 1))
      if (e.key === 'ArrowRight') setViewDate(d => addMonths(d, 1))
      if (e.key.toLowerCase() === 't') setViewDate(new Date())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const byDate: ByDate = useMemo(() => {
    const map: ByDate = {}
    for (const t of tasks) {
      const d = (t.due_date || '').slice(0, 10)
      if (!d) continue
      if (!map[d]) map[d] = []
      map[d].push(t)
    }
    // sort tasks per day by priority urgency
    const weight: Record<Task['priority'], number> = { urgent: 0, high: 1, medium: 2, low: 3 }
    Object.keys(map).forEach(k => map[k].sort((a,b)=>weight[a.priority]-weight[b.priority]))
    return map
  }, [tasks])

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  let calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  let days = eachDayOfInterval({ start: calStart, end: calEnd })
  if (days.length < 42) {
    // ensure 6 rows × 7 columns
    const extra = eachDayOfInterval({ start: new Date(calEnd.getTime() + 24*60*60*1000), end: new Date(calEnd.getTime() + 7*24*60*60*1000) })
    days = [...days, ...extra]
  }

  const todayStr = new Date().toISOString().slice(0,10)

  const markDone = async (id: number) => {
    // optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t))
    try {
      await api.patch(`/api/tasks/${id}`, { status: 'done' })
    } catch (err) {
      // revert on error
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'todo' } : t))
    }
  }

  const openBoardForDate = (dateKey: string) => {
    // Navigate to board filtered by exact date
    navigate(`/app?due_from=${dateKey}&due_to=${dateKey}`)
  }

  const WeekdayHeader = () => (
    <div className="grid grid-cols-7 gap-2 md:gap-3 mb-2 md:mb-3 text-xs md:text-sm text-slate-500 dark:text-slate-400">
      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
        <div key={d} className="px-1">{d}</div>
      ))}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setViewDate(d=>subMonths(d,1))} className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">‹ Prev</button>
          <button onClick={() => setViewDate(new Date())} className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">Today</button>
          <button onClick={() => setViewDate(d=>addMonths(d,1))} className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">Next ›</button>
        </div>
        <div className="text-xl md:text-2xl font-semibold">
          {format(viewDate, 'MMMM yyyy')}
        </div>
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Legend: <span className="inline-block w-2 h-2 rounded-full bg-rose-500 align-middle mr-1"></span> overdue • urgent/high/medium/low badges</div>

      <WeekdayHeader />

      {error && <div className="text-rose-600 text-sm mb-3">{error}</div>}

      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {loading ? (
          Array.from({ length: 42 }).map((_,i)=> (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 md:p-3 min-h-[110px] animate-pulse bg-slate-50 dark:bg-slate-900" />
          ))
        ) : (
          days.map((d) => {
            const key = d.toISOString().slice(0,10)
            const isOther = !isSameMonth(d, viewDate)
            const itemsAll = byDate[key] || []
            const items = itemsAll.filter(t => t.status !== 'done')
            const more = Math.max(0, items.length - 3)
            const hasOverdue = key < todayStr && items.length > 0
            const isToday = key === todayStr
            return (
              <button
                type="button"
                key={key}
                onClick={() => setOpenDay(key)}
                className={[
                  'relative text-left rounded-xl border p-2 md:p-3 min-h-[110px] bg-white dark:bg-slate-900 transition',
                  'border-slate-200 dark:border-slate-700',
                  isOther ? 'opacity-50' : '',
                  isToday ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-900' : '',
                ].join(' ')}
              >
                {hasOverdue && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
                )}
                <div className="text-sm md:text-base font-medium">{d.getDate()}</div>
                <div className="mt-1 space-y-1">
                  {items.slice(0,3).map(t => (
                    <span key={t.id} title={t.description || undefined} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs truncate max-w-full ${priorityBadge(t.priority)}`}>
                      {t.title.length > 18 ? t.title.slice(0,18) + '…' : t.title}
                    </span>
                  ))}
                  {more > 0 && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">+{more}</span>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Side panel / modal */}
      {openDay && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenDay(null)} />
          <div className="absolute right-0 top-0 h-full w-full md:w-[480px] bg-white dark:bg-slate-900 shadow-xl border-l border-slate-200 dark:border-slate-700 p-4 md:p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">{openDay} — Tasks</div>
              <button onClick={() => setOpenDay(null)} className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
            </div>
            <div className="space-y-3">
              {(byDate[openDay]?.filter(t => t.status !== 'done') || []).map(t => (
                <div key={t.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium truncate">{t.title}</div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${priorityBadge(t.priority)}`}>{t.priority}</span>
                  </div>
                  {t.description && (
                    <div
                      className="mt-1 text-sm text-slate-600 dark:text-slate-300"
                      title={t.description || undefined}
                    >
                      {t.description.length > 100 ? t.description.slice(0, 100) + '…' : t.description}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">status: <span className="inline-block rounded-full px-2 py-0.5 border border-slate-200 dark:border-slate-700">{t.status}</span></div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">due: {t.due_date || '—'}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => openBoardForDate(openDay)} className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition">Open on Board</button>
                    {t.status !== 'done' && (
                      <button onClick={() => markDone(t.id)} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition">Mark done</button>
                    )}
                  </div>
                </div>
              ))}
              {(byDate[openDay]?.filter(t => t.status !== 'done') || []).length === 0 && (
                <div className="text-sm text-slate-500 dark:text-slate-400">No tasks for this day.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
