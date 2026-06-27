import { useState, useEffect, useRef } from 'react'
import ForestBackground from './ForestBackground'
import PlantSvg from './PlantSvg'
import { playClick, playType } from '../utils/sounds'

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [showNotif, setShowNotif] = useState(false)
  const [pendingName, setPendingName] = useState('')
  const touchStartX = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (step === 2) {
      const id = setTimeout(() => inputRef.current?.focus(), 460)
      return () => clearTimeout(id)
    }
  }, [step])

  const goTo = s => setStep(Math.max(0, Math.min(2, s)))

  const handleTouchStart = e => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = e => {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    if (dx > 50 && step < 2) goTo(step + 1)
    else if (dx < -50 && step > 0) goTo(step - 1)
    touchStartX.current = null
  }

  const handleSubmit = e => {
    e.preventDefault()
    const v = name.trim()
    if (!v) return
    const formatted = v.charAt(0).toUpperCase() + v.slice(1)
    const alreadyAnswered = localStorage.getItem('grove_notif')
    const canPrompt = 'Notification' in window && Notification.permission === 'default' && !alreadyAnswered
    if (!canPrompt) {
      onComplete(formatted)
    } else {
      setPendingName(formatted)
      setShowNotif(true)
    }
  }

  const handleNotifYes = async () => {
    try {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission()
        localStorage.setItem('grove_notif', perm)
      }
    } catch {
      localStorage.setItem('grove_notif', 'denied')
    }
    onComplete(pendingName)
  }

  const handleNotifSkip = () => {
    localStorage.setItem('grove_notif', 'skipped')
    onComplete(pendingName)
  }

  return (
    <div className="ob-wrap" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <ForestBackground />

      <div className="ob-viewport">
        <div className="ob-slider" style={{ transform: `translateX(calc(-${step} * 100vw))` }}>

          {/* Step 1 — Welcome */}
          <div className="ob-slide">
            <div className="ob-plant">
              <PlantSvg score={2} week={1} />
            </div>
            <h1 className="ob-title">Welcome to Grove</h1>
            <p className="ob-sub">Your daily wellness companion</p>
            <button className="ob-btn" onClick={() => { playClick(); goTo(1) }}>Get Started →</button>
          </div>

          {/* Step 2 — Features */}
          <div className="ob-slide">
            <div className="ob-icon-wrap">
              <span className="ob-big-icon">🌿</span>
            </div>
            <h2 className="ob-title">Track your habits</h2>
            <p className="ob-sub">Build streaks, log sleep and water,<br />and journal your mood — one day at a time.</p>
            <button className="ob-btn" onClick={() => { playClick(); goTo(2) }}>Next →</button>
          </div>

          {/* Step 3 — Name */}
          <div className="ob-slide">
            <div className="ob-icon-wrap">
              <span className="ob-big-icon">✨</span>
            </div>
            <h2 className="ob-title">What's your name?</h2>
            <form className="ob-form" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                className="ob-input"
                type="text"
                placeholder="Your name..."
                value={name}
                onChange={e => { playType(); setName(e.target.value) }}
                maxLength={30}
                autoComplete="given-name"
              />
              <button type="submit" className="ob-btn" disabled={!name.trim()} onClick={playClick}>
                Start Growing 🌱
              </button>
            </form>
          </div>

        </div>
      </div>

      <div className="ob-dots">
        {[0, 1, 2].map(i => (
          <button
            key={i}
            className={`ob-dot${i === step ? ' ob-dot-active' : ''}`}
            onClick={() => i < step && goTo(i)}
            aria-label={`Step ${i + 1}`}
          />
        ))}
      </div>

      {showNotif && (
        <div className="notif-overlay">
          <div className="notif-card">
            <div className="notif-icon">🔔</div>
            <h3 className="notif-title">Daily reminders?</h3>
            <p className="notif-sub">Let Grove nudge you each day to check in and keep your streak alive.</p>
            <button className="notif-btn-yes" onClick={() => { playClick(); handleNotifYes() }}>Yes, remind me</button>
            <button className="notif-btn-skip" onClick={() => { playClick(); handleNotifSkip() }}>Maybe later</button>
          </div>
        </div>
      )}
    </div>
  )
}
