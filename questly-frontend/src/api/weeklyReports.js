import { api } from './client'

export async function getLatestWeeklyReport(userId) {
  const all = await api.get('/api/weekly-reports')
  const mine = all.filter((r) => r.userId === userId)
  if (mine.length === 0) return null
  return mine.sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart))[0]
}

// GET /api/ai/weekly-summary/{userId} — returns a plain text string
// (WeeklyReportAIController), not a WeeklyReportDto.
export const generateAiSummary = (userId) =>
  api.get(`/api/ai/weekly-summary/${userId}`)
