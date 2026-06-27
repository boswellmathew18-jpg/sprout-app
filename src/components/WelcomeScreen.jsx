import { useState } from 'react'
import ForestBackground from './ForestBackground'
import PlantSvg from './PlantSvg'
import { TR } from '../translations'
import { playClick, playType } from '../utils/sounds'

export default function WelcomeScreen({ onComplete, lang = 'en' }) {
  const [name, setName] = useState('')
  const t = TR[lang]

  const handleSubmit = e => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) { playClick(); onComplete(trimmed.charAt(0).toUpperCase() + trimmed.slice(1)) }
  }

  return (
    <div className="welcome-screen">
      <ForestBackground />
      <div className="welcome-content">
        <div className="welcome-plant">
          <PlantSvg score={2} week={1} />
        </div>
        <h2 className="welcome-title">{t.welcomeTitle}</h2>
        <form onSubmit={handleSubmit} className="welcome-form">
          <input
            className="welcome-input"
            type="text"
            placeholder={t.welcomePh}
            value={name}
            onChange={e => { playType(); setName(e.target.value) }}
            maxLength={40}
            autoFocus
            autoComplete="given-name"
          />
          <button
            type="submit"
            className="welcome-btn"
            disabled={!name.trim()}
          >
            {t.welcomeBtn}
          </button>
        </form>
      </div>
    </div>
  )
}
