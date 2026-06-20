import { useState, useEffect, useRef, useCallback } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import PlantDisplay from './components/PlantDisplay'
import HabitStreak from './components/HabitStreak'
import WaterSleep from './components/WaterSleep'
import Journal from './components/Journal'
import SaveButton from './components/SaveButton'
import ForestBackground from './components/ForestBackground'
import { TR, FLAGS, CODES, LANGS } from './translations'
import { sndHabit, sndWater, sndEmoji, sndSave, sndPlant, sndMilestone, startAmbient, stopAmbient } from './audio'

const LANG_NAMES = { en: 'English', es: 'Español', de: 'Deutsch', fr: 'Français' }
const SURPRISE_TYPES = ['ladybug', 'rainbow', 'sun']

const SK = 'sprout_data'
const TODAY = new Date().toISOString().split('T')[0]
const CF_COLORS = ['#6ccc78', '#ffd166', '#ffb3c6', '#5bc8ee', '#f6b73c', '#a8d8b5', '#ff9ee8']
const MS_DATA = {
  3:  { emoji: '🌱', text: '3 Day Streak!',  sub: "You're building something real." },
  7:  { emoji: '🔥', text: '7 Day Streak!',  sub: 'One whole week — incredible!' },
  14: { emoji: '⚡', text: '2 Week Streak!', sub: 'Consistency is your superpower.' },
  21: { emoji: '🌟', text: '21 Day Streak!', sub: 'This is becoming a habit for life.' },
  30: { emoji: '🏆', text: '30 Day Streak!', sub: 'One whole month. You did it.' },
}

function recalcStreak(days, today) {
  let n = 0
  const d = new Date(today)
  while (true) {
    const k = d.toISOString().split('T')[0]
    if (days[k]?.habit) { n++; d.setDate(d.getDate() - 1) } else break
  }
  return n
}

function getInitialState() {
  try {
    const r = localStorage.getItem(SK)
    if (r) return JSON.parse(r)
  } catch (e) {}
  return { habitName: '', streak: 0, days: {}, lang: 'en', muted: false, ambientOn: false }
}

function getGreeting(lang, name) {
  const t = TR[lang]
  const h = new Date().getHours()
  const word = h >= 5 && h < 12 ? t.greetMorn : h >= 12 && h < 18 ? t.greetAftn : t.greetEvn
  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : ''
  return displayName ? `${word}, ${displayName}` : 'Sprout'
}

function getTimeEmoji() {
  const h = new Date().getHours()
  return h >= 5 && h < 12 ? '🌿' : h >= 12 && h < 18 ? '☀️' : '🌙'
}

function makeBF() {
  const outer = document.createElement('div')
  outer.className = 'butterfly'
  const wave = document.createElement('div')
  wave.className = 'bf-wave'
  const palettes = [
    { w: '#f08528', h: '#f5b84a', dk: '#281005', dot: '#fffbe6' },
    { w: '#c0a4e8', h: '#ddd0f8', dk: '#2e1a50', dot: '#fef0ff' },
    { w: '#f0c060', h: '#f8e090', dk: '#2a1a00', dot: '#ffffff' },
  ]
  const p = palettes[Math.floor(Math.random() * palettes.length)]
  wave.innerHTML = `<svg width="90" height="78" viewBox="-55 -48 110 85" style="overflow:visible">
    <g class="wl">
      <path d="M 0,2 C -5,-4 -30,-42 -44,-30 C -50,-18 -30,-1 0,13" fill="${p.w}"/>
      <path d="M 0,6 C -6,0 -24,-30 -36,-22 C -40,-14 -26,0 0,10" fill="${p.h}" opacity="0.55"/>
      <line x1="0" y1="8" x2="-37" y2="-20" stroke="${p.dk}" stroke-width="0.7" opacity="0.38"/>
      <circle cx="-40" cy="-26" r="2.4" fill="${p.dot}" opacity="0.82"/>
      <path d="M 0,12 C -10,10 -38,13 -40,28 C -38,39 -14,35 0,27" fill="${p.w}"/>
      <path d="M 0,16 C -8,14 -30,17 -32,27 C -30,34 -12,31 0,24" fill="${p.h}" opacity="0.5"/>
    </g>
    <g class="wr">
      <path d="M 0,2 C 5,-4 30,-42 44,-30 C 50,-18 30,-1 0,13" fill="${p.w}"/>
      <path d="M 0,6 C 6,0 24,-30 36,-22 C 40,-14 26,0 0,10" fill="${p.h}" opacity="0.55"/>
      <line x1="0" y1="8" x2="37" y2="-20" stroke="${p.dk}" stroke-width="0.7" opacity="0.38"/>
      <circle cx="40" cy="-26" r="2.4" fill="${p.dot}" opacity="0.82"/>
      <path d="M 0,12 C 10,10 38,13 40,28 C 38,39 14,35 0,27" fill="${p.w}"/>
      <path d="M 0,16 C 8,14 30,17 32,27 C 30,34 12,31 0,24" fill="${p.h}" opacity="0.5"/>
    </g>
    <ellipse cx="0" cy="12" rx="2.8" ry="15" fill="${p.dk}"/>
    <circle cx="0" cy="-4" r="3.2" fill="${p.dk}"/>
    <path d="M -1,-6.5 Q -8,-20 -9,-28" stroke="${p.dk}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M 1,-6.5 Q 8,-20 9,-28" stroke="${p.dk}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <circle cx="-9" cy="-28" r="2.1" fill="${p.w}"/>
    <circle cx="9" cy="-28" r="2.1" fill="${p.w}"/>
  </svg>`
  outer.appendChild(wave)
  return outer
}

