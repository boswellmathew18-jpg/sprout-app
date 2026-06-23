import { useState } from 'react'
import { TR } from '../translations'

const TREES = [
  { cx: 55,  gy: 148, sc: 0.80, col: '#1c5022' },
  { cx: 112, gy: 130, sc: 1.08, col: '#235c2a' },
  { cx: 180, gy: 116, sc: 1.24, col: '#1e5626' },
  { cx: 250, gy: 128, sc: 1.00, col: '#205828' },
  { cx: 308, gy: 144, sc: 0.82, col: '#1a4e20' },
]

function ForestPlaceholder() {
  return (
    <svg viewBox="0 0 360 185" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="fpMoonGlow" cx="80%" cy="20%" r="40%">
          <stop offset="0%" stopColor="#4a7a50" stopOpacity="0.20" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fpGround" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#143320" />
          <stop offset="100%" stopColor="#09170d" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect width="360" height="185" fill="#071210" />
      <rect width="360" height="185" fill="url(#fpMoonGlow)" />

      {/* Moon */}
      <circle cx="300" cy="32" r="17" fill="rgba(235,252,240,0.14)" />
      <circle cx="300" cy="32" r="12" fill="rgba(235,252,240,0.22)" />

      {/* Stars */}
      {[[50,16],[118,10],[190,20],[250,8],[330,24],[78,32],[162,6],[225,28]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.2} fill="rgba(205,238,218,0.48)" />
      ))}

      {/* Ground */}
      <ellipse cx="180" cy="178" rx="205" ry="28" fill="url(#fpGround)" />

      {/* Trees — clearly visible tiered pines */}
      {TREES.map(({ cx, gy, sc, col }, i) => {
        const h = 72 * sc, w = 33 * sc, tw = 5.5 * sc, ts = 14 * sc
        return (
          <g key={i}>
            <rect x={cx - tw / 2} y={gy - ts} width={tw} height={ts + 3} rx={tw / 3} fill="#0c2a10" />
            <polygon points={`${cx},${gy - h} ${cx - w * 0.50},${gy - h * 0.44} ${cx + w * 0.50},${gy - h * 0.44}`} fill={col} opacity="0.62" />
            <polygon points={`${cx},${gy - h * 0.60} ${cx - w * 0.80},${gy - h * 0.18} ${cx + w * 0.80},${gy - h * 0.18}`} fill={col} opacity="0.80" />
            <polygon points={`${cx},${gy - h * 0.30} ${cx - w},${gy} ${cx + w},${gy}`} fill={col} />
            <polygon points={`${cx},${gy - h * 0.30} ${cx - w},${gy} ${cx + w},${gy}`} fill="rgba(255,255,255,0.04)" />
          </g>
        )
      })}

      {/* Ground mist */}
      <ellipse cx="180" cy="182" rx="180" ry="12" fill="rgba(180,240,210,0.07)" />
    </svg>
  )
}

export default function ForestPreview({ lang }) {
  const t = TR[lang] || TR['en']
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="fp-trigger" onClick={() => setOpen(true)}>
        {t.forestTrigger}
      </button>

      {open && (
        <div className="fp-overlay" onClick={() => setOpen(false)}>
          <div className="fp-modal" onClick={e => e.stopPropagation()}>
            <button className="fp-x" onClick={() => setOpen(false)}>✕</button>
            <div className="fp-forest-wrap">
              <ForestPlaceholder />
              <div className="fp-grow-label">{t.forestGrowing}</div>
              <div className="fp-veil" />
            </div>
            <div className="fp-lock">
              <div className="fp-lock-title">{t.forestSoon}</div>
              <div className="fp-lock-sub">{t.forestSub}</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
