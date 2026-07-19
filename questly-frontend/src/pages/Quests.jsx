import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks'

const FILTERS = ['All', 'Open', 'Completed', 'High priority']

export default function Quests() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })

  async function load() {
    try {
      setTasks(await getTasks(user.userId))
    } catch (err) {
      setError(err.message)
    }
  }
  useEffect(() => { load() }, [user.userId])

  async function toggleTask(task) {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    setTasks((prev) => prev.map((t) => (t.taskId === task.taskId ? { ...t, status: nextStatus } : t)))
    try {
      await updateTask(user.userId, task.taskId, { ...task, status: nextStatus })
    } catch (err) {
      setError(err.message); load()
    }
  }

  async function removeTask(taskId) {
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId))
    try {
      await deleteTask(user.userId, taskId)
    } catch (err) {
      setError(err.message); load()
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      const created = await createTask(user.userId, {
        title: form.title,
        description: form.description,
        status: 'PENDING',
        priority: form.priority,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      })
      setTasks((prev) => [created, ...prev])
      setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const visible = tasks.filter((t) => {
    if (filter === 'Open') return t.status !== 'COMPLETED'
    if (filter === 'Completed') return t.status === 'COMPLETED'
    if (filter === 'High priority') return (t.priority || '').toUpperCase() === 'HIGH'
    return true
  })

  return (
    <section>
      <div className="page-head">
        <div><h1>Quest Log</h1><p>Every task logged here earns XP toward your next level</p></div>
        <button className="cta-btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New quest'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <form className="card" style={{ marginBottom: 16 }} onSubmit={handleCreate}>
          <div className="field">
            <label>Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Write Q3 project proposal" />
          </div>
          <div className="field">
            <label>Description / category</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deep Work" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 13px', color: 'var(--text)' }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Due date</label>
              <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <button className="cta-btn" type="submit">Add quest</button>
        </form>
      )}

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button key={f} className={`chip-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty card"><div className="glyph">🗒️</div>No quests match this filter.</div>
      ) : (
        <div className="quest-list">
          {visible.map((t) => {
            const priority = (t.priority || 'low').toLowerCase()
            const done = t.status === 'COMPLETED'
            return (
              <div key={t.taskId} className={`quest priority-${priority} ${done ? 'done' : ''}`}>
                <button className="check" onClick={() => toggleTask(t)}>{done ? '✓' : ''}</button>
                <div className="qbody">
                  <div className="qtitle">{t.title}</div>
                  <div className="qmeta">
                    <span>{t.dueDate ? new Date(t.dueDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'No due date'}</span>
                    {t.description && <span className="tag">{t.description}</span>}
                  </div>
                </div>
                <button className="cta-btn ghost" onClick={() => removeTask(t.taskId)}>Delete</button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
