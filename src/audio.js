let actx = null

function getCtx() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)()
  if (actx.state === 'suspended') actx.resume()
  return actx
}

export function tone(freq, dur, vol = 0.07, type = 'sine', freqEnd = null) {
  try {
    const c = getCtx()
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.type = type; o.frequency.value = freq
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + dur)
    g.gain.setValueAtTime(vol, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
    o.start(); o.stop(c.currentTime + dur + 0.02)
  } catch (e) {}
}

export const sndHabit = () => {
  tone(660, 0.05, 0.08, 'sine')
  setTimeout(() => tone(880, 0.09, 0.06, 'sine'), 40)
}
export const sndWater    = () => tone(880, 0.13, 0.07, 'sine', 620)
export const sndWaterTap = () => tone(660, 0.10, 0.05, 'sine', 440)
export const sndSleep = (up = true) => {
  if (up) { tone(784, 0.12, 0.06, 'sine'); setTimeout(() => tone(1047, 0.22, 0.05, 'sine'), 70) }
  else    { tone(659, 0.12, 0.06, 'sine'); setTimeout(() => tone(523,  0.20, 0.04, 'sine'), 65) }
}
export const sndEmoji = () => { tone(528, 0.14, 0.06); setTimeout(() => tone(660, 0.1, 0.04), 45) }
export const sndSave = () => {
  tone(523, 0.18, 0.08)
  setTimeout(() => tone(659, 0.18, 0.07), 115)
  setTimeout(() => tone(784, 0.28, 0.09), 230)
}
export const sndPlant = () => {
  tone(523, 0.12, 0.09, 'sine')
  setTimeout(() => tone(659, 0.12, 0.08, 'sine'), 65)
  setTimeout(() => tone(784, 0.14, 0.08, 'sine'), 130)
  setTimeout(() => tone(1047, 0.22, 0.07, 'sine'), 205)
}
export const sndMilestone = () => {
  tone(784, 0.5, 0.09)
  setTimeout(() => tone(988, 0.5, 0.08), 160)
}
export const sndStreakSave = () => {
  tone(523, 0.12, 0.07)
  setTimeout(() => tone(659, 0.12, 0.07), 100)
  setTimeout(() => tone(784, 0.15, 0.08), 200)
  setTimeout(() => tone(1047, 0.22, 0.06), 310)
}
export const sndBreathingComplete = () => {
  const c = (freq, delay, vol = 0.045) => setTimeout(() => tone(freq, 0.9, vol, 'sine'), delay)
  c(1174, 0)
  c(988, 180)
  c(1318, 350)
  c(880, 550)
  c(1047, 750)
  c(1174, 1050)
}
export const sndBreatheTap = () => {
  tone(523, 0.10, 0.08, 'sine')
  setTimeout(() => tone(660, 0.10, 0.07, 'sine'), 55)
  setTimeout(() => tone(784, 0.14, 0.07, 'sine'), 110)
}
