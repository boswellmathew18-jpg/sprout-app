import { TR } from '../translations'

const MOODS = [
  { val: 1, emoji: '😞' },
  { val: 2, emoji: '😕' },
  { val: 3, emoji: '😐' },
  { val: 4, emoji: '🙂' },
  { val: 5, emoji: '😄' },
]

export default function Journal({ mood, note, lang, onMoodChange, onNoteChange }) {
  const t = TR[lang]

  return (
    <div className="card">
      <div className="card-ttl">{t.jTtl}</div>
      <div className="emoji-row">
        {MOODS.map(({ val, emoji }) => (
          <button
            key={val}
            className={`e-btn ${mood === val ? 'sel' : ''}`}
            onClick={() => onMoodChange(val)}
          >
            {emoji}
          </button>
        ))}
      </div>
      <textarea
        className="j-note"
        rows={2}
        maxLength={120}
        placeholder={t.jPh}
        value={note || ''}
        onChange={e => onNoteChange(e.target.value)}
      />
    </div>
  )
}
