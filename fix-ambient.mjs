import { readFileSync, writeFileSync } from 'fs';

// ─── audio.js ───────────────────────────────────────────────────────────────
// Keep only interaction sounds; strip all ambient/rain code.
{
  const file = 'src/audio.js';

  // Write the clean file directly — it's short enough to own completely.
  const clean = `let actx = null

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
`;

  writeFileSync(file, clean, 'utf8');
  console.log('audio.js: stripped ambient/rain, kept interaction sounds');
}

// ─── App.jsx ────────────────────────────────────────────────────────────────
{
  const file = 'src/App.jsx';
  let src = readFileSync(file, 'utf8');

  // 1. Remove ambient imports from audio
  const OLD_IMPORT = "import { sndHabit, sndWater, sndWaterTap, sndSleep, sndEmoji, sndSave, sndPlant, sndMilestone, sndStreakSave, sndBreathingComplete, startAmbient, stopAmbient, startRain, stopRain } from './audio'";
  const NEW_IMPORT = "import { sndHabit, sndWater, sndWaterTap, sndSleep, sndEmoji, sndSave, sndPlant, sndMilestone, sndStreakSave, sndBreathingComplete } from './audio'";
  src = src.split(OLD_IMPORT).join(NEW_IMPORT);
  console.log('App.jsx: removed ambient imports from audio');

  // 2. Remove ambientMode useState (3-line block)
  const AMBIENT_STATE_LF = `  const [ambientMode, setAmbientMode] = useState(() => {
    if (sproutState.ambientMode) return sproutState.ambientMode
    if (sproutState.ambientOn) return 'forest'
    return 'off'
  })\n`;
  const AMBIENT_STATE_CRLF = AMBIENT_STATE_LF.replace(/\n/g, '\r\n');
  if (src.includes(AMBIENT_STATE_LF)) {
    src = src.split(AMBIENT_STATE_LF).join('');
    console.log('App.jsx: removed ambientMode useState');
  } else if (src.includes(AMBIENT_STATE_CRLF)) {
    src = src.split(AMBIENT_STATE_CRLF).join('');
    console.log('App.jsx: removed ambientMode useState (CRLF)');
  } else {
    console.log('App.jsx: ambientMode useState not matched — check manually');
  }

  // 3. Remove handleCycleAmbient function
  const CYCLE_SIG = '  const handleCycleAmbient = () => {';
  const cycleStart = src.indexOf(CYCLE_SIG);
  if (cycleStart !== -1) {
    let depth = 0, cycleEnd = -1;
    for (let i = cycleStart; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') {
        depth--;
        if (depth === 0) {
          cycleEnd = i + 1;
          if (src[cycleEnd] === '\r') cycleEnd++;
          if (src[cycleEnd] === '\n') cycleEnd++;
          break;
        }
      }
    }
    if (cycleEnd !== -1) {
      src = src.slice(0, cycleStart) + src.slice(cycleEnd);
      console.log('App.jsx: removed handleCycleAmbient');
    }
  }

  // 4. Remove ambient button from HOME TAB header (hdr-icons block)
  // Pattern: the second button inside hdr-icons
  const HOME_AMB_LF = `              <button className="mute-btn" onClick={handleCycleAmbient} aria-label="Cycle ambient sound">
                {ambientMode === 'forest' ? '🌳' : ambientMode === 'rain' ? '🌧' : '🍃'}
              </button>\n`;
  const HOME_AMB_CRLF = HOME_AMB_LF.replace(/\n/g, '\r\n');
  if (src.includes(HOME_AMB_LF)) {
    src = src.split(HOME_AMB_LF).join('');
    console.log('App.jsx: removed home tab ambient button');
  } else if (src.includes(HOME_AMB_CRLF)) {
    src = src.split(HOME_AMB_CRLF).join('');
    console.log('App.jsx: removed home tab ambient button (CRLF)');
  } else {
    console.log('App.jsx: home tab ambient button not matched — check manually');
  }

  // 5. Remove ambient button from BREATHE TAB controls
  const BREATHE_AMB_LF = `            <button className="mute-btn" onClick={handleCycleAmbient} aria-label="Cycle ambient">
              {ambientMode === 'forest' ? '🌳' : ambientMode === 'rain' ? '🌧' : '🍃'}
            </button>\n`;
  const BREATHE_AMB_CRLF = BREATHE_AMB_LF.replace(/\n/g, '\r\n');
  if (src.includes(BREATHE_AMB_LF)) {
    src = src.split(BREATHE_AMB_LF).join('');
    console.log('App.jsx: removed breathe tab ambient button');
  } else if (src.includes(BREATHE_AMB_CRLF)) {
    src = src.split(BREATHE_AMB_CRLF).join('');
    console.log('App.jsx: removed breathe tab ambient button (CRLF)');
  } else {
    console.log('App.jsx: breathe tab ambient button not matched — check manually');
  }

  // 6. Remove ambientOn from migrateState return
  const MIG_AMB_LF   = '      ambientOn: parsed.ambientOn || false,\n';
  const MIG_AMB_CRLF = '      ambientOn: parsed.ambientOn || false,\r\n';
  if (src.includes(MIG_AMB_LF)) {
    src = src.split(MIG_AMB_LF).join('');
    console.log('App.jsx: removed ambientOn from migrateState');
  } else if (src.includes(MIG_AMB_CRLF)) {
    src = src.split(MIG_AMB_CRLF).join('');
    console.log('App.jsx: removed ambientOn from migrateState (CRLF)');
  }

  // 7. Remove ambientOn from getInitialState default return
  const INIT_OLD_LF   = "  return { habits: [], days: {}, lang: 'en', muted: false, ambientOn: false }\n";
  const INIT_NEW_LF   = "  return { habits: [], days: {}, lang: 'en', muted: false }\n";
  const INIT_OLD_CRLF = "  return { habits: [], days: {}, lang: 'en', muted: false, ambientOn: false }\r\n";
  const INIT_NEW_CRLF = "  return { habits: [], days: {}, lang: 'en', muted: false }\r\n";
  if (src.includes(INIT_OLD_LF)) {
    src = src.split(INIT_OLD_LF).join(INIT_NEW_LF);
    console.log('App.jsx: removed ambientOn from initial state');
  } else if (src.includes(INIT_OLD_CRLF)) {
    src = src.split(INIT_OLD_CRLF).join(INIT_NEW_CRLF);
    console.log('App.jsx: removed ambientOn from initial state (CRLF)');
  }

  writeFileSync(file, src, 'utf8');
}

console.log('\nAmbient removal complete.');
