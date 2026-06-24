import { readFileSync, writeFileSync } from 'fs'

// ─── audio.js — insert sndBreatheTap before the breathing-guide-tones block ──
{
  const file = 'src/audio.js'
  let src = readFileSync(file, 'utf8')

  if (src.includes('sndBreatheTap')) {
    console.log('audio.js: sndBreatheTap already present')
  } else {
    const MARKER = '\n// ── BREATHING GUIDE TONES ──'
    const NEW_FN = `\nexport const sndBreatheTap = () => {
  tone(523, 0.10, 0.08, 'sine')
  setTimeout(() => tone(660, 0.10, 0.07, 'sine'), 55)
  setTimeout(() => tone(784, 0.14, 0.07, 'sine'), 110)
}\n`
    if (src.includes(MARKER)) {
      src = src.split(MARKER).join(NEW_FN + MARKER)
      console.log('audio.js: added sndBreatheTap before breathing-guide-tones section')
    } else {
      src = src.trimEnd() + '\n' + NEW_FN
      console.log('audio.js: appended sndBreatheTap (marker not found)')
    }
    writeFileSync(file, src, 'utf8')
  }
}

// ─── Breathe.jsx — add sndBreatheTap to import + call it in toggle() ─────────
{
  const file = 'src/components/Breathe.jsx'
  let src = readFileSync(file, 'utf8')

  // 1. Extend the existing audio import
  const OLD_IMPORT = "import { sndBreatheInhale, sndBreatheExhale, stopBreatheSound } from '../audio'"
  const NEW_IMPORT = "import { sndBreatheInhale, sndBreatheExhale, stopBreatheSound, sndBreatheTap } from '../audio'"
  if (src.includes(OLD_IMPORT)) {
    src = src.split(OLD_IMPORT).join(NEW_IMPORT)
    console.log('Breathe.jsx: added sndBreatheTap to import')
  } else {
    console.log('Breathe.jsx: import line not matched — check manually')
  }

  // 2. Fire sndBreatheTap at the top of toggle(), guarded by muted
  //    Handle both LF and CRLF line endings
  const OLD_TOGGLE_LF   = '  const toggle = () => {\n    if (running) {'
  const OLD_TOGGLE_CRLF = '  const toggle = () => {\r\n    if (running) {'
  const NEW_TOGGLE_LF   = '  const toggle = () => {\n    if (!muted) sndBreatheTap()\n    if (running) {'
  const NEW_TOGGLE_CRLF = '  const toggle = () => {\r\n    if (!muted) sndBreatheTap()\r\n    if (running) {'

  if (src.includes(OLD_TOGGLE_LF)) {
    src = src.split(OLD_TOGGLE_LF).join(NEW_TOGGLE_LF)
    console.log('Breathe.jsx: inserted sndBreatheTap call in toggle (LF)')
  } else if (src.includes(OLD_TOGGLE_CRLF)) {
    src = src.split(OLD_TOGGLE_CRLF).join(NEW_TOGGLE_CRLF)
    console.log('Breathe.jsx: inserted sndBreatheTap call in toggle (CRLF)')
  } else {
    console.log('Breathe.jsx: toggle signature not matched — check manually')
  }

  writeFileSync(file, src, 'utf8')
}

console.log('\nBreath-tap sound implementation complete.')
