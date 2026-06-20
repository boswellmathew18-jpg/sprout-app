import { useState, useRef } from 'react'
import { TR } from '../translations'

export default function SaveButton({ lang, onSave }) {
  const [ok, setOk] = useState(false)
  const btnRef = useRef(null)
  const t = TR[lang]

  const handleClick = () => {
    if (ok) return
    const el = btnRef.current
    if (el) {
      el.classList.remove('tap')
      void el.offsetWidth
      el.classList.add('tap')
      setTimeout(() => el.classList.remove('tap'), 420)
    }
    setOk(true)
    onSave()
    setTimeout(() => setOk(false), 2400)
  }

  return (
    <button
      ref={btnRef}
      className={`save-btn ${ok ? 'ok' : ''}`}
      onClick={handleClick}
    >
      <span>{ok ? t.savedBtn : t.saveBtn}</span>
      <div className="ck-ring">
        <svg className="ck-svg" viewBox="0 0 16 16" fill="none">
          <path
            className={`ck-path ${ok ? 'ck-draw' : ''}`}
            d="M2.5 8l4 4.5 7-9"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  )
}
