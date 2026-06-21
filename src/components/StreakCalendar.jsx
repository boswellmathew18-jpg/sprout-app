const TODAY = new Date().toISOString().split('T')[0]

export default function StreakCalendar({ days }) {
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
      <div className="card-ttl">30-Day Streak</div>
      {streak > 0 && (
        <div className="cal-streak-badge">🔥 {streak} day streak</div>
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
        <span className="cal-leg-item"><span className="cal-leg-dot done" />Completed</span>
        <span className="cal-leg-item"><span className="cal-leg-dot today" />Today</span>
        <span className="cal-leg-item"><span className="cal-leg-dot" />Missed</span>
      </div>
    </div>
  )
}
