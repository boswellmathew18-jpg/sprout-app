import { useRef, useState, useEffect } from 'react'
import { animate } from 'animejs'
import treeImage from '../assets/tree.png'

const PARTICLE_COLORS = ['#6cc274', '#50ba60', '#a8d8b5', '#7de89a', '#56a862', '#90e89a', '#ffd166', '#ffb347', '#f6c90e', '#ffe066']

let nextPId = 0

export default function PlantSvg({ score = 2, week = 1, onTap, isBreathing = false, goldGlow = false }) {
  const wrapRef = useRef(null)
  const idleAnimRef = useRef(null)
  const [particles, setParticles] = useState([])

  const weekScale = (1 + (week - 1) * 0.057).toFixed(2)
  const emotionalState = score === 3 ? 'blooming' : score >= 1 ? 'happy' : 'sad'

  // Idle breathing animation — starts on mount, restarts after each tap
  const startIdle = () => {
    const el = wrapRef.current
    if (!el) return
    idleAnimRef.current = animate(el, {
      scale: [1, 1.03, 1],
      duration: 3000,
      ease: 'inOutSine',
      loop: Infinity,
    })
  }

  useEffect(() => {
    startIdle()
    return () => { idleAnimRef.current?.pause() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = () => {
    const el = wrapRef.current
    if (el) {
      idleAnimRef.current?.pause()
      animate(el, {
        scale: [1.0, 1.3, 0.9, 1.1, 1.0],
        duration: 600,
        ease: 'inOutSine',
        onComplete: startIdle,
      })
    }

    const count = 6 + Math.floor(Math.random() * 3)
    const burst = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.7
      const dist = 36 + Math.random() * 30
      const id = nextPId++
      return {
        id,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 5 + Math.random() * 5,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      }
    })
    setParticles(p => [...p, ...burst])
    const ids = new Set(burst.map(b => b.id))
    setTimeout(() => setParticles(p => p.filter(pt => !ids.has(pt.id))), 700)

    onTap?.()
  }

  return (
    <div
      ref={wrapRef}
      onClick={handleTap}
      className={goldGlow ? 'plant-gold-glow' : isBreathing ? 'plant-breathing' : ''}
      style={{ cursor: 'pointer', display: 'inline-block', position: 'relative' }}
    >
      <div style={{
        position: 'relative',
        width: '280px',
        transform: `scale(${weekScale})`,
        transformOrigin: 'center bottom',
        lineHeight: 0,
      }}>

        {/* Tree body — filter reflects emotional state */}
        <img
          src={treeImage}
          alt="Grove tree"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            filter: emotionalState === 'sad'
              ? 'brightness(0.85) saturate(0.8)'
              : emotionalState === 'blooming'
              ? 'brightness(1.1) saturate(1.2)'
              : 'none',
            transition: 'filter 0.6s ease',
          }}
        />

        {/* Sparkle stars — blooming state only */}
        {emotionalState === 'blooming' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {[
              { top: '5%', left: '10%' },
              { top: '8%', right: '12%' },
              { top: '20%', left: '2%' },
              { top: '18%', right: '4%' },
              { top: '2%', left: '45%' },
            ].map((pos, i) => (
              <svg key={i} style={{ position: 'absolute', ...pos, width: '16px', height: '16px' }} viewBox="0 0 20 20">
                <path d="M10 2L11.5 8L18 10L11.5 12L10 18L8.5 12L2 10L8.5 8Z" fill="#ffe066"/>
              </svg>
            ))}
          </div>
        )}


      </div>

      {/* Tap particles — positioned relative to the wrapRef outer div */}
      {particles.map(p => (
        <span
          key={p.id}
          className="plant-particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
          }}
        />
      ))}
    </div>
  )
}
