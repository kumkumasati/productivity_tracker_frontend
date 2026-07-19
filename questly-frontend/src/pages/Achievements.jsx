import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getAllAchievements, getUserAchievements } from '../api/achievements'

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export default function Achievements() {
  const { user } = useAuth()
  const [all, setAll] = useState([])
  const [earnedIds, setEarnedIds] = useState(new Set())
  const [prevEarnedIds, setPrevEarnedIds] = useState(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [achievements, mine] = await Promise.all([
          getAllAchievements(),
          getUserAchievements(user.userId),
        ])
        setAll(achievements)
        setEarnedIds((prev) => {
          setPrevEarnedIds(prev)
          return new Set(mine.map((m) => m.achievementId))
        })
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [user.userId])

  return (
    <section>
      <div className="page-head">
        <div><h1>Achievements</h1><p>{earnedIds.size} of {all.length} badges earned</p></div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {all.length === 0 ? (
        <div className="empty card"><div className="glyph">✦</div>No achievements defined yet.</div>
      ) : (
        <motion.div className="badge-grid" variants={gridVariants} initial="hidden" animate="show">
          <AnimatePresence>
            {all.map((a) => {
              const id = a.AchievementId ?? a.achievementId ?? a.id
              const unlocked = earnedIds.has(id)
              // A badge that's unlocked now but wasn't a moment ago gets the
              // "newly earned" glow/pop treatment instead of the plain fade-in.
              const justUnlocked = unlocked && !prevEarnedIds.has(id)
              return (
                <motion.div
                  key={id}
                  className={`badge ${unlocked ? '' : 'locked'} ${justUnlocked ? 'just-unlocked' : ''}`}
                  variants={badgeVariants}
                  whileHover={unlocked ? { y: -3 } : {}}
                  animate={justUnlocked ? { scale: [1, 1.15, 1] } : undefined}
                  transition={justUnlocked ? { duration: 0.7, ease: 'easeOut' } : undefined}
                >
                  <motion.div
                    className="ic"
                    animate={justUnlocked ? { rotate: [0, -12, 12, -6, 0] } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    {unlocked ? '🏆' : '🔒'}
                  </motion.div>
                  <div className="bt">{a.title}</div>
                  <div className="bd">{a.description}</div>
                  <div className="rw">{unlocked ? 'Earned · ' : 'Locked · '}+{a.xpReward} XP</div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}
