import { useRef, useState } from 'react'

const PC = [
  ['#b2c4aa', '#98b088', '#a6be9a'],
  ['#9ec894', '#7caa6c', '#8cbc7c'],
  ['#6cc274', '#56a862', '#68cc72'],
  ['#50ba60', '#3e9e4e', '#5ece68'],
]
const MOUTHS = [
  'M72 142 Q80 136 88 142',
  'M72 140 Q80 141 88 140',
  'M70 138 Q80 147 90 138',
  'M68 136 Q80 149 92 136',
]
const PUPIL_R = [4, 5.5, 7, 7.5]
const ANIM_CLS = ['p-droop', 'p-idle', 'p-sway', 'p-bloom']
const PARTICLE_COLORS = ['#6cc274', '#50ba60', '#a8d8b5', '#7de89a', '#56a862', '#90e89a']

let nextPId = 0

export default function PlantSvg({ score = 2, week = 1, onTap, isBreathing = false, goldGlow = false }) {
  const wrapRef = useRef(null)
  const [particles, setParticles] = useState([])
  const [body, side, top] = PC[score]
  const animClass = ANIM_CLS[score]
  const pr = PUPIL_R[score]
  const weekScale = (1 + (week - 1) * 0.057).toFixed(2)

  const handleTap = () => {
    const el = wrapRef.current
    if (el) {
      el.classList.remove('plant-jumping')
      void el.offsetWidth
      el.classList.add('plant-jumping')
      el.addEventListener('animationend', () => el.classList.remove('plant-jumping'), { once: true })
    }

    const count = 7
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
      style={{ cursor: 'pointer', display: 'inline-block', lineHeight: 0, position: 'relative' }}
    >
      <svg
        className="plant-svg"
        viewBox="0 0 160 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: score === 0 ? 'saturate(0.42) brightness(1.07)' : undefined,
          transform: `scale(${weekScale})`,
          transformOrigin: 'center bottom',
          transition: 'filter 0.6s ease',
        }}
      >
        <g className={animClass}>
          <g className="pg">
            {/* SPARKLES — score 3 only */}
            <g style={{ display: score === 3 ? 'block' : 'none' }}>
              <g className="spk spk1" transform="translate(16,50)">
                <path d="M0-7.5 2-2 7.5 0 2 2 0 7.5-2 2-7.5 0-2-2Z" fill="#ffd166" />
              </g>
              <g className="spk spk2" transform="translate(141,42)">
                <path d="M0-6 1.6-1.6 6 0 1.6 1.6 0 6-1.6 1.6-6 0-1.6-1.6Z" fill="#ffb3c6" />
              </g>
              <g className="spk spk3" transform="translate(150,88)">
                <path d="M0-7.5 2-2 7.5 0 2 2 0 7.5-2 2-7.5 0-2-2Z" fill="#ffd166" />
              </g>
              <g className="spk spk4" transform="translate(10,92)">
                <path d="M0-5.5 1.4-1.4 5.5 0 1.4 1.4 0 5.5-1.4 1.4-5.5 0-1.4-1.4Z" fill="#a8d8b8" />
              </g>
            </g>

            {/* FLOWER — score 2 and 3 */}
            <g style={{ display: score >= 2 ? 'block' : 'none' }}>
              <circle cx="80" cy="29" r="10.5" fill="#ffb3c6" />
              <circle cx="62" cy="40" r="10.5" fill="#ffb3c6" />
              <circle cx="98" cy="40" r="10.5" fill="#ffb3c6" />
              <circle cx="68" cy="55" r="10" fill="#ffc8d5" />
              <circle cx="92" cy="55" r="10" fill="#ffc8d5" />
              <circle cx="80" cy="45" r="13" fill="#ffd166" />
              <circle cx="80" cy="45" r="7.5" fill="#f6b73c" />
              <circle cx="77" cy="42" r="2.8" fill="rgba(255,255,255,0.68)" />
            </g>

            {/* LEAVES */}
            <ellipse cx="34" cy="92" rx="32" ry="14" transform="rotate(-42 34 92)" fill={side} />
            <ellipse cx="126" cy="92" rx="32" ry="14" transform="rotate(42 126 92)" fill={side} />
            <ellipse cx="60" cy="76" rx="19" ry="30" transform="rotate(-14 60 76)" fill={top} />
            <ellipse cx="100" cy="76" rx="19" ry="30" transform="rotate(14 100 76)" fill={top} />
            <ellipse cx="80" cy="66" rx="17" ry="27" fill={top} style={{ filter: 'brightness(1.06)' }} />

            {/* BODY */}
            <circle cx="80" cy="130" r="51" fill={body} />
            <ellipse cx="64" cy="113" rx="13" ry="8.5" transform="rotate(-22 64 113)" fill="rgba(255,255,255,0.22)" />

            {/* BLUSH */}
            <ellipse cx="57" cy="141" rx="10" ry="6.5" fill="#ffb3c6" style={{ opacity: score === 3 ? 1 : 0 }} />
            <ellipse cx="103" cy="141" rx="10" ry="6.5" fill="#ffb3c6" style={{ opacity: score === 3 ? 1 : 0 }} />

            {/* LEFT EYE */}
            <circle cx="65" cy="125" r="12" fill="white" />
            <circle cx="67" cy="127" r={pr} fill="#1a2820" />
            <circle cx="71" cy="123" r="2.8" fill="white" style={{ display: score >= 2 ? undefined : 'none' }} />
            {/* RIGHT EYE */}
            <circle cx="95" cy="125" r="12" fill="white" />
            <circle cx="97" cy="127" r={pr} fill="#1a2820" />
            <circle cx="101" cy="123" r="2.8" fill="white" style={{ display: score >= 2 ? undefined : 'none' }} />

            {/* MOUTH */}
            <path d={MOUTHS[score]} stroke="#1a2820" strokeWidth="2.6" strokeLinecap="round" fill="none" />

            {/* STEM */}
            <rect x="77" y="177" width="6" height="11" rx="3" fill="#4a7a44" />
          </g>
        </g>

        {/* POT — outside animated group */}
        <rect x="47" y="183" width="66" height="9.5" rx="4.8" fill="#ae6e48" />
        <path d="M53 192.5 Q51 218 80 223 Q109 218 107 192.5 Z" fill="#d49068" />
        <path d="M53 192.5 Q51 218 67 222 L65 192.5 Z" fill="rgba(0,0,0,0.07)" />
        <ellipse cx="69" cy="203" rx="5" ry="10" transform="rotate(-8 69 203)" fill="rgba(255,255,255,0.14)" />
        <ellipse cx="80" cy="185" rx="29" ry="5" fill="#7a4f2a" opacity="0.26" />
        <rect x="60" y="208" width="40" height="13.5" rx="4.5" fill="white" opacity="0.92" />
        <text
          x="80" y="219"
          textAnchor="middle"
          fontSize="8.5"
          fill="#ae6e48"
          fontWeight="800"
          fontFamily="-apple-system,'Helvetica Neue',sans-serif"
        >
          Sprout
        </text>
      </svg>

      {/* TAP PARTICLES */}
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
