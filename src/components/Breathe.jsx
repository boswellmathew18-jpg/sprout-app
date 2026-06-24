import { useState, useEffect, useRef } from 'react'
import { TR } from '../translations'
import { sndBreatheInhale, sndBreatheExhale, stopBreatheSound } from '../audio'

const TOTAL_CYCLES = 7
const PHASE_MS = 4000

export default function Breathe({ onBreathing, onComplete, muted, fullScreen, lang }) {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [stepsDone, setStepsDone] = useState(0)
  const timerRef = useRef(null)
  const stepRef = useRef(0)
  const total = TOTAL_CYCLES * 2
  const t = TR[lang] || TR['en']

  useEffect(() => {
    if (!running) return
    stepRef.current = 0
    setStepsDone(0)
    setPhase('inhale')

    const tick = () => {
      stepRef.current += 1
      const s = stepRef.current
      setStepsDone(s)
      if (s >= total) {
        setRunning(false)
        setPhase('idle')
        onBreathing?.(false)
        onComplete?.()
        return
      }
      setPhase(s % 2 === 0 ? 'inhale' : 'exhale')
      timerRef.current = setTimeout(tick, PHASE_MS)
    }

    timerRef.current = setTimeout(tick, PHASE_MS)
    onBreathing?.(true)
    return () => clearTimeout(timerRef.current)
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (muted || phase === 'idle') { stopBreatheSound(); return }
    if (phase === 'inhale') sndBreatheInhale()
    else if (phase === 'exhale') sndBreatheExhale()
    return stopBreatheSound
  }, [phase, muted])

  const toggle = () => {
    if (running) {
      clearTimeout(timerRef.current)
      setRunning(false)
      setPhase('idle')
      setStepsDone(0)
      onBreathing?.(false)
    } else {
      setRunning(true)
    }
  }

  const cyclesLeft = Math.max(0, TOTAL_CYCLES - Math.floor(stepsDone / 2))
  const phaseLabel = phase === 'inhale' ? t.breatheInhale : phase === 'exhale' ? t.breatheExhale : t.breatheLbl
  const phaseSub = (phase === 'inhale' || phase === 'exhale') ? t.breatheSecs : ''

  return (
    <div className={fullScreen ? 'breathe-fullscreen' : 'card breathe-card'}>
      {!fullScreen && <div className="card-ttl">{t.breatheLbl}</div>}
      {fullScreen && <p className="breathe-fs-title">{t.breatheTitle}</p>}
      <div className="breathe-content">
        <div className={`breathe-stage${fullScreen ? ' breathe-stage-fs' : ''}`}>
          <div
            className={`breathe-bubble ${phase}`}
            onClick={toggle}
            role="button"
            aria-label={running ? t.breatheStop : t.breatheStart}
            style={{ cursor: 'pointer' }}
          >
            <div className="breathe-ring r3" />
            <div className="breathe-ring r2" />
            <div className={`breathe-circle${fullScreen ? ' breathe-circle-fs' : ''}`}>
              <span className="breathe-lbl">{phaseLabel}</span>
              {phaseSub && <span className="breathe-sub">{phaseSub}</span>}
            </div>
          </div>
        </div>
        <div className="breathe-footer">
          {running && <span className="breathe-count">{t.breatheLeft(cyclesLeft)}</span>}
          <button className={`breathe-btn ${running ? 'running' : ''}`} onClick={toggle}>
            {running ? t.breatheStop : t.breatheStart}
          </button>
          {!running && <span className="breathe-hint">{t.breatheHint}</span>}
        </div>
      </div>
    </div>
  )
}
