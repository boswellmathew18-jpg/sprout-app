import { readFileSync, writeFileSync } from 'fs';

// ─── App.jsx ────────────────────────────────────────────────────────────────
{
  const file = 'src/App.jsx';
  let src = readFileSync(file, 'utf8');

  // 1. Add Fireflies import after last existing component import
  const LAST_IMPORT = "import MoodHistory from './components/MoodHistory'";
  const NEW_IMPORT  = "import MoodHistory from './components/MoodHistory'\nimport Fireflies from './components/Fireflies'";
  if (src.includes(LAST_IMPORT) && !src.includes('Fireflies')) {
    src = src.split(LAST_IMPORT).join(NEW_IMPORT);
    console.log('App.jsx: added Fireflies import');
  }

  // 2. Remove makeBF() function (from 'function makeBF()' to the closing brace)
  const BF_START = 'function makeBF() {';
  const startIdx = src.indexOf(BF_START);
  if (startIdx !== -1) {
    let depth = 0, endIdx = -1;
    for (let i = startIdx; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
    }
    if (endIdx !== -1) {
      // Also consume the blank line that follows
      if (src[endIdx] === '\r') endIdx++;
      if (src[endIdx] === '\n') endIdx++;
      src = src.slice(0, startIdx) + src.slice(endIdx);
      console.log('App.jsx: removed makeBF() function');
    }
  }

  // 3. Remove bfStageRef declaration
  const BF_REF = '  const bfStageRef = useRef(null)\n';
  if (src.includes(BF_REF)) {
    src = src.split(BF_REF).join('');
    console.log('App.jsx: removed bfStageRef');
  } else {
    // Try CRLF variant
    const BF_REF_CRLF = '  const bfStageRef = useRef(null)\r\n';
    if (src.includes(BF_REF_CRLF)) {
      src = src.split(BF_REF_CRLF).join('');
      console.log('App.jsx: removed bfStageRef (CRLF)');
    } else {
      console.log('App.jsx: bfStageRef not found — check manually');
    }
  }

  // 4. Remove butterfly spawn useEffect
  // Locate it by its unique starting signature
  const EFFECT_SIG = '  useEffect(() => {\n    if (!userName) return\n    const spawnBF';
  const EFFECT_SIG_CRLF = '  useEffect(() => {\r\n    if (!userName) return\r\n    const spawnBF';
  let effectStart = src.indexOf(EFFECT_SIG);
  if (effectStart === -1) effectStart = src.indexOf(EFFECT_SIG_CRLF);

  if (effectStart !== -1) {
    // Find the matching closing of the effect
    let depth = 0, effectEnd = -1;
    for (let i = effectStart; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') {
        depth--;
        if (depth === 0) {
          effectEnd = i + 1;
          // Consume trailing newline(s)
          if (src[effectEnd] === '\r') effectEnd++;
          if (src[effectEnd] === '\n') effectEnd++;
          break;
        }
      }
    }
    if (effectEnd !== -1) {
      src = src.slice(0, effectStart) + src.slice(effectEnd);
      console.log('App.jsx: removed butterfly spawn useEffect');
    }
  } else {
    console.log('App.jsx: spawn useEffect not found — check manually');
  }

  // 5. Replace butterfly-stage div with <Fireflies />
  // Handle both LF and CRLF variants of the comment + div
  const BF_JSX_LF   = '      {/* ── BUTTERFLIES ── */}\n      <div className="butterfly-stage" ref={bfStageRef} />';
  const BF_JSX_CRLF = '      {/* ── BUTTERFLIES ── */}\r\n      <div className="butterfly-stage" ref={bfStageRef} />';
  const NEW_JSX     = '      {/* ── FIREFLIES ── */}\n      <Fireflies />';

  if (src.includes(BF_JSX_LF)) {
    src = src.split(BF_JSX_LF).join(NEW_JSX);
    console.log('App.jsx: replaced butterfly-stage with <Fireflies />');
  } else if (src.includes(BF_JSX_CRLF)) {
    src = src.split(BF_JSX_CRLF).join(NEW_JSX);
    console.log('App.jsx: replaced butterfly-stage with <Fireflies /> (CRLF)');
  } else {
    // Fallback: just replace the div line
    const DIV_ONLY = '      <div className="butterfly-stage" ref={bfStageRef} />';
    if (src.includes(DIV_ONLY)) {
      src = src.split(DIV_ONLY).join('      <Fireflies />');
      console.log('App.jsx: replaced butterfly-stage div (fallback)');
    } else {
      console.log('App.jsx: butterfly-stage div not found — check manually');
    }
  }

  writeFileSync(file, src, 'utf8');
}

// ─── App.css ────────────────────────────────────────────────────────────────
{
  const file = 'src/App.css';
  let css = readFileSync(file, 'utf8');

  // Remove butterfly CSS block (comment + 5 rules)
  const BF_CSS = `/* ── BUTTERFLY ── anime.js handles path + wing flutter */
.butterfly-stage{position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden}
.bf-body{position:absolute;top:0;left:0;will-change:transform,opacity}
.bf-inner{display:block}
.wl{transform-box:fill-box;transform-origin:right center}
.wr{transform-box:fill-box;transform-origin:left center}`;

  const FIREFLY_CSS = `/* ── FIREFLIES ── */
.firefly-stage{position:fixed;inset:0;pointer-events:none;z-index:2;overflow:hidden}
.firefly{position:absolute;border-radius:50%;will-change:transform,opacity}`;

  if (css.includes(BF_CSS)) {
    css = css.split(BF_CSS).join(FIREFLY_CSS);
    console.log('App.css: replaced butterfly CSS with firefly CSS');
  } else {
    // Try CRLF variant
    const BF_CSS_CRLF = BF_CSS.replace(/\n/g, '\r\n');
    if (css.includes(BF_CSS_CRLF)) {
      css = css.split(BF_CSS_CRLF).join(FIREFLY_CSS);
      console.log('App.css: replaced butterfly CSS with firefly CSS (CRLF)');
    } else {
      console.log('App.css: butterfly CSS block not found — appending firefly CSS');
      css += '\n' + FIREFLY_CSS + '\n';
    }
  }

  writeFileSync(file, css, 'utf8');
}

console.log('\nFirefly migration complete.');
