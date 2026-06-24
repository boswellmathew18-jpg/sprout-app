import { readFileSync, writeFileSync } from 'fs'

// ─── App.jsx ──────────────────────────────────────────────────────────────────
{
  const file = 'src/App.jsx'
  let src = readFileSync(file, 'utf8')

  // 1. Rename localStorage key constants
  src = src.replace("const SK = 'sprout_data'", "const SK = 'grove_data'")
  src = src.replace("const HISTORY_SK = 'sprout_history'", "const HISTORY_SK = 'grove_history'")

  // 2. Fallback greeting when no name
  src = src.replace(": 'Sprout'", ": 'Grove'")

  // 3. Rename sprout_name reads/writes
  src = src.replace("localStorage.getItem('sprout_name')", "localStorage.getItem('grove_name')")
  src = src.replace("localStorage.setItem('sprout_name', name)", "localStorage.setItem('grove_name', name)")

  // 4. Insert one-time localStorage migration IIFE before the SK constant declaration.
  //    This ensures any existing user data under sprout_* keys is copied to grove_* on
  //    first load, so no data is lost during the rebrand.
  const MIGRATION = `// One-time migration: copy sprout_ localStorage data to grove_ namespace
;(function () {
  try {
    ;[['sprout_data', 'grove_data'], ['sprout_history', 'grove_history'],
      ['sprout_name', 'grove_name'], ['sprout_notif', 'grove_notif']
    ].forEach(([o, n]) => {
      if (!localStorage.getItem(n)) {
        const v = localStorage.getItem(o)
        if (v !== null) localStorage.setItem(n, v)
      }
    })
  } catch (e) {}
})()

`
  const SK_LINE = "const SK = 'grove_data'"
  if (!src.includes('grove_data migration') && !src.includes('One-time migration')) {
    src = src.replace(SK_LINE, MIGRATION + SK_LINE)
    console.log('App.jsx: inserted localStorage migration IIFE')
  }

  writeFileSync(file, src, 'utf8')
  console.log('App.jsx: renamed SK, HISTORY_SK, sprout_name, greeting fallback')
}

// ─── MoodHistory.jsx ──────────────────────────────────────────────────────────
{
  const file = 'src/components/MoodHistory.jsx'
  let src = readFileSync(file, 'utf8')
  src = src.replace("const HISTORY_SK = 'sprout_history'", "const HISTORY_SK = 'grove_history'")
  writeFileSync(file, src, 'utf8')
  console.log('MoodHistory.jsx: renamed HISTORY_SK')
}

console.log('\nRebrand script complete.')
