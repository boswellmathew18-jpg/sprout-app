import { useState, useEffect, useRef, useCallback } from 'react'
import { animate, stagger, spring, set, remove } from 'animejs'
import Onboarding from './components/Onboarding'
import PlantDisplay from './components/PlantDisplay'
import HabitStreak from './components/HabitStreak'
import WaterSleep from './components/WaterSleep'
import Journal from './components/Journal'
import SaveButton from './components/SaveButton'
import ForestBackground from './components/ForestBackground'
import StarfieldBackground from './components/StarfieldBackground'
import Breathe from './components/Breathe'
import MoodHistory from './components/MoodHistory'
import Fireflies from './components/Fireflies'
import ForestPreview from './components/ForestPreview'
import StreakCalendar from './components/StreakCalendar'
import WeeklyStats from './components/WeeklyStats'
import { TR, FLAGS, CODES, LANGS } from './translations'
import { sndHabit, sndWater, sndWaterTap, sndSleep, sndEmoji, sndSave, sndPlant, sndMilestone, sndStreakSave, sndBreathingComplete } from './audio'

const LANG_NAMES = { en: 'English', es: 'Español', de: 'Deutsch', fr: 'Français' }
const SURPRISE_TYPES = ['ladybug', 'rainbow', 'sun']

// One-time migration: copy sprout_ localStorage data to grove_ namespace
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

const SK = 'grove_data'
const HISTORY_SK = 'grove_history'
const TODAY = new Date().toISOString().split('T')[0]
const CF_COLORS = ['#6ccc78', '#ffd166', '#ffb3c6', '#5bc8ee', '#f6b73c', '#a8d8b5', '#ff9ee8']
const GB_COLORS = ['#7de89a', '#4caf78', '#aaf4b2', '#5ddd7a', '#86efac', '#34d37a', '#a7f3d0']
const MS_DATA = {
  3:  { emoji: '🔥', text: '3 Day Streak!',  sub: "You're building something real." },
  7:  { emoji: '🔥', text: '7 Day Streak!',  sub: 'One whole week — incredible!' },
  14: { emoji: '🔥', text: '2 Week Streak!', sub: 'Consistency is your superpower.' },
  21: { emoji: '🔥', text: '21 Day Streak!', sub: 'This is becoming a habit for life.' },
  30: { emoji: '🔥', text: '30 Day Streak!', sub: 'One whole month. You did it.' },
}

function recalcHabitStreak(days, today, habitId) {
  let n = 0
  const d = new Date(today)
  while (true) {
    const k = d.toISOString().split('T')[0]
    if (days[k]?.habits?.[habitId]) { n++; d.setDate(d.getDate() - 1) } else break
  }
  return n
}

function recalcSaveStreak(days, today) {
  let n = 0
  const d = new Date(today)
  while (true) {
    const k = d.toISOString().split('T')[0]
    if (days[k]?.saved) { n++; d.setDate(d.getDate() - 1) } else break
  }
  return n
}

function migrateState(parsed) {
  if ('habitName' in parsed && !Array.isArray(parsed.habits)) {
    const id = 'h1'
    const newDays = {}
    for (const [date, data] of Object.entries(parsed.days || {})) {
      newDays[date] = {
        habits: { [id]: data.habit || false },
        water: data.water || 0,
        sleep: data.sleep ?? null,
        mood: data.mood ?? null,
        note: data.note || '',
      }
    }
    return {
      habits: [{ id, name: parsed.habitName || '' }],
      days: newDays,
      lang: parsed.lang || 'en',
      muted: parsed.muted || false,
    }
  }
  if (!Array.isArray(parsed.habits)) parsed.habits = []
  return parsed
}

function getInitialState() {
  try {
    const r = localStorage.getItem(SK)
    if (r) return migrateState(JSON.parse(r))
  } catch (e) {}
  return { habits: [], days: {}, lang: 'en', muted: false }
}

