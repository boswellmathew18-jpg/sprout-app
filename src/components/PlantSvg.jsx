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
        width: '160px',
        margin: '0 auto',
        transform: `scale(${weekScale})`,
        transformOrigin: 'center bottom',
        lineHeight: 0,
      }}>

        {/* Tree body — PNG with transparent background */}
        <img
          src={treeImage}
          alt="Grove tree"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />

        {/* Face overlay — positioned over the foliage area */}
        <svg
          style={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            pointerEvents: 'none',
          }}
          viewBox="0 0 120 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          {emotionalState === 'sad' && (
            <>
              <path d="M28 18 Q34 12 40 18" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
              <path d="M80 18 Q86 12 92 18" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
              <path d="M46 42 Q60 36 74 42" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"/>
              <ellipse cx="35" cy="28" rx="3" ry="4" fill="#aee4ff"/>
            </>
          )}
          {emotionalState === 'happy' && (
            <>
              <circle cx="34" cy="16" r="9" fill="#1a1a1a"/>
              <circle cx="86" cy="16" r="9" fill="#1a1a1a"/>
              <circle cx="30" cy="12" r="3" fill="white"/>
              <circle cx="82" cy="12" r="3" fill="white"/>
              <ellipse cx="18" cy="28" rx="12" ry="7" fill="#f5c8a8" opacity="0.8"/>
              <ellipse cx="102" cy="28" rx="12" ry="7" fill="#f5c8a8" opacity="0.8"/>
              <path d="M44 38 Q60 52 76 38" fill="white" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M44 38 Q60 44 76 38" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>
            </>
          )}
          {emotionalState === 'blooming' && (
            <>
              <path d="M26 18 Q34 8 42 18" fill="none" stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M78 18 Q86 8 94 18" fill="none" stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round"/>
              <ellipse cx="16" cy="28" rx="14" ry="9" fill="#ff85a1" opacity="0.85"/>
              <ellipse cx="104" cy="28" rx="14" ry="9" fill="#ff85a1" opacity="0.85"/>
              <path d="M40 36 Q60 56 80 36" fill="white" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
              <path d="M40 36 Q60 44 80 36" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>
            </>
          )}
        </svg>

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

        {/* Pot — same design as original, label updated to Grove */}
        <svg
          viewBox="0 0 160 45"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%' }}
        >
          <rect x="47" y="2" width="66" height="9.5" rx="4.8" fill="#ae6e48" />
          <path d="M53 11.5 Q51 35 80 40 Q109 35 107 11.5 Z" fill="#d49068" />
          <path d="M53 11.5 Q51 35 67 39 L65 11.5 Z" fill="rgba(0,0,0,0.07)" />
          <ellipse cx="69" cy="20" rx="5" ry="10" transform="rotate(-8 69 20)" fill="rgba(255,255,255,0.14)" />
          <ellipse cx="80" cy="2" rx="29" ry="5" fill="#7a4f2a" opacity="0.26" />
          <rect x="60" y="25" width="40" height="13.5" rx="4.5" fill="white" opacity="0.92" />
          <text
            x="80" y="36"
            textAnchor="middle"
            fontSize="8.5"
            fill="#ae6e48"
            fontWeight="800"
            fontFamily="-apple-system,'Helvetica Neue',sans-serif"
          >
            Grove
          </text>
        </svg>

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
