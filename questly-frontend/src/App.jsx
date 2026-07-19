import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Quests from './pages/Quests'
import Achievements from './pages/Achievements'
import Challenges from './pages/Challenges'
import WeeklyReport from './pages/WeeklyReport'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="quests" element={<Quests />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="report" element={<WeeklyReport />} />
      </Route>
    </Routes>
  )
}
