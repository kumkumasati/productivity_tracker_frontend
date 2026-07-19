import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLatestWeeklyReport, generateAiSummary } from '../api/weeklyReports'

export default function WeeklyReport() {
  const { user } = useAuth()
  const [report, setReport] = useState(null)
  const [aiSummary, setAiSummary] = useState('')
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  async function load() {
    try {
      setReport(await getLatestWeeklyReport(user.userId))
    } catch (err) {
      setError(err.message)
    }
  }
  useEffect(() => { load() }, [user.userId])

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      const text = await generateAiSummary(user.userId)
      setAiSummary(text)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Weekly Report</h1>
          <p>{report ? `${report.weekStart} – ${report.weekEnd}` : 'No saved report yet'} · AI coach</p>
        </div>
        <button className="cta-btn" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating…' : 'Regenerate with AI'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="report-hero">
        <div className="eyebrow">AI Summary</div>
        <p>
          {aiSummary || report?.summary || 'No summary yet — click "Regenerate with AI" to have your coach analyze this week\'s quests.'}
        </p>
        {report?.tips && (
          <div className="tips">
            <div className="tip"><span className="n">TIP</span> {report.tips}</div>
          </div>
        )}
      </div>

      {report && (
        <>
          <div className="grid cols-3" style={{ marginBottom: 16 }}>
            <div className="card stat-tile"><h3>Total XP earned</h3><div className="big">{report.totalXp}</div></div>
            <div className="card stat-tile"><h3>Completion rate</h3><div className="big">{report.completionRate}%</div></div>
            <div className="card stat-tile"><h3>Streak preserved</h3><div className="big">{report.streak} days</div></div>
          </div>
          <div className="card">
            <h3>Strongest vs. weakest day</h3>
            <div className="daycompare">
              <div className="dc best"><div className="lbl">Strongest</div><div className="val">{report.strongestDay}</div></div>
              <div className="dc worst"><div className="lbl">Weakest</div><div className="val">{report.weakestDay}</div></div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
