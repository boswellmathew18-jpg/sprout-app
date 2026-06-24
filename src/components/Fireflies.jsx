import { useEffect, useRef } from 'react'
import { animate, set } from 'animejs'

const COLORS = ['#ff9eb5', '#9ec8ff', '#ffe566', '#90ee90', '#ffb347', '#c9a0ff']
const COUNT = 14

// Deterministic config per firefly — avoids random values in render
const CONFIG = Array.from({ length: COUNT }, (_, i) => ({
  color:    COLORS[i % COLORS.length],
  size:     6 + (i % 5),                  // 6–10 px diameter
  pulseDur: 1500 + (i * 137 % 1500),      // 1500–3000 ms blink cycle
  pulseLo:  +(0.30 + (i * 0.031 % 0.15)).toFixed(2), // 0.30–0.45
}))

export default function Fireflies() {
  const refs = useRef([])

  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    let active = true
    const timers = []

    function drift(el) {
      if (!active || !el) return
      animate(el, {
        translateX: Math.random() * vw * 0.92,
        translateY: Math.random() * vh * 0.92,
        duration: 8000 + Math.random() * 14000,
        ease: 'inOutSine',
        onComplete: () => drift(el),
      })
    }

    refs.current.forEach((el, i) => {
      if (!el) return
      // Spread starting positions across the full viewport
      set(el, {
        translateX: Math.random() * vw,
        translateY: Math.random() * vh,
      })
      // Stagger drift starts so fireflies don't move in sync
      const t = setTimeout(() => drift(el), i * 220)
      timers.push(t)
      // Independent opacity pulse — breathes slowly between lo and 1.0
      const { pulseLo, pulseDur } = CONFIG[i]
      animate(el, {
        opacity: [pulseLo, 1.0, pulseLo],
        duration: pulseDur,
        loop: Infinity,
        ease: 'inOutSine',
      })
    })

    return () => {
      active = false
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="firefly-stage">
      {CONFIG.map(({ color, size, pulseLo }, i) => (
        <div
          key={i}
          ref={el => { refs.current[i] = el }}
          className="firefly"
          style={{
            width:  size + 'px',
            height: size + 'px',
            background: color,
            opacity: pulseLo,
            boxShadow: [
              `0 0 ${size + 2}px ${Math.ceil(size / 2)}px ${color}cc`,
              `0 0 ${size * 3}px ${size}px ${color}55`,
            ].join(', '),
          }}
        />
      ))}
    </div>
  )
}
