import { useMemo } from 'react'

export default function StarfieldBackground() {
  const stars = useMemo(() => Array.from({ length: 50 }, (_, i) => {
    const opacity = 0.25 + Math.random() * 0.75
    const twinkle = Math.random() > 0.55
    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 105,
      size: 0.7 + Math.random() * 2.1,
      twinkle,
      driftDur: 28 + Math.random() * 48,
      driftDelay: -(Math.random() * 50),
      dx: (Math.random() - 0.5) * 44,
      dy: 14 + Math.random() * 38,
      twinkleDur: 1.2 + Math.random() * 3,
      twinkleDelay: -(Math.random() * 4),
      op: opacity,
      opLow: opacity * 0.14,
    }
  }), [])

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map(s => (
        <div
          key={s.id}
          className={`star${s.twinkle ? ' star-twinkle' : ''}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--dx': `${s.dx}px`,
            '--dy': `${s.dy}px`,
            '--op': s.op,
            '--op-low': s.opLow,
            animationDuration: s.twinkle ? `${s.driftDur}s,${s.twinkleDur}s` : `${s.driftDur}s`,
            animationDelay: s.twinkle ? `${s.driftDelay}s,${s.twinkleDelay}s` : `${s.driftDelay}s`,
          }}
        />
      ))}
    </div>
  )
}
