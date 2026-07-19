import { api } from './client'

// /api/user-stats and /api/levels are flat CRUD controllers with no
// per-user query params, so we fetch the collection and filter client-side.

export async function getUserStats(userId) {
  const all = await api.get('/api/user-stats')
  return all.find((s) => s.userId === userId) || null
}

export const createUserStats = (stats) => api.post('/api/user-stats', stats)

export const updateUserStats = (id, stats) => api.put(`/api/user-stats/${id}`, stats)

export const getLevels = () => api.get('/api/levels')

export async function getXpLogs(userId) {
  const all = await api.get('/api/xp-logs')
  return all.filter((l) => l.userId === userId)
}
