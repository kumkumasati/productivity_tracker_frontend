import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getUserStats, getLevels } from '../api/progress'
import { computeLevelProgress } from '../utils/xp'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [progress, setProgress] = useState({ level: 1, percent: 0, totalXp: 0, nextLevelXp: 100 })
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [stats, levels] = await Promise.all([getUserStats(user.userId), getLevels()])
        if (cancelled) return
        if (stats) {
          setProgress(computeLevelProgress(levels, stats.totalXp || 0))
          setStreak(stats.currentStreak || 0)
        }
      } catch {
        // Stats may not exist yet for a brand-new user — that's fine.
      }
    }
    load()
    return () => { cancelled = true }
  }, [user.userId])

  const initials = (user.username || '?').slice(0, 2).toUpperCase()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app">
      <div className="brand">
        <div className="mark">Q</div>
        <span>Questly</span>
      </div>

      <div className="hud">
        <div className="hud-left">
          <div className="avatar">{initials}<span className="lvl-badge">Lv {progress.level}</span></div>
          <div className="hud-name">
            <div className="who">{user.username}</div>
            <div className="rank">Level {progress.level} Adventurer</div>
          </div>
        </div>
        <div className="xp-track-wrap">
          <div className="xp-track-label">
            <span>{progress.totalXp} / {progress.nextLevelXp} XP to Level {progress.level + 1}</span>
            <span>{progress.percent}%</span>
          </div>
          <div className="xp-track">
            <motion.div
              className="xp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 1, ease: [0.2, 0.9, 0.25, 1] }}
            />
          </div>
        </div>
        <div className="hud-right">
          <div className="streak-pill"><span className="flame">🔥</span> {streak}-day streak</div>
          <button className="logout-btn" onClick={handleLogout} title="Log out">⎋</button>
        </div>
      </div>

      <div className="nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}><span className="ic">◆</span> Dashboard</NavLink>
        <NavLink to="/quests" className={({ isActive }) => isActive ? 'active' : ''}><span className="ic">☰</span> Quests</NavLink>
         <NavLink to="/habits" className={({ isActive }) => isActive ? 'active' : ''}><span className="ic">⟳</span> Habits</NavLink>
        <NavLink to="/achievements" className={({ isActive }) => isActive ? 'active' : ''}><span className="ic">✦</span> Achievements</NavLink>
        <NavLink to="/challenges" className={({ isActive }) => isActive ? 'active' : ''}><span className="ic">⚔</span> Challenges</NavLink>
        <NavLink to="/report" className={({ isActive }) => isActive ? 'active' : ''}><span className="ic">✎</span> Weekly Report</NavLink>
      </div>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