export default function App() {
  const [sproutState, setSproutState] = useState(() => {
    const s = getInitialState()
    if (!s.days[TODAY]) s.days[TODAY] = { habit: false, water: 0, sleep: null, mood: null, note: '' }
    s.streak = recalcStreak(s.days, TODAY)
    return s
  })

  const [lang, setLang] = useState(() => sproutState.lang || 'en')
  const [muted, setMuted] = useState(() => sproutState.muted || false)
  const [ambientOn, setAmbientOn] = useState(() => sproutState.ambientOn || false)
  const [userName, setUserName] = useState(() => {
    try { return localStorage.getItem('sprout_name') || '' } catch (e) { return '' }
  })

  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const [milestone, setMilestone] = useState(null)
  const [milestoneShow, setMilestoneShow] = useState(false)
  const [confettiItems, setConfettiItems] = useState([])
  const [surprise, setSurprise] = useState(null)
  const [langDropOpen, setLangDropOpen] = useState(false)

  const bfStageRef = useRef(null)
  const langWrapRef = useRef(null)

  const td = sproutState.days[TODAY] || { habit: false, water: 0, sleep: null, mood: null, note: '' }

  const persist = useCallback(newState => {
    try { localStorage.setItem(SK, JSON.stringify(newState)) } catch (e) {}
  }, [])

  const score = (() => {
    let n = 0
    if (td.habit) n++
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

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (!langWrapRef.current?.contains(e.target)) setLangDropOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // Butterfly timer
  useEffect(() => {
    if (!userName) return
    const spawnBF = () => {
      const stage = bfStageRef.current
      if (!stage) return
      const count = score === 3 ? 2 : 1
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const bf = makeBF()
          bf.style.top = (18 + Math.random() * 40) + 'vh'
          const dur = 22 + Math.random() * 8
          bf.style.animationDuration = dur + 's'
          const wave = bf.querySelector('.bf-wave')
          if (wave) wave.style.animationDuration = (8 + Math.random() * 3).toFixed(1) + 's'
          stage.appendChild(bf)
          setTimeout(() => bf.remove(), (dur + 1) * 1000)
        }, i * 4500)
      }
    }
    const id = setInterval(spawnBF, 60000)
    return () => clearInterval(id)
  }, [userName, score])

  const updateToday = useCallback(updates => {
    setSproutState(prev => {
      const newDays = { ...prev.days, [TODAY]: { ...prev.days[TODAY], ...updates } }
      const newStreak = recalcStreak(newDays, TODAY)
      const next = { ...prev, days: newDays, streak: newStreak }
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

  const handleToggleHabit = useCallback(() => {
    setSproutState(prev => {
      const newHabit = !prev.days[TODAY]?.habit
      if (newHabit && !muted) sndHabit()
      const newDays = { ...prev.days, [TODAY]: { ...prev.days[TODAY], habit: newHabit } }
      const newStreak = recalcStreak(newDays, TODAY)
      let next = { ...prev, days: newDays, streak: newStreak }

      if (newHabit && MS_DATA[newStreak] && !next['ms' + newStreak]) {
        next = { ...next, ['ms' + newStreak]: true }
        const ms = MS_DATA[newStreak]
        setTimeout(() => {
          setMilestone(ms)
          setMilestoneShow(true)
          if (!muted) sndMilestone()
          setTimeout(() => setMilestoneShow(false), 2800)
        }, 500)
      }
      persist(next)
      return next
    })
  }, [muted, persist])

  const handleSaveName = useCallback(name => {
    setSproutState(prev => {
      const next = { ...prev, habitName: name }
      persist(next)
      return next
    })
  }, [persist])

  const handleTapDot = useCallback(i => {
    setSproutState(prev => {
      const curWater = prev.days[TODAY]?.water || 0
      const newWater = curWater > i ? i : i + 1
      const clamped = Math.max(0, Math.min(12, newWater))
      if (clamped > curWater && !muted) sndWater()
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

  const handleSleepChange = useCallback(val => {
    updateToday({ sleep: val })
  }, [updateToday])

  const handleMoodChange = useCallback(val => {
    if (!muted) sndEmoji()
    updateToday({ mood: val })
  }, [muted, updateToday])

  const handleNoteChange = useCallback(val => {
    updateToday({ note: val })
  }, [updateToday])

  const handleSaveDay = useCallback(() => {
    if (!muted) sndSave()
    showToast(TR[lang].toast)
    if (score === 3) {
      launchConfetti()
      setSproutState(prev => {
        if (prev.surpriseDate === TODAY) return prev
        const next = { ...prev, surpriseDate: TODAY }
        persist(next)
        return next
      })
      // Trigger surprise animation outside the state updater to avoid StrictMode double-invoke
      if (sproutState.surpriseDate !== TODAY) {
        const type = SURPRISE_TYPES[Math.floor(Math.random() * 3)]
        setTimeout(() => {
          setSurprise(type)
          setTimeout(() => setSurprise(null), 3700)
        }, 900)
      }
    }
  }, [muted, lang, score, showToast, launchConfetti, persist, sproutState.surpriseDate])

  const handlePlantTap = useCallback(() => {
    if (!muted) sndPlant()
  }, [muted])

  const handleToggleMute = () => {
    const newVal = !muted
    setMuted(newVal)
    setSproutState(prev => {
      const next = { ...prev, muted: newVal }
      persist(next)
      return next
    })
  }

  const handleToggleAmbient = () => {
    const newVal = !ambientOn
    setAmbientOn(newVal)
    if (newVal) startAmbient()
    else stopAmbient()
    setSproutState(prev => {
      const next = { ...prev, ambientOn: newVal }
      persist(next)
      return next
    })
  }

  const handleSetLang = l => {
    setLang(l)
    setLangDropOpen(false)
    setSproutState(prev => {
      const next = { ...prev, lang: l }
      persist(next)
      return next
    })
  }

  const handleWelcomeComplete = name => {
    try { localStorage.setItem('sprout_name', name) } catch (e) {}
    setUserName(name)
  }

  if (!userName) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} lang={lang} />
  }

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const greeting = getGreeting(lang, userName)
  const timeEmoji = getTimeEmoji()

  return (
    <>
      <ForestBackground />
      <div className="app">
        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-icons">
            <button className="mute-btn" onClick={handleToggleMute} aria-label="Toggle tap sounds">
              {muted ? '🔇' : '🔔'}
            </button>
            <button className="mute-btn" onClick={handleToggleAmbient} aria-label="Toggle ambient sound">
              {ambientOn ? '🎵' : '🍃'}
            </button>
          </div>
          <div className="hdr-left">
            <h1>{greeting} {timeEmoji}</h1>
            <div className="hdr-date">{dateStr}</div>
          </div>
          <div className="lang-wrap" ref={langWrapRef}>
            <button
              className="lang-btn"
              onClick={() => setLangDropOpen(o => !o)}
            >
              <span>{FLAGS[lang]}</span>
              <span>{CODES[lang]}</span>
              <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 1 }}>▾</span>
            </button>
            <div className={`lang-drop ${langDropOpen ? 'open' : ''}`}>
              {LANGS.map(l => (
                <button
                  key={l}
                  className={`lang-opt ${l === lang ? 'cur' : ''}`}
                  onClick={() => handleSetLang(l)}
                >
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
        />

        {/* CARDS */}
        <HabitStreak
          habitName={sproutState.habitName}
          streak={sproutState.streak}
          done={td.habit}
          lang={lang}
          onToggle={handleToggleHabit}
          onSaveName={handleSaveName}
        />
        <WaterSleep
          water={td.water || 0}
          sleep={td.sleep}
          lang={lang}
          onTapDot={handleTapDot}
          onAdjWater={handleAdjWater}
          onSleepChange={handleSleepChange}
        />
        <Journal
          mood={td.mood}
          note={td.note}
          lang={lang}
          onMoodChange={handleMoodChange}
          onNoteChange={handleNoteChange}
        />
        <SaveButton lang={lang} onSave={handleSaveDay} />
      </div>

      {/* CONFETTI */}
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

      {/* BUTTERFLIES */}
      <div className="butterfly-stage" ref={bfStageRef} />

      {/* MILESTONE OVERLAY */}
      <div className={`milestone-ov ${milestoneShow ? 'show' : ''}`}>
        <div className="milestone-inner">
          <div className="milestone-emoji">{milestone?.emoji}</div>
          <div className="milestone-text">{milestone?.text}</div>
          <div className="milestone-sub">{milestone?.sub}</div>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${toastShow ? 'show' : ''}`}>{toastMsg}</div>
    </>
  )
}
