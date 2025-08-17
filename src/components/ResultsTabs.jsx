import React from 'react'
export default function ResultsTabs({ tabs = [], current, onChange }) {
  return (
    <div className="flex gap-2 mb-3">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange?.(t.key)} className={`tab ${current === t.key ? 'tab-active' : ''}`}>
          {t.label}{t.badge != null && (<span className="ml-2 badge">{t.badge}</span>)}
        </button>
      ))}
    </div>
  )
}
