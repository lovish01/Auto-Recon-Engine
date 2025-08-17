import React from 'react'
export default function DataTable({ rows = [], columns = [], title, actions }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex gap-2">{actions}</div>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              {columns.map(col => (<th key={col} className="text-left px-3 py-2 font-medium text-slate-600">{col}</th>))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-slate-500">No rows</td></tr>
            ) : rows.map((row, i) => (
              <tr key={i} className="odd:bg-white even:bg-slate-50">
                {columns.map(col => (<td key={col} className="px-3 py-2 border-t">{String(row[col] ?? '')}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
