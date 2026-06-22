import { TR } from '../translations'

export default function WaterSleep({ water, sleep, lang, onTapDot, onAdjWater, onSleepAdj }) {
  const t = TR[lang]

  return (
    <div className="card">
      <div className="card-ttl">{t.wsTtl}</div>
      <div className="ws-grid">
        <div className="ws-sec">
          <div className="ws-hdr">
            <span>💧</span>
            <span>{t.water}</span>
          </div>
          <div className="w-dots">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className={`cup ${i < water ? 'filled' : ''}`}
                onClick={() => onTapDot(i)}
              >
                <div className="cup-body">
                  <div className="cup-liquid" style={{ height: i < water ? '100%' : '0%' }} />
                </div>
                <div className="cup-handle" />
              </div>
            ))}
          </div>
          <div className="w-ctrl">
            <button className="w-btn" onClick={() => onAdjWater(-1)}>−</button>
            <div className="w-num">{water}</div>
            <button className="w-btn" onClick={() => onAdjWater(1)}>+</button>
          </div>
          <div className="w-goal">{t.glass(water)}</div>
        </div>
        <div className="ws-sec">
          <div className="ws-hdr">
            <span>🌙</span>
            <span>{t.sleep}</span>
          </div>
          <div className="w-ctrl">
            <button className="w-btn" onClick={() => onSleepAdj(-0.5)}>−</button>
            <div className="sl-num">{sleep != null ? sleep : '—'}</div>
            <button className="w-btn" onClick={() => onSleepAdj(0.5)}>+</button>
          </div>
          <div className="w-goal">{t.hrs}</div>
        </div>
      </div>
    </div>
  )
}
