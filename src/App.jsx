import React, { useMemo, useState } from 'react'
import Papa from 'papaparse'
import FileUploader from './components/FileUploader.jsx'
import RuleBuilder from './components/RuleBuilder.jsx'
import DataTable from './components/DataTable.jsx'
import ResultsTabs from './components/ResultsTabs.jsx'
import ExceptionsPanel from './components/ExceptionsPanel.jsx'
import Dashboard from './components/Dashboard.jsx'
import NotificationBell from './components/NotificationBell.jsx'
import Onboarding from './components/Onboarding.jsx'
import { reconcile } from './utils/reconcile.js'

function useCSVFiles(files) {
  const [rows, setRows] = useState([])
  React.useEffect(() => {
    let active = true
    if (!files || files.length === 0) { setRows([]); return }
    const promises = files.map(file => new Promise((resolve) => {
      Papa.parse(file, { header: true, skipEmptyLines: true, complete: (res) => resolve(res.data) })
    }))
    Promise.all(promises).then(parts => { if (active) setRows(parts.flat()) })
    return () => { active = false }
  }, [files])
  return rows
}

async function fetchCSV(url){
  const text = await (await fetch(url)).text()
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
  return parsed.data
}

export default function App() {
  const [files1, setFiles1] = useState([])
  const [files2, setFiles2] = useState([])
  const [rules, setRules] = useState({ keys: [], amountTolerance: 0, amountField: 'amount', fuzzyField: null, fuzzyThreshold: 0.9, groupBy: [] })
  const [tab, setTab] = useState('matched')
  const [exceptions, setExceptions] = useState([])
  const [exporting, setExporting] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [sample1, setSample1] = useState([])
  const [sample2, setSample2] = useState([])

  const rows1 = useCSVFiles(files1.length ? files1 : sample1.length ? [new File([Papa.unparse(sample1)], 's1.csv', {type:'text/csv'})] : [])
  const rows2 = useCSVFiles(files2.length ? files2 : sample2.length ? [new File([Papa.unparse(sample2)], 's2.csv', {type:'text/csv'})] : [])

  const availableFields = useMemo(() => {
    const first = rows1[0] || rows2[0] || {}
    return Object.keys(first)
  }, [rows1, rows2])

  const result = useMemo(() => reconcile(rows1, rows2, rules), [rows1, rows2, rules])
  React.useEffect(() => setExceptions(result.exceptions), [result.exceptions])

  const currentRows = tab === 'matched'
    ? result.matched.map(m => ({ ...m.left, __MATCHED_WITH__: JSON.stringify(m.right), __VIA__: m.via }))
    : tab === 'unmatched1'
      ? result.unmatched1.map(u => u.row)
      : tab === 'unmatched2'
        ? result.unmatched2.map(u => u.row)
        : []

  const headerCols = currentRows[0] ? Object.keys(currentRows[0]) : ['—']

  const loadSamples = async () => {
    const [s1, s2] = await Promise.all([fetchCSV('/samples/source1.csv'), fetchCSV('/samples/source2.csv')])
    setSample1(s1); setSample2(s2); setShowOnboarding(false)
  }

  const exportCSV = () => {
    setExporting(true)
    const makeCSV = (rows) => Papa.unparse(rows)
    const files = [
      { name: 'matched.csv', rows: result.matched.map(m => ({...m.left, __MATCHED_WITH__: JSON.stringify(m.right), __VIA__: m.via})) },
      { name: 'unmatched_source1.csv', rows: result.unmatched1.map(u => u.row) },
      { name: 'unmatched_source2.csv', rows: result.unmatched2.map(u => u.row) },
      { name: 'exceptions.json', rows: result.exceptions },
      { name: 'groupSummary.csv', rows: result.groupSummary || [] },
      { name: 'summary.json', rows: [result.summary] },
    ]
    files.forEach(f => {
      const blob = new Blob([f.name.endsWith('.csv') ? makeCSV(f.rows) : JSON.stringify(f.rows, null, 2)], { type: 'text/plain;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = f.name; a.click(); URL.revokeObjectURL(a.href)
    })
    setExporting(false)
  }

  const markResolved = (idx) => {
    const next = [...exceptions]; next.splice(idx,1); setExceptions(next)
  }

  const tabs = [
    { key: 'matched', label: 'Matched', badge: result.matched.length },
    { key: 'unmatched1', label: 'Unmatched (S1)', badge: result.unmatched1.length },
    { key: 'unmatched2', label: 'Unmatched (S2)', badge: result.unmatched2.length },
    { key: 'exceptions', label: 'Exceptions', badge: exceptions.length },
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reconciliation Engine</h1>
          <p className="text-slate-500">Upload multiple files per source, configure rules, run reconciliation, export results.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline" onClick={loadSamples}>Load Sample Data</button>
          <NotificationBell count={exceptions.length} />
        </div>
      </header>

      <Dashboard summary={result.summary} groupSummary={result.groupSummary} />

      <section className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Source 1</h3>
          <FileUploader label="Upload files for Source 1" onFiles={setFiles1} />
          <div className="text-xs text-slate-500 mt-2">{rows1.length} rows loaded</div>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Source 2</h3>
          <FileUploader label="Upload files for Source 2" onFiles={setFiles2} />
          <div className="text-xs text-slate-500 mt-2">{rows2.length} rows loaded</div>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="font-semibold mb-3">Matching Rules</h3>
        <RuleBuilder availableFields={availableFields} value={rules} onChange={setRules} />
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Results</h3>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={exportCSV} disabled={exporting}>{exporting ? 'Exporting…' : 'Export CSV/JSON'}</button>
          </div>
        </div>

        <ResultsTabs tabs={tabs} current={tab} onChange={setTab} />

        {tab === 'exceptions' ? (
          <ExceptionsPanel exceptions={exceptions} onResolve={markResolved} />
        ) : (
          <DataTable rows={currentRows} columns={headerCols} title={
            tab === 'matched' ? 'Matched Pairs (left + __MATCHED_WITH__ right)' :
            tab === 'unmatched1' ? 'Unmatched from Source 1' : 'Unmatched from Source 2'
          } />
        )}
      </section>

      <footer className="text-xs text-slate-500 text-center py-6">
        Prototype UI – ready to hook up to backend for server-side reconciliation, persistence, and auth.
      </footer>
    </div>
  )
}