function saveHistory(date, mood, note) {
  try {
    const h = JSON.parse(localStorage.getItem(HISTORY_SK) || '{}')
    h[date] = { mood, note: (note || '').slice(0, 100) }
    localStorage.setItem(HISTORY_SK, JSON.stringify(h))
  } catch (e) {}
}

function getGreeting(lang, name) {
  const t = TR[lang]
  const h = new Date().getHours()
  const word = h >= 5 && h < 12 ? t.greetMorn : h >= 12 && h < 18 ? t.greetAftn : t.greetEvn
  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : ''
  return displayName ? `${word}, ${displayName}` : 'Grove'
}

function getTimeEmoji() {
  const h = new Date().getHours()
  return h >= 5 && h < 12 ? '🌿' : h >= 12 && h < 18 ? '☀️' : '🌙'
}

function SplitText({ text, emoji }) {
  const commaIdx = text.indexOf(', ')
  // Include ", " in animated chars so comma stays on the greeting word line
  const animPart = commaIdx !== -1 ? text.slice(0, commaIdx + 2) : text
  const namePart = commaIdx !== -1 ? text.slice(commaIdx + 2) : ''
  const chars = [...animPart]
  return (
    <>
      {chars.map((ch, i) => (
        <span
          key={i}
          className="split-char"
          style={{
            animationDelay: `${i * 55}ms`,
            display: ch === ' ' ? 'inline' : 'inline-block',
          }}
        >
          {ch}
        </span>
      ))}
      {namePart && (
        <span
          className="split-char"
          style={{
            animationDelay: `${chars.length * 55}ms`,
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}
        >{namePart}</span>
      )}
      {emoji && (
        <span
          className="split-char"
          style={{ animationDelay: `${(chars.length + namePart.length) * 55}ms`, display: 'inline-block' }}
        >
          {' '}{emoji}
        </span>
      )}
    </>
  )
}


// Tab bar SVG icons
function IconHome({ active }) {
  const c = active ? '#7de89a' : 'rgba(180,220,195,0.42)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22V12M12 12C12 7.5 9 5 5 5C2 5 2 9 5 11C8 13 12 12 12 12ZM12 12C12 7.5 15 5 19 5C22 5 22 9 19 11C16 13 12 12 12 12Z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 22h10" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function IconBreathe({ active }) {
  const c = active ? '#7de89a' : 'rgba(180,220,195,0.42)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M9.6 4.4a2 2 0 1 1 1.4 3.4H2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M12.6 19.4a2 2 0 1 0 1.4-3.4H2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function IconGrowth({ active }) {
  const c = active ? '#7de89a' : 'rgba(180,220,195,0.42)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3v18h18" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 16l4-4 4 4 5-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function App() {
  const [sproutState, setSproutState] = useState(() => {
    const s = getInitialState()
    if (!s.days[TODAY]) s.days[TODAY] = { habits: {}, water: 0, sleep: null, mood: null, note: '' }
    if (!s.days[TODAY].habits) s.days[TODAY].habits = {}
    return s
  })

  const [lang, setLang] = useState(() => sproutState.lang || 'en')
  const [userName, setUserName] = useState(() => {
    try { return localStorage.getItem('grove_name') || '' } catch (e) { return '' }
  })
  const [isBreathing, setIsBreathing] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const [milestone, setMilestone] = useState(null)
  const [milestoneShow, setMilestoneShow] = useState(false)
  const [confettiItems, setConfettiItems] = useState([])
  const [greenBurstItems, setGreenBurstItems] = useState([])
  const [surprise, setSurprise] = useState(null)
  const [langDropOpen, setLangDropOpen] = useState(false)

  // Streak flame popup
  const [streakFlame, setStreakFlame] = useState(null)
  const [streakFlameShow, setStreakFlameShow] = useState(false)
  const [displayCount, setDisplayCount] = useState(0)
  const flameTimerRef = useRef(null)
  const flameElRef = useRef(null)
  const isFirstRender = useRef(true)

  // Breathing completion celebration
  const [breatheShow, setBreatheShow] = useState(false)
  const [breatheParticles, setBreatheParticles] = useState([])
  const [plantGoldGlow, setPlantGoldGlow] = useState(false)
  const breatheTimerRef = useRef(null)

  const langWrapRef = useRef(null)

  const td = sproutState.days[TODAY] || { habits: {}, water: 0, sleep: null, mood: null, note: '' }
  const habits = sproutState.habits || []
  const doneMap = td.habits || {}
  const muted = sproutState.muted
  const habitsDone = habits.length > 0 && habits.every(h => doneMap[h.id])

  const streaks = {}
  for (const h of habits) {
    streaks[h.id] = recalcHabitStreak(sproutState.days, TODAY, h.id)
  }

  const anyHabitDoneToday = habits.some(h => doneMap[h.id])
  const showSeedMsg = recalcSaveStreak(sproutState.days, TODAY) === 0 && !anyHabitDoneToday

  const score = (() => {
    let n = 0
    if (habitsDone) n++
    if ((td.water || 0) >= 8 || td.sleep != null) n++
    if (td.mood != null) n++
    return n
  })()

  const getWeek = () => {
    const dates = Object.keys(sproutState.days).sort()
    if (!dates.length) return 1
    const ms = new Date(TODAY) - new Date(dates[0])
    return Math.min(8, Math.floor(ms / (7 * 24 * 3600 * 1000)) + 1)
  }
  const week = getWeek()

  useEffect(() => {
    const handler = e => {
      if (!langWrapRef.current?.contains(e.target)) setLangDropOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])


  const persist = useCallback(newState => {
    try { localStorage.setItem(SK, JSON.stringify(newState)) } catch (e) {}
  }, [])

  const updateToday = useCallback(updates => {
    setSproutState(prev => {
      const newDays = { ...prev.days, [TODAY]: { ...prev.days[TODAY], ...updates } }
      const next = { ...prev, days: newDays }
      persist(next)
      return next
    })
  }, [persist])

  const showToast = useCallback(msg => {
    setToastMsg(msg)
    setToastShow(true)
    setTimeout(() => setToastShow(false), 2900)
  }, [])

  const launchConfetti = useCallback(() => {
    const items = Array.from({ length: 58 }, (_, i) => ({
      id: i + '_' + Date.now(),
      x: 5 + Math.random() * 90,
      dur: 1.6 + Math.random() * 1.3,
      del: Math.random() * 0.55,
      size: 7 + Math.random() * 9,
      br: Math.random() > 0.4 ? '50%' : Math.random() > 0.5 ? '3px' : '0',
      col: CF_COLORS[Math.floor(Math.random() * CF_COLORS.length)],
      rot: Math.random() * 360,
    }))
    setConfettiItems(items)
    setTimeout(() => setConfettiItems([]), 3400)
  }, [])

  const launchGreenBurst = useCallback(() => {
    const items = Array.from({ length: 44 }, (_, i) => ({
      id: i + '_gb_' + Date.now(),
      x: 4 + Math.random() * 92,
      y: 48 + Math.random() * 36,
      dur: 0.9 + Math.random() * 0.65,
      del: Math.random() * 0.38,
      size: 6 + Math.random() * 11,
      br: Math.random() > 0.38 ? '50%' : Math.random() > 0.5 ? '4px' : '0',
      col: GB_COLORS[Math.floor(Math.random() * GB_COLORS.length)],
      rot: Math.random() * 360,
      vy: -(52 + Math.random() * 32),
    }))
    setGreenBurstItems(items)
    setTimeout(() => setGreenBurstItems([]), 1700)
  }, [])

  const handleToggleHabit = useCallback((habitId) => {
    setSproutState(prev => {
      const prevDone = prev.days[TODAY]?.habits?.[habitId] || false
      const newDone = !prevDone
      if (newDone && !muted) sndHabit()

      const newHabitsMap = { ...(prev.days[TODAY]?.habits || {}), [habitId]: newDone }
      const newDays = { ...prev.days, [TODAY]: { ...prev.days[TODAY], habits: newHabitsMap } }
      let next = { ...prev, days: newDays }

      if (newDone) {
        const newStreak = recalcHabitStreak(newDays, TODAY, habitId)
        const msKey = 'msh_' + habitId + '_' + newStreak
        if (MS_DATA[newStreak] && !next[msKey]) {
          next = { ...next, [msKey]: true }
          const ms = MS_DATA[newStreak]
          setTimeout(() => {
            setMilestone(ms)
            setMilestoneShow(true)
            if (!muted) sndMilestone()
            setTimeout(() => setMilestoneShow(false), 2800)
          }, 500)
        }
      }

      persist(next)
      return next
    })
  }, [muted, persist])

  const handleAddHabit = useCallback((emoji) => {
    const id = 'h' + Date.now()
    setSproutState(prev => {
      if ((prev.habits || []).length >= 3) return prev
      const next = { ...prev, habits: [...(prev.habits || []), { id, name: '', emoji: emoji || '' }] }
      persist(next)
      return next
    })
  }, [persist])

  const handleDeleteHabit = useCallback((habitId) => {
    setSproutState(prev => {
      const next = { ...prev, habits: (prev.habits || []).filter(h => h.id !== habitId) }
      persist(next)
      return next
    })
  }, [persist])

  const handleRenameHabit = useCallback((habitId, name) => {
    setSproutState(prev => {
      const next = { ...prev, habits: (prev.habits || []).map(h => h.id === habitId ? { ...h, name } : h) }
      persist(next)
      return next
    })
  }, [persist])

  const handleTapDot = useCallback(i => {
    setSproutState(prev => {
      const curWater = prev.days[TODAY]?.water || 0
      const newWater = curWater > i ? i : i + 1
      const clamped = Math.max(0, Math.min(12, newWater))
      if (!muted) sndWaterTap()
      const newDays = { ...prev.days, [TODAY]: { ...prev.days[TODAY], water: clamped } }
      const next = { ...prev, days: newDays }
      persist(next)
      return next
    })
  }, [muted, persist])

  const handleAdjWater = useCallback(delta => {
    setSproutState(prev => {
      const cur = prev.days[TODAY]?.water || 0
      const next_w = Math.max(0, Math.min(12, cur + delta))
      if (delta > 0 && !muted) sndWater()
      const newDays = { ...prev.days, [TODAY]: { ...prev.days[TODAY], water: next_w } }
      const next = { ...prev, days: newDays }
      persist(next)
      return next
    })
  }, [muted, persist])

  const handleSleepAdj = useCallback(delta => {
    setSproutState(prev => {
      const cur = prev.days[TODAY]?.sleep ?? 0
      const next_s = Math.round(Math.max(0, Math.min(12, cur + delta)) * 2) / 2
      if (!muted) sndSleep(delta > 0)
      const newDays = { ...prev.days, [TODAY]: { ...prev.days[TODAY], sleep: next_s } }
      const next = { ...prev, days: newDays }
      persist(next)
      return next
    })
  }, [muted, persist])
  const handleMoodChange = useCallback(val => { if (!muted) sndEmoji(); updateToday({ mood: val }) }, [muted, updateToday])
  const handleNoteChange = useCallback(val => { updateToday({ note: val }) }, [updateToday])

  const handleSaveDay = useCallback(() => {
    const isMuted = muted
    if (!isMuted) sndSave()
    showToast(TR[lang].toast)
    saveHistory(TODAY, td.mood, td.note)

    // Compute save streak before updating state
    const alreadySaved = !!sproutState.days[TODAY]?.saved
    const newDaysPreview = {
      ...sproutState.days,
      [TODAY]: { ...(sproutState.days[TODAY] || {}), saved: true },
    }
    const saveStreak = recalcSaveStreak(newDaysPreview, TODAY)
    const isSurprise = score === 3 && sproutState.surpriseDate !== TODAY

    const habitsDoneMap = sproutState.days[TODAY]?.habits || {}
    const anyHabitDone = (sproutState.habits || []).some(h => habitsDoneMap[h.id])

    setSproutState(prev => {
      const todayData = { ...(prev.days[TODAY] || {}), saved: true }
      const newDays = { ...prev.days, [TODAY]: todayData }
      let next = { ...prev, days: newDays }
      if (isSurprise) next = { ...next, surpriseDate: TODAY }
      persist(next)
      return next
    })

    // Streak flame sticker — only first save of the day
    if (saveStreak >= 1 && !alreadySaved) {
      const msData = MS_DATA[saveStreak] || null
      setTimeout(() => {
        if (!isMuted) sndStreakSave()
        setStreakFlame({ count: saveStreak, milestone: msData })
        setStreakFlameShow(true)
        clearTimeout(flameTimerRef.current)
        flameTimerRef.current = setTimeout(() => setStreakFlameShow(false), 2100)
      }, 400)
    }

    // Confetti for a perfect day
    if (score === 3 && !alreadySaved) launchConfetti()

    // Green burst whenever any habit was completed
    if (anyHabitDone && !alreadySaved) launchGreenBurst()

    if (isSurprise) {
      const type = SURPRISE_TYPES[Math.floor(Math.random() * 3)]
      setTimeout(() => {
        setSurprise(type)
        setTimeout(() => setSurprise(null), 3700)
      }, 900)
    }
  }, [muted, lang, score, td.mood, td.note, sproutState, showToast, launchConfetti, launchGreenBurst, persist])

  const handleBreatheComplete = useCallback(() => {
    const isMuted = muted
    if (!isMuted) sndBreathingComplete()
    const particles = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      dur: 1.6 + Math.random() * 2.2,
      del: Math.random() * 1.4,
      size: 4 + Math.random() * 7,
    }))
    setBreatheParticles(particles)
    setPlantGoldGlow(true)
    setBreatheShow(true)
    clearTimeout(breatheTimerRef.current)
    breatheTimerRef.current = setTimeout(() => {
      setBreatheShow(false)
      setPlantGoldGlow(false)
    }, 3000)
  }, [muted])

  const dismissBreathe = useCallback(() => {
    clearTimeout(breatheTimerRef.current)
    setBreatheShow(false)
    setPlantGoldGlow(false)
  }, [])

  // Flame popup — spring entrance + count-up number
  useEffect(() => {
    const el = flameElRef.current
    if (!el) return
    if (streakFlameShow) {
      const count = streakFlame?.count || 0
      setDisplayCount(0)
      set(el, { translateY: 120, opacity: 0, scale: 0.85 })
      animate(el, {
        translateY: [120, 0],
        opacity: [0, 1],
        scale: [0.85, 1],
        ease: spring({ stiffness: 200, damping: 12 }),
      })
      const counter = { val: 0 }
      animate(counter, {
        val: count,
        duration: 600,
        ease: 'outQuart',
        onUpdate: () => setDisplayCount(Math.round(counter.val)),
      })
    } else {
      animate(el, {
        translateY: -16,
        opacity: 0,
        duration: 260,
        ease: 'inQuart',
      })
    }
  }, [streakFlameShow])

  // Card entrance stagger on tab switch (and initial load)
  useEffect(() => {
    const delay = isFirstRender.current ? 950 : 50
    isFirstRender.current = false
    const id = setTimeout(() => {
      const cards = document.querySelectorAll('.tab-pane-active .card, .tab-pane-active .wk-stats')
      if (!cards.length) return
      set(cards, { opacity: 0, translateY: 20 })
      animate(cards, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 380,
        delay: stagger(75),
        ease: 'outQuart',
      })
    }, delay)
    return () => clearTimeout(id)
  }, [activeTab])

  const handlePlantTap = useCallback(() => { if (!muted) sndPlant() }, [muted])

  const handleToggleMute = () => {
    const newVal = !muted
    setSproutState(prev => { const next = { ...prev, muted: newVal }; persist(next); return next })
  }


  const handleSetLang = l => {
    setLang(l)
    setLangDropOpen(false)
    setSproutState(prev => { const next = { ...prev, lang: l }; persist(next); return next })
  }

  const handleWelcomeComplete = name => {
    try { localStorage.setItem('grove_name', name) } catch (e) {}
    setUserName(name)
  }

  if (!userName) return <Onboarding onComplete={handleWelcomeComplete} />

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const t = TR[lang]
  const greeting = getGreeting(lang, userName)
  const timeEmoji = getTimeEmoji()

  return (
    <>
      <ForestBackground />
      <div className={`breathe-night-veil${activeTab === 'breathe' ? ' active' : ''}`} />

      {/* ── HOME TAB ── */}
      <div className={`tab-pane${activeTab === 'home' ? ' tab-pane-active' : ''}`}>
        <div className="app">
          {/* HEADER */}
          <div className="hdr">
            <div className="hdr-icons">
              <button className="mute-btn" onClick={handleToggleMute} aria-label="Toggle tap sounds">
                {muted ? '🔇' : '🔔'}
              </button>
            </div>
            <div className="hdr-left">
              <h1><SplitText text={greeting} emoji={timeEmoji} /></h1>
              <div className="hdr-date">{dateStr}</div>
            </div>
            <div className="lang-wrap" ref={langWrapRef}>
              <button className="lang-btn" onClick={() => setLangDropOpen(o => !o)}>
                <span>{FLAGS[lang]}</span>
                <span>{CODES[lang]}</span>
                <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 1 }}>▾</span>
              </button>
              <div className={`lang-drop ${langDropOpen ? 'open' : ''}`}>
                {LANGS.map(l => (
                  <button key={l} className={`lang-opt ${l === lang ? 'cur' : ''}`} onClick={() => handleSetLang(l)}>
                    {FLAGS[l]}&nbsp;&nbsp;{LANG_NAMES[l]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PLANT */}
          <PlantDisplay
            score={score}
            week={week}
            lang={lang}
            onTap={handlePlantTap}
            surprise={surprise}
            isBreathing={isBreathing}
            goldGlow={plantGoldGlow}
          />

          {showSeedMsg && (
            <p className="seed-msg">Every forest starts with one seed. Start your first habit today.</p>
          )}

          {/* HABITS */}
          <HabitStreak
            habits={habits}
            streaks={streaks}
            doneMap={doneMap}
            lang={lang}
            onToggle={handleToggleHabit}
            onAdd={handleAddHabit}
            onDelete={handleDeleteHabit}
            onRename={handleRenameHabit}
          />

          {/* WATER & SLEEP */}
          <WaterSleep
            water={td.water || 0}
            sleep={td.sleep}
            lang={lang}
            onTapDot={handleTapDot}
            onAdjWater={handleAdjWater}
            onSleepAdj={handleSleepAdj}
          />

          {/* JOURNAL */}
          <Journal
            mood={td.mood}
            note={td.note}
            lang={lang}
            onMoodChange={handleMoodChange}
            onNoteChange={handleNoteChange}
          />

          {/* SAVE */}
          <SaveButton lang={lang} onSave={handleSaveDay} />
        </div>
      </div>

      {/* ── BREATHE TAB ── always mounted so timer survives tab switches */}
      <div className={`tab-pane breathe-tab-pane${activeTab === 'breathe' ? ' tab-pane-active' : ''}`}>
        <StarfieldBackground />
        <div className="breathe-tab-full">
          <div className="breathe-tab-controls">
            <button className="mute-btn" onClick={handleToggleMute} aria-label="Toggle sounds">
              {muted ? '🔇' : '🔔'}
            </button>
          </div>
          <Breathe
            fullScreen
            onBreathing={setIsBreathing}
            onComplete={handleBreatheComplete}
            muted={muted}
            lang={lang}
          />
        </div>
      </div>

      {/* ── GROWTH TAB ── */}
      <div className={`tab-pane${activeTab === 'growth' ? ' tab-pane-active' : ''}`}>
        <div className="app">
          <h2 className="growth-title">{t.growthTitle}</h2>
          <StreakCalendar days={sproutState.days} lang={lang} />
          <WeeklyStats days={sproutState.days} habits={habits} lang={lang} />
          <MoodHistory lang={lang} />
          <ForestPreview lang={lang} />
        </div>
      </div>

      {/* ── BOTTOM TAB BAR ── */}
      <nav className="tab-bar">
        <button
          className={`tab-btn${activeTab === 'home' ? ' active' : ''}`}
          onClick={() => setActiveTab('home')}
          aria-label="Home"
        >
          <span className="tab-lbl">{t.tabHome}</span>
        </button>
        <button
          className={`tab-btn${activeTab === 'breathe' ? ' active' : ''}`}
          onClick={() => setActiveTab('breathe')}
          aria-label="Breathe"
        >
          <span className="tab-lbl">{t.tabBreathe}</span>
        </button>
        <button
          className={`tab-btn${activeTab === 'growth' ? ' active' : ''}`}
          onClick={() => setActiveTab('growth')}
          aria-label="Growth"
        >
          <span className="tab-lbl">{t.tabGrowth}</span>
        </button>
      </nav>

      {/* ── CONFETTI ── */}
      <div className="confetti-wrap">
        {confettiItems.map(item => (
          <div
            key={item.id}
            className="cf"
            style={{
              left: `${item.x}%`,
              width: `${item.size}px`,
              height: `${item.size}px`,
              background: item.col,
              borderRadius: item.br,
              animationDuration: `${item.dur}s`,
              animationDelay: `${item.del}s`,
              transform: `rotate(${item.rot}deg)`,
            }}
          />
        ))}
      </div>

      {/* ── GREEN BURST ── */}
      <div className="gb-wrap">
        {greenBurstItems.map(item => (
          <div
            key={item.id}
            className="gb"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `${item.size}px`,
              height: `${item.size}px`,
              background: item.col,
              borderRadius: item.br,
              animationDuration: `${item.dur}s`,
              animationDelay: `${item.del}s`,
              transform: `rotate(${item.rot}deg)`,
              '--gb-vy': `${item.vy}vh`,
            }}
          />
        ))}
      </div>

      {/* ── FIREFLIES ── */}
      <Fireflies />

      {/* ── HABIT MILESTONE OVERLAY ── */}
      <div className={`milestone-ov ${milestoneShow ? 'show' : ''}`}>
        <div className="milestone-inner">
          <div className="milestone-emoji">{milestone?.emoji}</div>
          <div className="milestone-text">{milestone?.text}</div>
          <div className="milestone-sub">{milestone?.sub}</div>
        </div>
      </div>

      {/* ── STREAK FLAME STICKER ── anime.js drives opacity/transform */}
      <div className="sf-float-wrap">
        <div className="streak-flame-float" ref={flameElRef} style={{ opacity: 0 }}>
          <div className="sf-flame-only">🔥</div>
          <div className="sf-count-only">{displayCount} day streak</div>
        </div>
      </div>

      {/* ── BREATHING COMPLETION OVERLAY ── */}
      {breatheShow && (
        <div className="breathe-complete-ov" onClick={dismissBreathe}>
          <div className="bc-particles">
            {breatheParticles.map(p => (
              <div
                key={p.id}
                className="bc-particle"
                style={{
                  left: `${p.left}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.del}s`,
                }}
              />
            ))}
          </div>
          <div className="bc-msg">
            <div className="bc-text">Well done 🌿</div>
            <div className="bc-sub">You took a moment for yourself</div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <div className={`toast ${toastShow ? 'show' : ''}`}>{toastMsg}</div>
    </>
  )
}
