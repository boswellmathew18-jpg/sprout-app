import PlantSvg from './PlantSvg'
import { TR } from '../translations'

function MossyStone() {
  return (
    <svg width="130" height="46" viewBox="0 0 130 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sglow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#50c878" stopOpacity="0.30"/>
          <stop offset="100%" stopColor="#50c878" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="sfill" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#2e4e30"/>
          <stop offset="55%" stopColor="#1c3220"/>
          <stop offset="100%" stopColor="#10200e"/>
        </radialGradient>
      </defs>
      <ellipse cx="65" cy="40" rx="62" ry="14" fill="url(#sglow)"/>
      <ellipse cx="65" cy="26" rx="48" ry="17" fill="url(#sfill)"/>
      <ellipse cx="37" cy="20" rx="14" ry="5.5" fill="#2a5a2c" opacity="0.85"/>
      <ellipse cx="76" cy="17" rx="11" ry="4.5" fill="#306432" opacity="0.75"/>
      <ellipse cx="56" cy="23" rx="9" ry="3.5" fill="#346634" opacity="0.65"/>
      <ellipse cx="92" cy="22" rx="8" ry="3.5" fill="#2c5c2e" opacity="0.70"/>
      <path d="M26 24 Q42 16 58 21" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function LadybugSvg() {
  return (
    <div className="lb-wrap">
      <svg width="22" height="20" viewBox="0 0 22 20">
        <ellipse cx="11" cy="13" rx="9" ry="7" fill="#e02828" />
        <circle cx="11" cy="7" r="6" fill="#111" />
        <line x1="11" y1="7" x2="11" y2="20" stroke="#111" strokeWidth="1.2" />
        <circle cx="6" cy="14" r="2.2" fill="#111" />
        <circle cx="16" cy="14" r="2.2" fill="#111" />
        <circle cx="8" cy="10" r="1.6" fill="#111" />
        <circle cx="14" cy="10" r="1.6" fill="#111" />
      </svg>
    </div>
  )
}

function RainbowSvg() {
  return (
    <div className="rb-wrap">
      <svg width="220" height="110" viewBox="0 0 220 110">
        <path d="M8 105 Q110 8 212 105" fill="none" stroke="#ff6b6b" strokeWidth="6" opacity="0.65" />
        <path d="M18 105 Q110 24 202 105" fill="none" stroke="#ffd166" strokeWidth="6" opacity="0.65" />
        <path d="M28 105 Q110 40 192 105" fill="none" stroke="#7dd87a" strokeWidth="6" opacity="0.65" />
        <path d="M38 105 Q110 56 182 105" fill="none" stroke="#5bb8e8" strokeWidth="6" opacity="0.65" />
        <path d="M48 105 Q110 72 172 105" fill="none" stroke="#b08ee8" strokeWidth="6" opacity="0.65" />
      </svg>
    </div>
  )
}

function SunSvg() {
  return (
    <div className="sun-wrap">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="12" fill="#ffd166" />
        <g stroke="#ffd166" strokeWidth="2.5" strokeLinecap="round">
          <line x1="26" y1="6" x2="26" y2="13" />
          <line x1="26" y1="39" x2="26" y2="46" />
          <line x1="6" y1="26" x2="13" y2="26" />
          <line x1="39" y1="26" x2="46" y2="26" />
          <line x1="11" y1="11" x2="16" y2="16" />
          <line x1="36" y1="36" x2="41" y2="41" />
          <line x1="41" y1="11" x2="36" y2="16" />
          <line x1="16" y1="36" x2="11" y2="41" />
        </g>
      </svg>
    </div>
  )
}

export default function PlantDisplay({ score, week, lang, onTap, surprise, isBreathing, goldGlow }) {
  const t = TR[lang]

  return (
    <div className="plant-area">
      <div className="mossy-stone-wrap">
        <MossyStone />
      </div>
      <PlantSvg score={score} week={week} onTap={onTap} isBreathing={isBreathing} goldGlow={goldGlow} />
      <div className="plant-lbl">{t.pLbl[score]}</div>
      <div className="week-badge">Week {week}</div>
      <div className="surprise-container">
        {surprise === 'ladybug' && <LadybugSvg />}
        {surprise === 'rainbow' && <RainbowSvg />}
        {surprise === 'sun' && <SunSvg />}
      </div>
    </div>
  )
}
