import { useState, useMemo } from 'react'
import { TR } from '../translations'

const HISTORY_SK = 'sprout_history'
const EMOJIS = { 1: '😞', 2: '😐', 3: '🙂', 4: '😊', 5: '😄' }

function readHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_SK) || '{}') } catch { return {} }
}

function fmtDate(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

export default function MoodHistory({ lang }) {
  const t = TR[lang] || TR['en']
  const [open, setOpen] = useState(false)

  const entries = useMemo(() => {
    if (!open) return []
    const hist = readHistory()
    const today = new Date()
    const out = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const k = d.toISOString().split('T')[0]
      if (hist[k]) out.push({ date: k, ...hist[k] })
    }
    return out
  }, [open])

  return (
    <>
      <button className="hist-trigger" onClick={() => setOpen(true)}>
        {t.histTrigger}
      </button>

      {open && (
        <div className="hist-overlay" onClick={() => setOpen(false)}>
          <div className="hist-panel" onClick={e => e.stopPropagation()}>
            <div className="hist-hdr">
              <span className="hist-title">{t.histTitle}</span>
              <button className="hist-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            {entries.length === 0 ? (
              <p className="hist-empty">{t.histEmpty}</p>
            ) : (
              <div className="hist-list">
                {entries.map(e => (
                  <div key={e.date} className="hist-row">
                    <div className="hist-emoji">{EMOJIS[e.mood] || '·'}</div>
                    <div className="hist-info">
                      <div className="hist-date">{fmtDate(e.date)}</div>
                      {e.note && <div className="hist-note">{e.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
