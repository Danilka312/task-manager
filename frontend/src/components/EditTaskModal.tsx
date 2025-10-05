import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

export type Task = {
  id: number
  title: string
  description?: string | null
  due_date?: string | null
  priority: 'low'|'medium'|'high'|'urgent'
  status: 'todo'|'in_progress'|'done'
}

type Props = {
  open: boolean
  task: Task | null
  onClose: () => void
  onSaved: (task: Task) => void
}

export default function EditTaskModal({ open, task, onClose, onSaved }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [status, setStatus] = useState<Task['status']>('todo')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!task) return
    setTitle(task.title || '')
    setDescription(task.description || '')
    setDueDate(task.due_date || '')
    setPriority(task.priority)
    setStatus(task.status)
  }, [task, open])

  const disabled = useMemo(() => !title.trim() || saving, [title, saving])

  const onSave = async () => {
    if (!task) return
    setSaving(true)
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
      }
      if (dueDate) payload.due_date = dueDate
      else payload.due_date = null

      const { data } = await api.patch<Task>(`/api/tasks/${task.id}`, payload)
      onSaved(data)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Edit task</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Title</label>
            <input
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Title"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
              className="w-full min-h-[80px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Description"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Due date</label>
              <input
                type="date"
                value={dueDate || ''}
                onChange={(e)=>setDueDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e)=>setPriority(e.target.value as Task['priority'])}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="urgent">urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e)=>setStatus(e.target.value as Task['status'])}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todo">todo</option>
                <option value="in_progress">in_progress</option>
                <option value="done">done</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={disabled}
            aria-disabled={disabled}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

