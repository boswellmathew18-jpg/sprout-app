import { readFileSync, writeFileSync } from 'fs';

// ─── audio.js — append breathing tone functions ───────────────────────────
{
  const file = 'src/audio.js';
  let src = readFileSync(file, 'utf8');

  // Guard: don't double-add
  if (src.includes('sndBreatheInhale')) {
    console.log('audio.js: breathing sounds already present, skipping');
  } else {
    const addition = `
// ── BREATHING GUIDE TONES ──
// One active breath tone at a time; stopped before each new phase starts.

let breatheGainNode = null

export function stopBreatheSound() {
  if (!breatheGainNode) return
  const gain = breatheGainNode
  breatheGainNode = null
  try {
    if (!actx) return
    const t = actx.currentTime
    gain.gain.cancelScheduledValues(t)
    gain.gain.setValueAtTime(gain.gain.value, t)
    gain.gain.linearRampToValueAtTime(0.0001, t + 0.4)
  } catch (e) {}
}

function breatheTone(freqStart, freqEnd, durSec = 4) {
  stopBreatheSound()
  try {
    const c = getCtx()
    const osc  = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    // Frequency glide across the full phase duration
    osc.frequency.setValueAtTime(freqStart, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + durSec)
    // Volume envelope: fade in 0.5 s, hold, fade out 0.5 s
    gain.gain.setValueAtTime(0.0001, c.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, c.currentTime + 0.5)
    gain.gain.setValueAtTime(0.08, c.currentTime + durSec - 0.5)
    gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + durSec)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start()
    osc.stop(c.currentTime + durSec + 0.15)
    breatheGainNode = gain
  } catch (e) {}
}

export const sndBreatheInhale = () => breatheTone(220, 330)
export const sndBreatheExhale = () => breatheTone(330, 220)
`;
    // Trim trailing newline from existing file then append
    src = src.trimEnd() + '\n' + addition;
    writeFileSync(file, src, 'utf8');
    console.log('audio.js: added stopBreatheSound, sndBreatheInhale, sndBreatheExhale');
  }
}

// ─── Breathe.jsx — import sounds + phase-watching useEffect ──────────────
{
  const file = 'src/components/Breathe.jsx';
  let src = readFileSync(file, 'utf8');

  // 1. Add audio import after the existing TR import
  const TR_IMPORT = "import { TR } from '../translations'";
  const AUDIO_IMPORT = "import { sndBreatheInhale, sndBreatheExhale, stopBreatheSound } from '../audio'";
  if (!src.includes(AUDIO_IMPORT)) {
    src = src.split(TR_IMPORT).join(TR_IMPORT + '\n' + AUDIO_IMPORT);
    console.log('Breathe.jsx: added audio import');
  }

  // 2. Insert phase-sound useEffect just before the `const toggle` line.
  //    It watches `phase` and `muted`: plays/stops the appropriate tone,
  //    and returns stopBreatheSound as cleanup (handles unmount + phase change).
  const TOGGLE_LINE = '  const toggle = () => {';
  const SOUND_EFFECT = `  useEffect(() => {
    if (muted || phase === 'idle') { stopBreatheSound(); return }
    if (phase === 'inhale') sndBreatheInhale()
    else if (phase === 'exhale') sndBreatheExhale()
    return stopBreatheSound
  }, [phase, muted])\n\n`;

  if (!src.includes('sndBreatheInhale()') && src.includes(TOGGLE_LINE)) {
    src = src.split(TOGGLE_LINE).join(SOUND_EFFECT + TOGGLE_LINE);
    console.log('Breathe.jsx: inserted phase-sound useEffect');
  } else if (src.includes('sndBreatheInhale()')) {
    console.log('Breathe.jsx: sound effect already present, skipping');
  } else {
    console.log('Breathe.jsx: toggle line not found — check manually');
  }

  writeFileSync(file, src, 'utf8');
}

console.log('\nBreathing sound implementation complete.');
