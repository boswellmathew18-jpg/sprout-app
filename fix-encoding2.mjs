import { readFileSync, writeFileSync } from 'fs';

const file = 'src/App.jsx';
let src = readFileSync(file, 'utf8');

// Build replacement strings using explicit code points to avoid any
// encoding ambiguity when this script file is written/read.

// 🔥 fire: U+00F0 U+0178 U+201D U+00A5  →  U+1F525
const FIRE_BAD  = String.fromCodePoint(0x00F0, 0x0178, 0x201D, 0x00A5);
const FIRE_GOOD = String.fromCodePoint(0x1F525);

// — em dash: U+00E2 U+20AC U+201D  →  U+2014
const EMDASH_BAD  = String.fromCodePoint(0x00E2, 0x20AC, 0x201D);
const EMDASH_GOOD = String.fromCodePoint(0x2014);

// ─ box drawing: U+00E2 U+201D U+20AC  →  U+2500
const BOX_BAD  = String.fromCodePoint(0x00E2, 0x201D, 0x20AC);
const BOX_GOOD = String.fromCodePoint(0x2500);

const fixes = [
  [FIRE_BAD,   FIRE_GOOD,   '🔥 fire emoji'],
  [EMDASH_BAD, EMDASH_GOOD, '— em dash'],
  [BOX_BAD,    BOX_GOOD,    '─ box drawing'],
];

let total = 0;
for (const [bad, good, label] of fixes) {
  const parts = src.split(bad);
  const n = parts.length - 1;
  if (n > 0) {
    src = parts.join(good);
    total += n;
    console.log(`  ${n}x  ${label}`);
  } else {
    console.log(`  0x  ${label}  (not found — already fixed or different encoding)`);
  }
}

writeFileSync(file, src, 'utf8');
console.log(`\nDone — ${total} additional fixes applied to ${file}`);
