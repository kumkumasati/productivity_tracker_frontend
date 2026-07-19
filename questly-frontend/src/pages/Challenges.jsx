import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getChallenges, getParticipants, joinChallenge, createChallenge } from '../api/challenges'

function ChallengeCard({ challenge, userId, onChanged }) {
  const [participants, setParticipants] = useState([])
  const [error, setError] = useState('')

  async function load() {
    try {
      setParticipants(await getParticipants(challenge.id))
    } catch (err) {
      setError(err.message)
    }
  }
  useEffect(() => { load() }, [challenge.id])

  const joined = participants.some((p) => p.userId === userId)
  const maxProgress = Math.max(1, ...participants.map((p) => p.progress || 0), 10)

  async function handleJoin() {
    try {
      await joinChallenge(challenge.id, userId)
      await load()
      onChanged?.()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="challenge">
      <div className="challenge-head">
        <div>
          <h3>{challenge.title}</h3>
          <div className="dates">{challenge.startDate} – {challenge.endDate} · {challenge.description}</div>
        </div>
        <button className={`cta-btn ${joined ? 'ghost' : ''}`} onClick={handleJoin} disabled={joined}>
          {joined ? 'Joined' : 'Join challenge'}
        </button>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {participants.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 12.5 }}>No participants yet — be the first to join.</p>
      ) : (
        participants.map((p) => (
          <div key={p.id} className={`participant ${p.userId === userId ? 'me' : ''}`}>
            <div className="pname">{p.userId === userId ? 'You' : `User #${p.userId}`}</div>
            <div className="pbar"><span style={{ width: `${Math.round(((p.progress || 0) / maxProgress) * 100)}%` }} /></div>
            <div className="pval">{p.progress || 0}</div>
          </div>
        ))
      )}
    </div>
  )
}

export default function Challenges() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '' })

  async function load() {
    try {
      setChallenges(await getChallenges())
    } catch (err) {
      setError(err.message)
    }
  }
  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createChallenge({ ...form, createdBy: user.userId })
      setForm({ title: '', description: '', startDate: '', endDate: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <div className="page-head">
        <div><h1>Challenges</h1><p>Team up and race toward shared goals</p></div>
        <button className="cta-btn ghost" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Create challenge'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <form className="card" style={{ marginBottom: 16 }} onSubmit={handleCreate}>
          <div className="field">
            <label>Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="July Focus Sprint" />
          </div>
          <div className="field">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="30 Deep Work quests before month end" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Start date</label>
              <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>End date</label>
              <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <button className="cta-btn" type="submit">Create</button>
        </form>
      )}

      {challenges.length === 0 ? (
        <div className="empty card"><div className="glyph">⚔</div>No challenges yet — create the first one.</div>
      ) : (
        challenges.map((c) => (
          <ChallengeCard key={c.id} challenge={c} userId={user.userId} onChanged={load} />
        ))
      )}
    </section>
  )
}
