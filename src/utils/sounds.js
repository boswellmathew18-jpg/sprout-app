let _ctx = null
let _muted = false

export const setMuted = m => { _muted = m }

function getCtx() {
  try {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (_ctx.state === 'suspended') _ctx.resume()
    return _ctx
  } catch (e) { return null }
}

export function playClick() {
  if (_muted) return
  try {
    const c = getCtx(); if (!c) return
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain); gain.connect(c.destination)
    osc.frequency.value = 600
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.06, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.08)
  } catch (e) {}
}

export function playType() {
  if (_muted) return
  try {
    const c = getCtx(); if (!c) return
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain); gain.connect(c.destination)
    osc.frequency.value = 800 + Math.random() * 200
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.04, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.05)
  } catch (e) {}
}

export function playOpen() {
  try {
    const c = getCtx(); if (!c) return
    const notes = [523, 659, 784]
    notes.forEach((freq, i) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.connect(gain); gain.connect(c.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, c.currentTime + i * 0.15)
      gain.gain.linearRampToValueAtTime(0.08, c.currentTime + i * 0.15 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.15 + 0.6)
      osc.start(c.currentTime + i * 0.15)
      osc.stop(c.currentTime + i * 0.15 + 0.6)
    })
  } catch (e) {}
}
