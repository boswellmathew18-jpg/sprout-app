# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server (localhost:5173)
npm run build    # production build to dist/
npm run preview  # serve the dist/ build locally
```

No test runner is configured. Playwright is installed as a dev dependency but has no test files yet.

## Architecture

Sprout is a single-page React 18 wellness tracker app. There is no router — all navigation is managed by a single `activeTab` state string (`'home' | 'breathe' | 'growth'`). Tab panes are always mounted but toggled via `.tab-pane` / `.tab-pane-active` CSS classes so the Breathe timer survives tab switches.

### State and persistence

All user data lives in one `sproutState` object (React state) that is serialised to `localStorage` under the key `sprout_data` on every mutation. The helper `persist(newState)` in `App.jsx` handles this. The shape is:

```js
{
  habits: [{ id, name }],  // up to 3 habits
  days: {
    'YYYY-MM-DD': { habits: { [id]: bool }, water: 0–12, sleep: 0–12|null, mood: 1–5|null, note: '' }
  },
  lang: 'en'|'es'|'de'|'fr',
  muted: bool,
  ambientOn: bool,
}
```

The user's display name is stored separately under `localStorage` key `sprout_name`. Mood/journal history is mirrored to `sprout_history` via `saveHistory()`.

`migrateState()` handles the v1→v2 schema migration (single `habitName` string → `habits` array).

### File layout

- **`src/App.jsx`** — monolithic root component (~840 lines). Contains all business logic, every `useCallback` handler, utility functions (`getGreeting`, `SplitText`, `makeBF`, icon components), and the full JSX layout for all three tabs. New features almost always require changes here.
- **`src/App.css`** — single stylesheet (~1100 lines) for the entire app. Uses CSS custom properties (`--sp`, `--ease`, `--g1–g3`, `--glass`, `--txt`, `--sub`, `--r`, `--rp`) defined on `:root`. Glass-morphism cards use a two-layer `background-image` trick with `background-clip: border-box` to paint the border gradient separately.
- **`src/audio.js`** — all Web Audio API sound generation. Exports individual named functions (`sndHabit`, `sndWater`, `sndWaterTap`, `sndSleep`, `sndSave`, `sndPlant`, `sndMilestone`, `sndStreakSave`, `sndBreathingComplete`, `startAmbient`, `stopAmbient`). Uses a shared lazy `AudioContext` via `getCtx()`. The primitive is `tone(freq, dur, vol, type, freqEnd)`.
- **`src/translations.js`** — `TR` map of `{ en, es, de, fr }` translation objects. All user-visible strings come from here. Some values are functions (e.g. `glass: n => \`${n} / 8 glasses\``).
- **`src/components/`** — presentational components. Most receive all data and callbacks as props; none manage their own persistent state. Key ones: `HabitStreak` / `HabitRow` (habit list with inline rename), `WaterSleep` (water cups + sleep ±0.5 buttons), `WelcomeScreen` (name entry gate), `Breathe` (4-7-8 breathing timer), `PlantDisplay` (animated plant SVG), `ForestBackground` / `StarfieldBackground` (ambient layers).

### Animations

Two animation systems run in parallel:
- **CSS animations** — `split-in` (greeting text), `check-ring`, `cf-fall` (confetti), `bc-rise` (breathing particles), etc. All defined in `App.css`.
- **anime.js v4** — imported as `{ animate, stagger, spring, set, remove }`. Used for: butterfly flight path, wing flutter, card entrance stagger on tab switch, streak flame spring popup + count-up. The v4 API uses `ease:` not `easing:`, and `loop: Infinity` not `loop: true`.

### Key patterns

- **Butterfly** (`makeBF` + `useEffect` in App.jsx): DOM elements created imperatively, appended to `.butterfly-stage` div, animated by anime.js, then `bf.remove()`'d on completion. Wings use `.wl` / `.wr` SVG groups with `transform-box: fill-box` and `transform-origin: right/left center` so `scaleX` pivots from the body.
- **`SplitText`** component: splits the greeting *word* only (before `, `) into per-character `inline-block` spans for staggered animation; the name suffix is rendered as a single `white-space: nowrap` span to prevent mid-name line breaks.
- **Score** (`score` 0–3): computed each render from today's data — habits all done (+1), water ≥ 8 or sleep logged (+1), mood logged (+1). Drives plant growth stage and butterfly spawn rate.
- **`useCallback` everywhere**: all event handlers in App.jsx are memoised to prevent child re-renders.
