let actx = null
let ambientNodes = null
let rainNodes = null

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
export const sndWater = () => tone(880, 0.13, 0.07, 'sine', 620)
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

// ── FOREST AMBIENT (drone + wind noise + occasional bird chirps) ──

function scheduleChirp(c, master) {
  if (!ambientNodes) return
  try {
    const baseFreq = 2600 + Math.random() * 1400
    const g = c.createGain()
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(baseFreq, c.currentTime)
    o.frequency.linearRampToValueAtTime(baseFreq * 1.28, c.currentTime + 0.055)
    o.frequency.linearRampToValueAtTime(baseFreq * 0.88, c.currentTime + 0.13)
    g.gain.setValueAtTime(0.022, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.20)
    o.connect(g); g.connect(master)
    o.start(); o.stop(c.currentTime + 0.24)
    // Occasional double-chirp
    if (Math.random() > 0.55) {
      setTimeout(() => {
        if (!ambientNodes) return
        try {
          const g2 = c.createGain()
          const o2 = c.createOscillator()
          o2.type = 'sine'
          o2.frequency.value = baseFreq * 1.12
          g2.gain.setValueAtTime(0.016, c.currentTime)
          g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.16)
          o2.connect(g2); g2.connect(master)
          o2.start(); o2.stop(c.currentTime + 0.18)
        } catch (e) {}
      }, 110 + Math.random() * 80)
    }
  } catch (e) {}
  setTimeout(() => scheduleChirp(c, master), 3200 + Math.random() * 9000)
}

export function startAmbient() {
  if (ambientNodes) return
  try {
    const c = getCtx()
    const master = c.createGain()
    master.gain.setValueAtTime(0.001, c.currentTime)
    master.gain.linearRampToValueAtTime(0.030, c.currentTime + 2.5)
    master.connect(c.destination)

    // Slow breathing LFO
    const lfo = c.createOscillator()
    const lfoGain = c.createGain()
    lfo.frequency.value = 0.07
    lfoGain.gain.value = 0.006
    lfo.connect(lfoGain)
    lfoGain.connect(master.gain)
    lfo.start()

    // Harmonic drone — layered pure sines
    const layers = [
      { freq: 55,  vol: 0.50 },
      { freq: 110, vol: 0.28 },
      { freq: 165, vol: 0.16 },
      { freq: 220, vol: 0.09 },
      { freq: 275, vol: 0.04 },
    ]
    const oscs = layers.map(({ freq, vol }) => {
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq + (Math.random() - 0.5) * 1.5
      g.gain.value = vol
      osc.connect(g); g.connect(master)
      osc.start()
      return { osc, g }
    })

    // Wind noise — bandpassed noise with slow LFO modulation
    const windBufLen = 2 * c.sampleRate
    const windBuf = c.createBuffer(1, windBufLen, c.sampleRate)
    const windData = windBuf.getChannelData(0)
    for (let i = 0; i < windBufLen; i++) windData[i] = Math.random() * 2 - 1
    const windSrc = c.createBufferSource()
    windSrc.buffer = windBuf
    windSrc.loop = true
    const windBp = c.createBiquadFilter()
    windBp.type = 'bandpass'
    windBp.frequency.value = 320
    windBp.Q.value = 0.35
    const windGain = c.createGain()
    windGain.gain.value = 0.012
    // Wind swell LFO
    const windLfo = c.createOscillator()
    const windLfoG = c.createGain()
    windLfo.frequency.value = 0.04
    windLfoG.gain.value = 0.006
    windLfo.connect(windLfoG); windLfoG.connect(windGain.gain)
    windLfo.start()
    windSrc.connect(windBp); windBp.connect(windGain); windGain.connect(master)
    windSrc.start()

    ambientNodes = { master, lfo, lfoGain, oscs, windSrc, windBp, windGain, windLfo, windLfoG }

    // Kick off bird chirps after a short delay
    setTimeout(() => scheduleChirp(c, master), 2200 + Math.random() * 3000)
  } catch (e) {}
}

export function stopAmbient() {
  if (!ambientNodes) return
  const nodes = ambientNodes
  ambientNodes = null
  try {
    const { master, lfo, windLfo, oscs, windSrc } = nodes
    if (actx) {
      const t = actx.currentTime
      master.gain.setValueAtTime(master.gain.value, t)
      master.gain.linearRampToValueAtTime(0.001, t + 1.5)
    }
    setTimeout(() => {
      oscs.forEach(({ osc }) => { try { osc.stop() } catch (e) {} })
      try { lfo.stop() } catch (e) {}
      try { windLfo.stop() } catch (e) {}
      try { windSrc.stop() } catch (e) {}
    }, 1700)
  } catch (e) {}
}

// ── RAIN AMBIENT (filtered noise with layered texture) ──

export function startRain() {
  if (rainNodes) return
  try {
    const c = getCtx()
    const sampleRate = c.sampleRate
    const bufLen = 2 * sampleRate

    // Main rain noise
    const buf = c.createBuffer(1, bufLen, sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
    const src = c.createBufferSource()
    src.buffer = buf
    src.loop = true

    // Bandpass for rain "hiss" texture
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1000
    bp.Q.value = 0.6

    // Lowpass to soften harsh highs
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 3500

    // Subtle LFO simulating rain intensity variation
    const lfo = c.createOscillator()
    const lfoG = c.createGain()
    lfo.frequency.value = 0.06
    lfoG.gain.value = 0.018

    const master = c.createGain()
    master.gain.setValueAtTime(0.001, c.currentTime)
    master.gain.linearRampToValueAtTime(0.16, c.currentTime + 2.5)
    master.connect(c.destination)

    lfo.connect(lfoG); lfoG.connect(master.gain)
    lfo.start()
    src.connect(bp); bp.connect(lp); lp.connect(master)
    src.start()

    // Second noise layer — lower frequency, heavier drops
    const buf2 = c.createBuffer(1, bufLen, sampleRate)
    const data2 = buf2.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data2[i] = Math.random() * 2 - 1
    const src2 = c.createBufferSource()
    src2.buffer = buf2
    src2.loop = true
    const lp2 = c.createBiquadFilter()
    lp2.type = 'lowpass'
    lp2.frequency.value = 280
    const g2 = c.createGain()
    g2.gain.value = 0.55
    src2.connect(lp2); lp2.connect(g2); g2.connect(master)
    src2.start()

    rainNodes = { src, src2, bp, lp, lp2, g2, lfo, lfoG, master }
  } catch (e) {}
}

export function stopRain() {
  if (!rainNodes) return
  const nodes = rainNodes
  rainNodes = null
  try {
    const { master, lfo, src, src2 } = nodes
    if (actx) {
      const t = actx.currentTime
      master.gain.setValueAtTime(master.gain.value, t)
      master.gain.linearRampToValueAtTime(0.001, t + 1.5)
    }
    setTimeout(() => {
      try { src.stop() } catch (e) {}
      try { src2.stop() } catch (e) {}
      try { lfo.stop() } catch (e) {}
    }, 1700)
  } catch (e) {}
}
