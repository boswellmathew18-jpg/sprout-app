import { TR } from '../translations'

const TODAY = new Date().toISOString().split('T')[0]

function currentSaveStreak(days) {
  let n = 0
  const d = new Date(TODAY)
  while (true) {
    const k = d.toISOString().split('T')[0]
    if (days[k]?.saved) { n++; d.setDate(d.getDate() - 1) } else break
  }
  return n
}

function bestSaveStreak(days) {
  const sorted = Object.keys(days).filter(k => days[k]?.saved).sort()
  if (!sorted.length) return 0
  let best = 1, cur = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round((new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000)
    if (diff === 1) { cur++; best = Math.max(best, cur) } else cur = 1
  }
  return best
}

function habitsCompletedThisWeek(days, habits) {
  if (!habits.length) return 0
  let count = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(TODAY)
    d.setDate(d.getDate() - i)
    const k = d.toISOString().split('T')[0]
    const done = days[k]?.habits || {}
    if (habits.every(h => done[h.id])) count++
  }
  return count
}

export default function WeeklyStats({ days, habits, lang }) {
  const t = TR[lang] || TR['en']
  const habitDays = habitsCompletedThisWeek(days, habits)
  const curStreak = currentSaveStreak(days)
  const best = bestSaveStreak(days)

  const stats = [
    { num: `${habitDays}/7`, lbl: t.wkHabits },
    { num: curStreak,        lbl: t.wkCurrent },
    { num: best,             lbl: t.wkBest },
  ]

  return (
    <div className="wk-stats">
      {stats.map((s, i) => (
        <div key={i} className="wk-stat-group">
          {i > 0 && <div className="wk-div" />}
          <div className="wk-stat">
            <div className="wk-num">{s.num}</div>
            <div className="wk-lbl">{s.lbl}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
