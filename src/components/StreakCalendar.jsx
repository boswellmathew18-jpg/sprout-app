import { TR } from '../translations'

const TODAY = new Date().toISOString().split('T')[0]

export default function StreakCalendar({ days, lang }) {
  const t = TR[lang] || TR['en']

  const cells = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const k = d.toISOString().split('T')[0]
    cells.push({ date: k, saved: !!days[k]?.saved, isToday: k === TODAY })
  }

  const streak = (() => {
    let n = 0
    const d = new Date()
    while (true) {
      const k = d.toISOString().split('T')[0]
      if (days[k]?.saved) { n++; d.setDate(d.getDate() - 1) } else break
    }
    return n
  })()

  return (
    <div className="card">
      <div className="card-ttl">{t.calTtl}</div>
      {streak > 0 && (
        <div className="cal-streak-badge">{t.calStreak(streak)}</div>
      )}
      <div className="streak-cal">
        {cells.map(cell => (
          <div
            key={cell.date}
            className={['cal-dot', cell.saved ? 'done' : '', cell.isToday ? 'today' : ''].filter(Boolean).join(' ')}
          />
        ))}
      </div>
      <div className="cal-legend">
        <span className="cal-leg-item"><span className="cal-leg-dot done" />{t.calDone}</span>
        <span className="cal-leg-item"><span className="cal-leg-dot today" />{t.calToday}</span>
        <span className="cal-leg-item"><span className="cal-leg-dot" />{t.calMissed}</span>
      </div>
    </div>
  )
}
