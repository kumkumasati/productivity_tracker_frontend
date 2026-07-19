import { api } from './client'

export const getChallenges = () => api.get('/api/challenges')

export const createChallenge = (challenge) => api.post('/api/challenges', challenge)

export async function getParticipants(challengeId) {
  const all = await api.get('/api/participants')
  return all.filter((p) => p.challengeId === challengeId)
}

export const joinChallenge = (challengeId, userId) =>
  api.post('/api/participants', {
    challengeId,
    userId,
    progress: 0,
    joinedAt: new Date().toISOString(),
  })

export const updateParticipantProgress = (participantId, participant) =>
  api.put(`/api/participants/${participantId}`, participant)
