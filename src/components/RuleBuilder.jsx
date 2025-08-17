import React from 'react'

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
]

export default function RuleBuilder({ availableFields = [], value, onChange }) {
  const { keys = [], amountTolerance = 0, amountField = 'amount', fuzzyField=null, fuzzyThreshold=0.9, groupBy=[] } = value || {}
  const update = (patch) => onChange?.({ ...value, ...patch })
  const addKey = () => update({ keys: [...keys, { field: availableFields[0] || '', type: 'text' }] })
  const rmKey = (i) => update({ keys: keys.filter((_, idx) => idx !== i) })
  const setKey = (i, patch) => update({ keys: keys.map((k, idx) => idx === i ? { ...k, ...patch } : k) })

  return (
    <div className="space-y-4">
      <div>
        <div className="label">Matching Keys</div>
        <div className="text-xs text-slate-500 mb-2">Records are matched when all key parts match.</div>
        <div className="space-y-2">
          {keys.map((k, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <select className="input col-span-6" value={k.field} onChange={e => setKey(i, { field: e.target.value })}>
                {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select className="input col-span-4" value={k.type} onChange={e => setKey(i, { type: e.target.value })}>
                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <button className="btn btn-outline col-span-2" onClick={() => rmKey(i)}>Remove</button>
            </div>
          ))}
          <button className="btn btn-outline" onClick={addKey}>Add Key</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <div className="label">Amount Field</div>
          <input className="input" value={amountField} onChange={e => update({ amountField: e.target.value })} />
          <div className="text-xs text-slate-500 mt-1">Name of the amount column.</div>
        </div>
        <div>
          <div className="label">Amount Tolerance</div>
          <input type="number" className="input" value={amountTolerance} onChange={e => update({ amountTolerance: Number(e.target.value) })} />
          <div className="text-xs text-slate-500 mt-1">Allowed difference between amounts.</div>
        </div>
        <div>
          <div className="label">Fuzzy Match Field (optional)</div>
          <select className="input" value={fuzzyField || ''} onChange={e => update({ fuzzyField: e.target.value || null })}>
            <option value="">(disabled)</option>
            {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <div className="text-xs text-slate-500 mt-1">Uses similarity when no exact key match found.</div>
        </div>
        <div>
          <div className="label">Fuzzy Threshold</div>
          <input type="number" step="0.05" min="0" max="1" className="input" value={fuzzyThreshold}
            onChange={e => update({ fuzzyThreshold: Number(e.target.value) })} />
        </div>
        <div className="md:col-span-2">
          <div className="label">Group By (optional)</div>
          <select multiple className="input h-28" value={groupBy} onChange={e => update({ groupBy: Array.from(e.target.selectedOptions).map(o => o.value) })}>
            {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <div className="text-xs text-slate-500 mt-1">Adds group-level sum comparison report.</div>
        </div>
      </div>
    </div>
  )
}
