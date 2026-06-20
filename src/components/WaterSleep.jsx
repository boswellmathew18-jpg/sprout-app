import { TR } from '../translations'

export default function WaterSleep({ water, sleep, lang, onTapDot, onAdjWater, onSleepChange }) {
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
          <div className="sl-big">
            <input
              className="sl-inp"
              type="number"
              min="0"
              max="24"
              step="0.5"
              placeholder="—"
              value={sleep != null ? sleep : ''}
              onChange={e => {
                const v = parseFloat(e.target.value)
                onSleepChange(isNaN(v) ? null : Math.max(0, Math.min(24, v)))
              }}
            />
            <span className="sl-unit">{t.hrs}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
