import { useState, useRef } from 'react'
import { TR } from '../translations'

const HABIT_EMOJIS = ['🏃','💪','📚','🧘','💧','🌿','✍️','🎯','🍎','😴','🎨','🎵','✝️','📖']

function HabitRow({ habit, done, streak, onToggle, onRename, onDelete, lang }) {
  const [editing, setEditing] = useState(!habit.name)
  const [inputVal, setInputVal] = useState('')
  const checkRef = useRef(null)
  const t = TR[lang]

  const handleCheck = () => {
    const el = checkRef.current
    if (el) {
      el.classList.remove('tap'); void el.offsetWidth; el.classList.add('tap')
      setTimeout(() => el.classList.remove('tap'), 420)
    }
    onToggle(habit.id)
  }

  const startEdit = () => { setInputVal(habit.name || ''); setEditing(true) }

  const saveEdit = () => {
    const v = inputVal.trim()
    if (v) onRename(habit.id, v)
    setEditing(false)
  }

  const s = streak
  const m = t.motiv
  const motivText = s >= 30 ? m[5] : s >= 14 ? m[4] : s >= 7 ? m[3] : s >= 3 ? m[2] : s >= 1 ? m[1] : m[0]

  return (
    <div className="habit-item">
      <div className="habit-row">
        <div ref={checkRef} className={`h-check ${done ? 'done' : ''}`} onClick={handleCheck}>
          <div className="h-fill" />
          {habit.emoji && <span className="h-emoji-icon">{habit.emoji}</span>}
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M5 13l6 6 10-13" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
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
            <div className={`h-name ${!habit.name ? 'ph' : ''}`} onClick={startEdit}>
              {habit.name || t.ph}
            </div>
          )}
          <div className="streak-row">
            <span className="s-fire">🔥</span>
            <span className="s-num">{streak}</span>
            <span className="s-lbl">{t.sLbl}</span>
          </div>
          <div className="s-motiv">{motivText}</div>
        </div>
        <button className="habit-del" onClick={() => onDelete(habit.id)} aria-label="Remove habit">✕</button>
      </div>
    </div>
  )
}

export default function HabitStreak({ habits, streaks, doneMap, lang, onToggle, onAdd, onDelete, onRename }) {
  const t = TR[lang]
  const [pickingEmoji, setPickingEmoji] = useState(false)

  const handlePickEmoji = emoji => {
    onAdd(emoji)
    setPickingEmoji(false)
  }

  return (
    <>
      {pickingEmoji && (
        <div className="ep-overlay" onClick={() => setPickingEmoji(false)}>
          <div className="ep-picker" onClick={e => e.stopPropagation()}>
            <div className="ep-title">Pick an icon</div>
            <div className="ep-grid">
              {HABIT_EMOJIS.map(em => (
                <button key={em} className="ep-opt" onClick={() => handlePickEmoji(em)}>{em}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="habit-card-hdr">
          <div className="card-ttl" style={{ marginBottom: 0 }}>{t.habitTtl}</div>
          {habits.length < 3 && (
            <button className="habit-add" onClick={() => setPickingEmoji(true)} aria-label="Add habit">+</button>
          )}
        </div>

        {habits.length === 0 ? (
          <div className="habit-empty" onClick={() => setPickingEmoji(true)}>+ {t.ph}</div>
        ) : (
          <div className="habit-list">
            {habits.map((h, i) => (
              <div key={h.id}>
                {i > 0 && <div className="habit-divider" />}
                <HabitRow
                  habit={h}
                  done={doneMap[h.id] || false}
                  streak={streaks[h.id] || 0}
                  onToggle={onToggle}
                  onRename={onRename}
                  onDelete={onDelete}
                  lang={lang}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
