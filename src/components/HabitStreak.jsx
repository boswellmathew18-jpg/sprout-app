import { useState, useRef } from 'react'
import { TR } from '../translations'

export default function HabitStreak({ habitName, streak, done, lang, onToggle, onSaveName }) {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const checkRef = useRef(null)
  const t = TR[lang]

  const handleCheck = () => {
    const el = checkRef.current
    if (el) {
      el.classList.remove('tap')
      void el.offsetWidth
      el.classList.add('tap')
      setTimeout(() => el.classList.remove('tap'), 420)
    }
    onToggle()
  }

  const startEdit = () => {
    setInputVal(habitName || '')
    setEditing(true)
  }

  const saveEdit = () => {
    const v = inputVal.trim()
    if (v) onSaveName(v)
    setEditing(false)
  }

  const s = streak
  const motiv = t.motiv
  const motivText =
    s >= 30 ? motiv[5] : s >= 14 ? motiv[4] : s >= 7 ? motiv[3] : s >= 3 ? motiv[2] : s >= 1 ? motiv[1] : motiv[0]

  return (
    <div className="card">
      <div className="card-ttl">{t.habitTtl}</div>
      <div className="habit-row">
        <div
          ref={checkRef}
          className={`h-check ${done ? 'done' : ''}`}
          onClick={handleCheck}
        >
          <div className="h-fill" />
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path
              d="M5 13l6 6 10-13"
              stroke="white"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="h-info">
          {editing ? (
            <input
              className="h-input"
              style={{ display: 'block' }}
              type="text"
              maxLength={40}
              value={inputVal}
              placeholder={t.ph}
              onChange={e => setInputVal(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={e => e.key === 'Enter' && saveEdit()}
              autoFocus
            />
          ) : (
            <div
              className={`h-name ${!habitName ? 'ph' : ''}`}
              onClick={startEdit}
            >
              {habitName || t.ph}
            </div>
          )}
          <div className="streak-row">
            <span className="s-fire">🔥</span>
            <span className="s-num">{streak}</span>
            <span className="s-lbl">{t.sLbl}</span>
          </div>
          <div className="s-motiv">{motivText}</div>
        </div>
      </div>
    </div>
  )
}
