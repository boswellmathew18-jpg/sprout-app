import { useMemo } from 'react'

export default function StarfieldBackground() {
  const stars = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 105,
    size: 0.7 + Math.random() * 2.1,
    op: 0.25 + Math.random() * 0.75,
  })), [])

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.op,
          }}
        />
      ))}
    </div>
  )
}
