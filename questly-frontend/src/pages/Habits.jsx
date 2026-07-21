import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getHabits,
  createHabit,
  deleteHabit,
  getHabitLogs,
  createHabitLog,
  updateHabitLog,
} from '../api/habits'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// Counts consecutive completed days ending today or yesterday (a gap of
// more than one day breaks the streak, same convention as the backend's
// XP streak logic).
function computeStreak(logs) {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  )
  if (completedDates.size === 0) return 0

  let streak = 0
  let cursor = new Date()
  // If today isn't checked in yet, start counting from yesterday instead,
  // so an in-progress streak doesn't show as broken before the day ends.
  if (!completedDates.has(todayStr())) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (completedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function HabitCard({ habit, onChanged }) {
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    try {
      setLogs(await getHabitLogs(habit.id))
    } catch (err) {
      setError(err.message)
    }
  }
  useEffect(() => { load() }, [habit.id])

  const today = todayStr()
  const todayLog = logs.find((l) => l.date === today)
  const target = habit.targetCount || 1
  const todayCount = todayLog?.count || 0
  const streak = computeStreak(logs)

  async function handleCheckIn() {
    setBusy(true)
    setError('')
    try {
      const nextCount = todayCount + 1
      const completed = nextCount >= target
      if (todayLog) {
        await updateHabitLog(todayLog.id, { ...todayLog, count: nextCount, completed })
      } else {
        await createHabitLog({
          habitId: habit.id,
          userId: habit.userId,
          date: today,
          count: nextCount,
          completed,
        })
      }
      await load()
      onChanged?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteHabit(habit.id)
      onChanged?.()
    } catch (err) {
      setError(err.message)
    }
  }

  const percent = Math.min(100, Math.round((todayCount / target) * 100))
  const doneToday = todayCount >= target

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="challenge-head">
        <div>
          <h3>{habit.name}</h3>
          <div className="dates">
            {habit.frequency === 'WEEKLY' ? 'Weekly' : 'Daily'} · target {target}
            {streak > 0 && <> · 🔥 {streak}-day streak</>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`cta-btn ${doneToday ? 'ghost' : ''}`}
            onClick={handleCheckIn}
            disabled={busy || doneToday}
          >
            {doneToday ? 'Done today' : `Check in (${todayCount}/${target})`}
          </button>
          <button className="cta-btn ghost" onClick={handleDelete} title="Delete habit">
            Delete
          </button>
        </div>
      </div>
      {error && <div className="error-banner">{error}</div>}
      <div className="xp-track" style={{ marginTop: 10 }}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default function Habits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', frequency: 'DAILY', targetCount: 1 })

  async function load() {
    try {
      setHabits(await getHabits(user.userId))
    } catch (err) {
      setError(err.message)
    }
  }
  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createHabit({ ...form, userId: user.userId, targetCount: Number(form.targetCount) || 1 })
      setForm({ name: '', frequency: 'DAILY', targetCount: 1 })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <div className="page-head">
        <div><h1>Habits</h1><p>Small things, done consistently</p></div>
        <button className="cta-btn ghost" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New habit'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <form className="card" style={{ marginBottom: 16 }} onSubmit={handleCreate}>
          <div className="field">
            <label>Habit name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Drink water"
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Target count</label>
              <input
                type="number"
                min="1"
                required
                value={form.targetCount}
                onChange={(e) => setForm({ ...form, targetCount: e.target.value })}
              />
            </div>
          </div>
          <button className="cta-btn" type="submit">Create</button>
        </form>
      )}

      {habits.length === 0 ? (
        <div className="empty card"><div className="glyph">◆</div>No habits yet — add your first one.</div>
      ) : (
        habits.map((h) => <HabitCard key={h.id} habit={h} onChanged={load} />)
      )}
    </section>
  )
}