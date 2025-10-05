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
    <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-3 space-y-3">
      <div className="font-semibold">{title}</div>
      <div className="space-y-3">
        {items.map(t => (
          <div key={t.id} className="rounded-xl border border-slate-200 p-3 shadow-sm">
            <div className="font-medium">{t.title}</div>
            <div className="text-xs text-slate-500">Priority: {t.priority}</div>
            {t.due_date && <div className="text-xs text-slate-500">Due: {t.due_date}</div>}
            <div className="flex gap-2 mt-2">
              {t.status !== 'in_progress' && t.status !== 'done' && (
                <button onClick={() => setStatus(t.id, 'in_progress')} className="px-2 py-1 text-sm rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition">В работу</button>
              )}
              {t.status !== 'done' && (
                <button onClick={() => setStatus(t.id, 'done')} className="px-2 py-1 text-sm rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition">Готово</button>
              )}
              <button onClick={() => remove(t.id)} className="px-2 py-1 text-sm rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition">Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-3 md:flex md:items-center md:gap-3 space-y-2 md:space-y-0">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title" className="flex-1 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        <select value={priority} onChange={e=>setPriority(e.target.value as any)} className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </select>
        <button onClick={addTask} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition">Добавить</button>
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


