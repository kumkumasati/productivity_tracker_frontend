import { api } from './client'

export const getAllAchievements = () => api.get('/api/achievements')

export async function getUserAchievements(userId) {
  const all = await api.get('/api/user-achievements')
  return all.filter((a) => a.userId === userId)
}

export const unlockAchievement = (userId, achievementId) =>
  api.post('/api/user-achievements', {
    userId,
    achievementId,
    earnedAt: new Date().toISOString(),
  })
