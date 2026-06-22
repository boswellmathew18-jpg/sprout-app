import { useState, useEffect, useRef } from 'react'
import ForestBackground from './ForestBackground'
import PlantSvg from './PlantSvg'

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
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
    onComplete(v.charAt(0).toUpperCase() + v.slice(1))
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
            <h1 className="ob-title">Welcome to Sprout</h1>
            <p className="ob-sub">Your daily wellness companion</p>
            <button className="ob-btn" onClick={() => goTo(1)}>Get Started →</button>
          </div>

          {/* Step 2 — Features */}
          <div className="ob-slide">
            <div className="ob-icon-wrap">
              <span className="ob-big-icon">🌿</span>
            </div>
            <h2 className="ob-title">Track your habits</h2>
            <p className="ob-sub">Build streaks, log sleep and water,<br />and journal your mood — one day at a time.</p>
            <button className="ob-btn" onClick={() => goTo(2)}>Next →</button>
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
                onChange={e => setName(e.target.value)}
                maxLength={30}
                autoComplete="given-name"
              />
              <button type="submit" className="ob-btn" disabled={!name.trim()}>
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
    </div>
  )
}
