import React from 'react'
export default function Onboarding({ onClose }) {
  const steps = [
    { title: 'Upload Files', desc: 'Upload one or more CSV files for Source 1 and Source 2. The first row should contain headers.' },
    { title: 'Configure Rules', desc: 'Choose matching keys, set amount field and tolerance. Optionally enable fuzzy matching and group-by.' },
    { title: 'Run & Review', desc: 'Matched, unmatched, and exceptions will appear. Export results as CSV/JSON.' },
  ]
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Welcome to the Reconciliation Engine</h2>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="border rounded-xl p-3">
              <div className="font-medium">{i+1}. {s.title}</div>
              <div className="text-sm text-slate-600">{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button className="btn btn-outline" onClick={onClose}>Got it</button>
          <a href="/samples/source1.csv" className="btn btn-outline" download>Download Sample S1</a>
          <a href="/samples/source2.csv" className="btn btn-outline" download>Download Sample S2</a>
        </div>
      </div>
    </div>
  )
}
