import { useState } from 'react'

function IsometricForest() {
  const trees = [
    [55, 155, 0.55, '#091a0c'], [110, 130, 0.90, '#0d2811'], [175, 115, 1.05, '#112f14'],
    [245, 128, 0.82, '#0c2410'], [300, 150, 0.62, '#091a0b'], [28,  168, 0.45, '#081508'],
    [82,  110, 0.75, '#0e2812'], [148, 95,  1.10, '#132e16'], [215, 100, 0.95, '#102c13'],
    [280, 118, 0.70, '#0b2010'], [330, 140, 0.58, '#091808'], [38,  138, 0.60, '#0a1c0d'],
    [128, 148, 0.65, '#0c2110'], [198, 145, 0.72, '#0b1f0e'], [255, 162, 0.52, '#08160a'],
  ]

  return (
    <svg viewBox="0 0 360 210" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="fpSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020704" />
          <stop offset="100%" stopColor="#081a0d" />
        </linearGradient>
        <radialGradient id="fpGround" cx="50%" cy="100%" r="65%">
          <stop offset="0%" stopColor="#1a3a1e" />
          <stop offset="100%" stopColor="#081408" />
        </radialGradient>
        <radialGradient id="fpGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(50,160,70,0.30)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <rect width="360" height="210" fill="url(#fpSky)" />

      {/* Moon */}
      <circle cx="310" cy="32" r="18" fill="rgba(255,245,215,0.12)" />
      <circle cx="310" cy="32" r="13" fill="rgba(255,245,215,0.18)" />

      {/* Stars */}
      {[[60,20],[130,14],[200,22],[260,10],[40,38],[320,55],[170,8]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.2} fill="rgba(220,240,230,0.55)" />
      ))}

      {/* Fireflies */}
      {[[80,88],[155,72],[225,108],[120,80],[285,92],[48,125],[195,60]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.8} fill="rgba(190,255,190,0.65)" />
      ))}

      {/* Ground */}
      <ellipse cx="180" cy="188" rx="175" ry="32" fill="url(#fpGround)" />
      <ellipse cx="180" cy="183" rx="120" ry="18" fill="url(#fpGlow)" />

      {/* Trees back to front */}
      {trees.map(([x, y, sc, col], i) => {
        const h = 72 * sc
        const w = 34 * sc
        const tw = 6.5 * sc
        const th = 16 * sc
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            <rect x={-tw / 2} y={-th} width={tw} height={th + 4} rx={tw / 3} fill={col} opacity={0.85} />
            <polygon points={`0,${-h} ${-w * 0.65},${-h * 0.42} ${w * 0.65},${-h * 0.42}`} fill={col} opacity={0.72} />
            <polygon points={`0,${-h * 0.60} ${-w * 0.85},${-h * 0.15} ${w * 0.85},${-h * 0.15}`} fill={col} opacity={0.84} />
            <polygon points={`0,${-h * 0.28} ${-w},0 ${w},0`} fill={col} />
          </g>
        )
      })}

      {/* Ground mist */}
      <ellipse cx="180" cy="195" rx="170" ry="18" fill="rgba(200,240,220,0.06)" />
    </svg>
  )
}

export default function ForestPreview() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="fp-trigger" onClick={() => setOpen(true)}>
        🌲 Your Forest
      </button>

      {open && (
        <div className="fp-overlay" onClick={() => setOpen(false)}>
          <div className="fp-modal" onClick={e => e.stopPropagation()}>
            <button className="fp-x" onClick={() => setOpen(false)}>✕</button>
            <div className="fp-forest-wrap">
              <div className="fp-forest-blur">
                <IsometricForest />
              </div>
              <div className="fp-veil" />
            </div>
            <div className="fp-lock">
              <div className="fp-lock-icon">🔒</div>
              <div className="fp-lock-title">Premium 🌿</div>
              <div className="fp-lock-sub">
                Watch your forest grow with every streak day. Unlock Premium to explore your full forest.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
