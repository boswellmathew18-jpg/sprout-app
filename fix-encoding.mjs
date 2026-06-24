import { readFileSync, writeFileSync } from 'fs';

const file = 'src/App.jsx';
let src = readFileSync(file, 'utf8');

// Specific mojibake replacements (UTF-8 bytes read as Windows-1252, then re-encoded as UTF-8)
const fixes = [
  // Language names
  ['EspaÃ±ol',  'Español'],
  ['FranÃ§ais', 'Français'],
  // Fire emoji 🔥
  ['ðŸ"¥', '🔥'],
  // Plant/sprout 🌿
  ['ðŸŒ¿', '🌿'],
  // Moon 🌙
  ['ðŸŒ™', '🌙'],
  // Sun ☀️ (may be followed by an invisible U+008F control char — handled below)
  ['â˜€ï¸', '☀️'],
  // Down triangle ▾
  ['â–¾', '▾'],
  // Em dash —
  ['â€"', '—'],
  // Box-drawing ─ in JSX/JS comments
  ['â"€', '─'],
];

let total = 0;
for (const [bad, good] of fixes) {
  const parts = src.split(bad);
  const n = parts.length - 1;
  if (n > 0) {
    src = parts.join(good);
    total += n;
    console.log(`  ${n}x  "${bad}"  →  "${good}"`);
  }
}

// Strip stray C1 control characters that Windows-1252 undefined code points
// (0x81, 0x8D, 0x8F, 0x90, 0x9D) map to — invisible but corrupt the string.
// e.g. ☀️ last byte 0x8F becomes U+008F after cp1252 conversion.
let stripped = 0;
for (let cp = 0x80; cp <= 0x9F; cp++) {
  const ch = String.fromCharCode(cp);
  const parts = src.split(ch);
  const n = parts.length - 1;
  if (n > 0) {
    src = parts.join('');
    stripped += n;
  }
}
if (stripped > 0) {
  console.log(`  Stripped ${stripped} stray C1 control character(s) (U+0080–U+009F)`);
  total += stripped;
}

writeFileSync(file, src, 'utf8');
console.log(`\nDone — ${total} fixes applied to ${file}`);
