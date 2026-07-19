import { api } from './client'

export const getTasks = (userId) => api.get(`/api/users/${userId}/tasks`)

export const createTask = (userId, task) =>
  api.post(`/api/users/${userId}/tasks`, task)

export const updateTask = (userId, taskId, task) =>
  api.put(`/api/users/${userId}/tasks/${taskId}`, task)

export const deleteTask = (userId, taskId) =>
  api.del(`/api/users/${userId}/tasks/${taskId}`)
