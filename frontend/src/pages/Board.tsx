import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

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

export default function BoardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'low'|'medium'|'high'|'urgent'>('medium')

  const priorityColors = {
    low: '#86efac',
    medium: '#60a5fa',
    high: '#f59e0b',
    urgent: '#ef4444',
  } as const

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<TaskList>('/api/tasks/', { params: { page: 1, page_size: 50 } })
      setTasks(data.items)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const grouped = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  }), [tasks])

  const addTask = async () => {
    if (!title.trim()) return
    try {
      await api.post('/api/tasks/', { title, priority })
      setTitle('')
      setPriority('medium')
      await fetchTasks()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to add task')
    }
  }

  const setStatus = async (id: number, status: Task['status']) => {
    try {
      await api.patch(`/api/tasks/${id}`, { status })
      await fetchTasks()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update task')
    }
  }

  const remove = async (id: number) => {
    try {
      await api.delete(`/api/tasks/${id}`)
      await fetchTasks()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete task')
    }
  }

  const Column = ({ title, items }: { title: string; items: Task[] }) => (
    <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-3">
      <div className="font-semibold text-slate-900 dark:text-slate-100">{title}</div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-slate-500 dark:text-slate-400 italic p-3">No tasks yet</div>
        ) : items.map(t => {
          const accent = priorityColors[t.priority]
          return (
            <div
              key={t.id}
              className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-3"
              style={{ ['--pcolor' as any]: accent }}
            >
              <span className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundColor: 'var(--pcolor)' }} />
              <span className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[var(--pcolor)]" />
              <div className="relative z-10 space-y-2">
                <div className="flex items-center text-sm font-medium text-slate-900 dark:text-slate-100">
                  <span className="leading-tight">{t.title}</span>
                  <span
                    className="ml-2 px-2 py-0.5 text-xs rounded-full uppercase tracking-wide"
                    style={{ backgroundColor: 'var(--pcolor)', color: '#fff' }}
                  >
                    {t.priority}
                  </span>
                </div>
                {t.due_date && <div className="text-xs text-slate-600 dark:text-slate-300">Due: {t.due_date}</div>}
                <div className="flex flex-wrap gap-2 pt-1">
                  {t.status !== 'in_progress' && t.status !== 'done' && (
                    <button
                      aria-label="Mark as in progress"
                      onClick={() => setStatus(t.id, 'in_progress')}
                      className="px-2 py-1 text-sm rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      В работу
                    </button>
                  )}
                  {t.status !== 'done' && (
                    <button
                      aria-label="Mark as done"
                      onClick={() => setStatus(t.id, 'done')}
                      className="px-2 py-1 text-sm rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Готово
                    </button>
                  )}
                  <button
                    aria-label="Delete task"
                    onClick={() => remove(t.id)}
                    className="px-2 py-1 text-sm rounded-xl bg-rose-500 hover:bg-rose-600 dark:hover:bg-rose-500 text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Create a task</h2>
        <div className="md:flex md:items-center md:gap-3 space-y-2 md:space-y-0">
          <input aria-label="Task title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title" className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <div className="md:w-auto">
            <label htmlFor="priority" className="sr-only">Priority</label>
            <select aria-label="Priority" id="priority" value={priority} onChange={e=>setPriority(e.target.value as any)} className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
          </div>
          <button
            aria-label="Add task"
            onClick={addTask}
            disabled={!title.trim()}
            aria-disabled={!title.trim()}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Добавить
          </button>
        </div>
      </div>
      {error && <div className="text-rose-600 text-sm">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Column title="To Do" items={grouped.todo} />
          <Column title="In Progress" items={grouped.in_progress} />
          <Column title="Done" items={grouped.done} />
        </div>
      )}
    </div>
  )
}
