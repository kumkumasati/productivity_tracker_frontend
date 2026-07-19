// Given a sorted list of LevelDto { level, xpRequired } and a user's totalXp,
// work out current level, xp into the current level, and xp needed for next.
export function computeLevelProgress(levels, totalXp) {
  if (!levels || levels.length === 0) {
    return { level: 1, xpIntoLevel: totalXp, xpForNext: 100, percent: 0 }
  }
  const sorted = [...levels].sort((a, b) => a.xpRequired - b.xpRequired)
  let current = sorted[0]
  let next = sorted[1] || null
  for (let i = 0; i < sorted.length; i++) {
    if (totalXp >= sorted[i].xpRequired) {
      current = sorted[i]
      next = sorted[i + 1] || null
    }
  }
  const base = current.xpRequired
  const target = next ? next.xpRequired : base + 1000
  const percent = Math.min(100, Math.round(((totalXp - base) / (target - base)) * 100))
  return {
    level: current.level,
    xpIntoLevel: totalXp - base,
    xpForNext: target - base,
    totalXp,
    nextLevelXp: target,
    percent: isFinite(percent) ? percent : 0,
  }
}

// Buckets XpLogDto[] { amount, createdAt } into the last `numDays` calendar
// days (oldest first) for a simple XP-over-time chart. Days with no logged
// XP show as 0 rather than being skipped, so the chart always has a
// consistent number of bars.
export function groupXpByDay(logs, numDays = 7) {
  const today = new Date()
  const days = []
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      xp: 0,
    })
  }
  const byKey = new Map(days.map((d) => [d.key, d]))
  for (const log of logs || []) {
    if (!log?.createdAt) continue
    const key = String(log.createdAt).slice(0, 10)
    const bucket = byKey.get(key)
    if (bucket) bucket.xp += log.amount || 0
  }
  return days
}
