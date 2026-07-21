import { api } from './client'

export async function getHabits(userId) {
  const all = await api.get('/api/habits')
  return all.filter((h) => h.userId === userId)
}

export const createHabit = (habit) => api.post('/api/habits', habit)

export const updateHabit = (habitId, habit) => api.put(`/api/habits/${habitId}`, habit)

export const deleteHabit = (habitId) => api.del(`/api/habits/${habitId}`)

export async function getHabitLogs(habitId) {
  const all = await api.get('/api/habit-logs')
  return all.filter((l) => l.habitId === habitId)
}

export const createHabitLog = (log) => api.post('/api/habit-logs', log)

export const updateHabitLog = (logId, log) => api.put(`/api/habit-logs/${logId}`, log)