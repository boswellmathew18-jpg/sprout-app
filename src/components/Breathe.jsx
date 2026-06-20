import { useState, useEffect, useRef } from 'react'

const TOTAL_CYCLES = 7
const PHASE_MS = 4000

export default function Breathe({ onBreathing }) {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [stepsDone, setStepsDone] = useState(0)
  const timerRef = useRef(null)
  const stepRef = useRef(0)
  const total = TOTAL_CYCLES * 2

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
        return
      }
      setPhase(s % 2 === 0 ? 'inhale' : 'exhale')
      timerRef.current = setTimeout(tick, PHASE_MS)
    }

    timerRef.current = setTimeout(tick, PHASE_MS)
    onBreathing?.(true)
    return () => clearTimeout(timerRef.current)
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps

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
  const phaseLabel = phase === 'inhale' ? 'Inhale' : phase === 'exhale' ? 'Exhale' : 'Breathe'
  const phaseSub = phase === 'inhale' ? '4 seconds' : phase === 'exhale' ? '4 seconds' : ''

  return (
    <div className="card breathe-card">
      <div className="card-ttl">Breathe</div>
      <div className="breathe-content">
        <div className="breathe-stage">
          <div className={`breathe-bubble ${phase}`}>
            <div className="breathe-ring r3" />
            <div className="breathe-ring r2" />
            <div className="breathe-circle">
              <span className="breathe-lbl">{phaseLabel}</span>
              {phaseSub && <span className="breathe-sub">{phaseSub}</span>}
            </div>
          </div>
        </div>
        <div className="breathe-footer">
          {running && <span className="breathe-count">{cyclesLeft} breath{cyclesLeft !== 1 ? 's' : ''} left</span>}
          <button className={`breathe-btn ${running ? 'running' : ''}`} onClick={toggle}>
            {running ? 'Stop' : 'Start'}
          </button>
          {!running && <span className="breathe-hint">optional · 1 min</span>}
        </div>
      </div>
    </div>
  )
}
