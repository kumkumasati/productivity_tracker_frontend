import React, { useEffect, useRef, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getTasks, updateTask } from '../api/tasks'
import { getUserStats, getLevels, getXpLogs } from '../api/progress'
import { computeLevelProgress, groupXpByDay } from '../utils/xp'

function QuestRow({ task, onToggle }) {
  const priority = (task.priority || 'low').toLowerCase()
  const done = task.status === 'COMPLETED'
  return (
    <div className={`quest priority-${priority} ${done ? 'done' : ''}`}>
      <button className="check" onClick={() => onToggle(task)}>{done ? '✓' : ''}</button>
      <div className="qbody">
        <div className="qtitle">{task.title}</div>
        <div className="qmeta">
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'No due date'}</span>
          {task.description && <span className="tag">{task.description}</span>}
        </div>
      </div>
    </div>
  )
}

// Recharts tooltip styled to match the app's dark card look instead of the
// library's default white box.
function XpTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tip">
      <div className="chart-tip-day">{label}</div>
      <div className="chart-tip-val">{payload[0].value} XP</div>
    </div>
  )
}

// Completion-rate donut, pure SVG — animates via CSS on the stroke-dashoffset.
function CompletionDonut({ percent }) {
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" className="donut">
        <circle cx="50" cy="50" r={r} className="donut-track" />
        <circle
          cx="50" cy="50" r={r} className="donut-fill"
          strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <div className="donut-label">
        <div className="donut-pct">{percent}%</div>
        <div className="donut-sub">done</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState(null)
  const [levels, setLevels] = useState([])
  const [xpLogs, setXpLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLevelUp, setShowLevelUp] = useState(false)
  const prevLevel = useRef(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [t, s, lv, logs] = await Promise.all([
        getTasks(user.userId),
        getUserStats(user.userId),
        getLevels(),
        getXpLogs(user.userId),
      ])
      setTasks(t)
      setStats(s)
      setLevels(lv)
      setXpLogs(logs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user.userId])

  async function toggleTask(task) {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    setTasks((prev) => prev.map((t) => (t.taskId === task.taskId ? { ...t, status: nextStatus } : t)))
    try {
      await updateTask(user.userId, task.taskId, { ...task, status: nextStatus })
      load() // refresh stats/XP too — completing a quest may award XP server-side
    } catch (err) {
      setError(err.message)
      load() // revert to server truth on failure
    }
  }

  const completed = tasks.filter((t) => t.status === 'COMPLETED').length
  const completionPct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const streak = stats?.currentStreak ?? 0
  const longest = stats?.longestStreak ?? 0
  const progress = computeLevelProgress(levels, stats?.totalXp ?? 0)
  const xpByDay = groupXpByDay(xpLogs, 7)

  // Fire a brief level-up celebration whenever the computed level increases
  // from what we last saw (skips the very first load, so it doesn't fire
  // just because the page opened).
  useEffect(() => {
    if (prevLevel.current !== null && progress.level > prevLevel.current) {
      setShowLevelUp(true)
      const t = setTimeout(() => setShowLevelUp(false), 2200)
      return () => clearTimeout(t)
    }
    prevLevel.current = progress.level
  }, [progress.level])

  // Simple last-21-day streak strip (illustrative — backend doesn't expose
  // per-day history yet, so this lights up the last `streak` cells).
  const days = Array.from({ length: 21 }, (_, i) => i >= 21 - streak)

  return (
    <section style={{ position: 'relative' }}>
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="level-up-toast"
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <span className="level-up-badge">Lv {progress.level}</span>
            Level up! You reached level {progress.level}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-head">
        <div>
          <h1>{`Good to see you, ${user.username}`}</h1>
          <p>{tasks.length} quests today · {tasks.length - completed} left to keep your streak alive</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Level hero */}
      <div className="card level-hero" style={{ marginBottom: 16 }}>
        <motion.div
          className="level-hero-badge"
          animate={showLevelUp ? { scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="level-hero-num">{progress.level}</div>
          <div className="level-hero-tag">LEVEL</div>
        </motion.div>
        <div className="level-hero-body">
          <div className="level-hero-top">
            <h3 style={{ marginBottom: 0 }}>Progress to Level {progress.level + 1}</h3>
            <span className="streak-pill"><span className="flame">🔥</span> {streak}-day streak</span>
          </div>
          <div className="xp-track-wrap" style={{ maxWidth: 'none', marginTop: 10 }}>
            <div className="xp-track-label">
              <span>{progress.xpIntoLevel} / {progress.xpForNext} XP</span>
              <span>{progress.percent}%</span>
            </div>
            <div className="xp-track lg">
              <motion.div
                className="xp-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 1, ease: [0.2, 0.9, 0.25, 1] }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 16 }}>
        <div className="card stat-tile">
          <h3><span className="stat-ic">⚡</span> Total XP</h3>
          <div className="big">{stats?.totalXp ?? 0}</div>
        </div>
        <div className="card stat-tile completion-tile">
          <h3><span className="stat-ic">✅</span> Completion rate</h3>
          <CompletionDonut percent={completionPct} />
          <div className="delta">{completed} / {tasks.length} quests today</div>
        </div>
        <div className="card stat-tile">
          <h3><span className="stat-ic">🏆</span> Longest streak</h3>
          <div className="big">{longest} days</div>
          <div className="delta">current: {streak} days</div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>Today's Quests</h3>
          {loading ? (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading…</p>
          ) : tasks.length === 0 ? (
            <div className="empty"><div className="glyph">🗒️</div>No quests yet — head to the Quests tab to add one.</div>
          ) : (
            <div className="quest-list">
              {tasks.map((t) => <QuestRow key={t.taskId} task={t} onToggle={toggleTask} />)}
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>XP — Last 7 Days</h3>
            {xpLogs.length === 0 ? (
              <div className="empty"><div className="glyph">📈</div>No XP logged yet this week.</div>
            ) : (
              <div style={{ width: '100%', height: 160 }}>
                <ResponsiveContainer>
                  <BarChart data={xpByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<XpTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
                    <Bar dataKey="xp" radius={[5, 5, 0, 0]} fill="var(--teal)" maxBarSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="card">
            <h3>{streak}-Day Streak</h3>
            <div className="cal">
              {days.map((on, i) => (
                <div key={i} className={`d ${on ? 'on' : ''} ${i === days.length - 1 ? 'today' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
