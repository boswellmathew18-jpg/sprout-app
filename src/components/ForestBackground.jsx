import { useMemo, useEffect, useRef } from 'react'
import { animate } from 'animejs'

const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function treeD(cx, baseY, w, h) {
  const t = Math.max(4, w * 0.09)
  return [
    `M${cx - t},${baseY}`,
    `L${cx - t},${baseY - h * 0.30}`,
    `L${cx - w * 0.50},${baseY - h * 0.30}`,
    `L${cx},${baseY - h * 0.57}`,
    `L${cx + w * 0.50},${baseY - h * 0.30}`,
    `L${cx + t},${baseY - h * 0.30}`,
    `L${cx + t},${baseY - h * 0.52}`,
    `L${cx + w * 0.40},${baseY - h * 0.52}`,
    `L${cx},${baseY - h * 0.76}`,
    `L${cx - w * 0.40},${baseY - h * 0.52}`,
    `L${cx - t},${baseY - h * 0.52}`,
    `L${cx - t},${baseY - h * 0.68}`,
    `L${cx + w * 0.26},${baseY - h * 0.68}`,
    `L${cx},${baseY - h}`,
    `L${cx - w * 0.26},${baseY - h * 0.68}`,
    `L${cx - t},${baseY - h * 0.68}`,
    `Z`,
  ].join(' ')
}

const BACK_TREES = [
  [15, 320, 72, 275],
  [72, 320, 58, 235],
  [128, 320, 82, 300],
  [195, 320, 68, 258],
  [255, 320, 78, 288],
  [312, 320, 62, 245],
  [368, 320, 68, 272],
  [420, 320, 55, 222],
  [-8, 320, 62, 250],
]

const MID_TREES = [
  [30, 220, 58, 190],
  [88, 220, 52, 168],
  [148, 220, 64, 198],
  [212, 220, 56, 178],
  [270, 220, 60, 192],
  [328, 220, 54, 172],
  [385, 220, 58, 182],
  [-5, 220, 44, 150],
]

// Soft organic sunlight beams — warm golden, blurred trapezoid shapes
const SOFT_RAYS = [
  { angle: -50, topW: 40, botW: 135, op: 0.12 },
  { angle: -32, topW: 32, botW: 112, op: 0.18 },
  { angle: -14, topW: 27, botW:  92, op: 0.25 },
  { angle:   2, topW: 22, botW:  84, op: 0.29 },
  { angle:  16, topW: 26, botW:  97, op: 0.22 },
  { angle:  30, topW: 24, botW:  87, op: 0.17 },
  { angle:  44, topW: 21, botW:  74, op: 0.10 },
  { angle:  56, topW: 18, botW:  62, op: 0.08 },
]

function rayPath(topW, botW, len = 1100) {
  const tw = topW / 2, bw = botW / 2
  return `M${-tw} 3 L${-bw} ${len} L${bw} ${len} L${tw} 3 Z`
}

export default function ForestBackground() {
  const raysSvgRef = useRef(null)

  const particles = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: 1 + Math.random() * 98,
    y: 2 + Math.random() * 95,
    size: 1.5 + Math.random() * 1.5,
    dur: 7 + Math.random() * 16,
    delay: -(Math.random() * 24),
    drift: Math.round(-30 + Math.random() * 60),
    opacity: 0.55 + Math.random() * 0.45,
  })), [])

  useEffect(() => {
    if (PREFERS_REDUCED_MOTION) return
    const svg = raysSvgRef.current
    if (!svg) return
    const rays = svg.querySelectorAll('.svg-ray')
    const anims = []

    rays.forEach((ray, i) => {
      const base = SOFT_RAYS[i].op
      const a = animate(ray, {
        opacity: [base * 0.28, base],
        duration: 4200 + i * 260,
        delay: i * 620,
        alternate: true,
        loop: Infinity,
        ease: 'inOutSine',
      })
      anims.push(a)
    })

    return () => anims.forEach(a => a.pause())
  }, [])

  return (
    <div className="forest-bg" aria-hidden="true">
      <div className="forest-layer-back">
        <svg
          viewBox="0 0 430 320"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          {BACK_TREES.map(([cx, y, w, h], i) => (
            <path key={i} d={treeD(cx, y, w, h)} fill="#040c06" />
          ))}
          <rect x="0" y="312" width="430" height="12" fill="#040c06" />
        </svg>
      </div>

      {/* SVG GOD RAYS — soft organic sunlight beams */}
      <svg
        ref={raysSvgRef}
        className="forest-rays-svg"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="rayGoldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FFD700" stopOpacity="1.00" />
            <stop offset="35%"  stopColor="#FFA500" stopOpacity="0.78" />
            <stop offset="72%"  stopColor="#FF8C00" stopOpacity="0.23" />
            <stop offset="100%" stopColor="#FF6600" stopOpacity="0"    />
          </linearGradient>
          <filter id="rayBlur" x="-40%" y="-5%" width="180%" height="110%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        {/* Beams fan from ~50% horizontal, 6% vertical */}
        <g style={{ transform: 'translate(50%, 6%)' }}>
          {SOFT_RAYS.map((r, i) => (
            <path
              key={i}
              className="svg-ray"
              d={rayPath(r.topW, r.botW)}
              fill="url(#rayGoldGrad)"
              opacity={r.op}
              filter="url(#rayBlur)"
              style={{ transformOrigin: '0 0', transform: `rotate(${r.angle}deg)` }}
            />
          ))}
        </g>
      </svg>

      <div className="forest-layer-mid">
        <svg
          viewBox="0 0 430 220"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          {MID_TREES.map(([cx, y, w, h], i) => (
            <path key={i} d={treeD(cx, y, w, h)} fill="#060f08" />
          ))}
          <rect x="0" y="212" width="430" height="12" fill="#060f08" />
        </svg>
      </div>

      <div className="forest-layer-front">
        <svg
          viewBox="0 0 430 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <path
            d="M0 80 Q4 42 12 60 Q18 22 28 52 Q33 12 42 46 Q48 28 54 56 Q60 16 68 48 Q74 34 80 58 Q86 18 94 50 Q100 38 106 60 Q112 22 122 50 Q128 36 134 58 Q140 16 150 48 Q156 30 162 56 Q168 20 178 48 Q184 36 190 58 Q196 12 208 46 Q214 28 220 54 Q226 18 236 48 Q242 34 248 58 Q254 14 264 48 Q270 30 276 55 Q282 18 292 50 Q298 36 304 60 Q310 20 320 50 Q326 38 332 58 Q338 14 348 48 Q354 30 360 55 Q366 20 376 50 Q382 36 388 60 Q394 16 404 48 Q410 32 416 56 Q422 18 428 50 L430 80 Z"
            fill="#030a04"
          />
        </svg>
      </div>

      <div className="forest-particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="forest-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              '--pdrift': `${p.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="forest-mist">
        <div className="mist-layer mist-layer-1" />
        <div className="mist-layer mist-layer-2" />
        <div className="mist-layer mist-layer-3" />
        <div className="mist-layer mist-layer-4" />
        <div className="mist-layer mist-layer-5" />
        <div className="mist-layer mist-layer-6" />
      </div>
    </div>
  )
}
