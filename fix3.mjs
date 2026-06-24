import { readFileSync, writeFileSync } from 'fs';

// ─────────────────────────────────────────────
// Fix 1: Week badge — guarantee U+0020 space
// PlantDisplay.jsx: replace JSX text+expression
// with explicit string concatenation
// ─────────────────────────────────────────────
{
  const file = 'src/components/PlantDisplay.jsx';
  let src = readFileSync(file, 'utf8');
  const OLD = '<div className="week-badge">Week {week}</div>';
  const NEW = "<div className=\"week-badge\">{'Week ' + week}</div>";
  if (src.includes(OLD)) {
    src = src.split(OLD).join(NEW);
    writeFileSync(file, src, 'utf8');
    console.log('Fix 1: Week badge space fixed in PlantDisplay.jsx');
  } else {
    console.log('Fix 1: Week badge pattern not found — already fixed or different');
  }
}

// ─────────────────────────────────────────────
// Fix 2: Butterfly SVG — replace makeBF()
// Simple ellipse-wing + circle-body design,
// keeping .wl / .wr classes for flutter anim.
// ─────────────────────────────────────────────
{
  const file = 'src/App.jsx';
  let src = readFileSync(file, 'utf8');

  const OLD_START = 'function makeBF() {';
  const OLD_END   = '\n}';

  const startIdx = src.indexOf(OLD_START);
  // Find the closing brace that ends makeBF (first \n} after startIdx)
  let depth = 0, endIdx = -1;
  for (let i = startIdx; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) { endIdx = i + 1; break; }
    }
  }

  if (startIdx === -1 || endIdx === -1) {
    console.log('Fix 2: makeBF() not found');
  } else {
    const NEW_MAKEBF = `function makeBF() {
  const outer = document.createElement('div')
  outer.className = 'bf-body'
  const inner = document.createElement('div')
  inner.className = 'bf-inner'
  const fill  = 'rgba(140,100,200,0.55)'
  const fill2 = 'rgba(140,100,200,0.38)'
  const body  = 'rgba(140,100,200,0.82)'
  inner.innerHTML = \`<svg width="52" height="44" viewBox="-26 -22 52 44" style="overflow:visible">
    <g class="wl">
      <ellipse cx="-12" cy="-6" rx="14" ry="7"   transform="rotate(-30,-12,-6)" fill="\${fill}"/>
      <ellipse cx="-10" cy="8"  rx="11" ry="5.5"  transform="rotate(30,-10,8)"  fill="\${fill2}"/>
    </g>
    <g class="wr">
      <ellipse cx="12"  cy="-6" rx="14" ry="7"   transform="rotate(30,12,-6)"   fill="\${fill}"/>
      <ellipse cx="10"  cy="8"  rx="11" ry="5.5"  transform="rotate(-30,10,8)"  fill="\${fill2}"/>
    </g>
    <circle cx="0" cy="0" r="4" fill="\${body}"/>
  </svg>\`
  outer.appendChild(inner)
  return outer
}`;
    src = src.slice(0, startIdx) + NEW_MAKEBF + src.slice(endIdx);
    writeFileSync(file, src, 'utf8');
    console.log('Fix 2: Butterfly SVG replaced in App.jsx');
  }
}

// ─────────────────────────────────────────────
// Fix 3: MoodHistory — match Journal.jsx MOODS
// Journal: {1:'😞', 2:'😕', 3:'😐', 4:'🙂', 5:'😄'}
// Old MoodHistory had wrong mapping at keys 2-4
// Also add explicit fallback for null mood
// ─────────────────────────────────────────────
{
  const file = 'src/components/MoodHistory.jsx';
  let src = readFileSync(file, 'utf8');

  // Fix EMOJIS to match Journal.jsx exactly
  const OLD_EMOJIS = "const EMOJIS = { 1: '😞', 2: '😐', 3: '🙂', 4: '😊', 5: '😄' }";
  const NEW_EMOJIS = "const EMOJIS = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }";

  if (src.includes(OLD_EMOJIS)) {
    src = src.split(OLD_EMOJIS).join(NEW_EMOJIS);
    console.log('Fix 3a: MoodHistory EMOJIS corrected to match Journal.jsx');
  } else {
    console.log('Fix 3a: EMOJIS already correct or pattern not found');
  }

  // Fix null-mood fallback: change '·' to '—' so missing moods show a dash
  const OLD_FALLBACK = "|| '·'";
  const NEW_FALLBACK = "|| '—'";
  if (src.includes(OLD_FALLBACK)) {
    src = src.split(OLD_FALLBACK).join(NEW_FALLBACK);
    console.log('Fix 3b: Null-mood fallback changed from · to —');
  }

  // Also make journal notes always visible (show placeholder when empty)
  // Old: {e.note && <div className="hist-note">{e.note}</div>}
  // New: always render the note row, but dim it when empty
  const OLD_NOTE = '{e.note && <div className="hist-note">{e.note}</div>}';
  const NEW_NOTE = '<div className="hist-note" style={e.note ? {} : {opacity:0.3}}>{e.note || \'No note\'}</div>';
  if (src.includes(OLD_NOTE)) {
    src = src.split(OLD_NOTE).join(NEW_NOTE);
    console.log('Fix 3c: Note row always rendered (dimmed when empty)');
  }

  writeFileSync(file, src, 'utf8');
}

console.log('\nAll fixes applied.');
