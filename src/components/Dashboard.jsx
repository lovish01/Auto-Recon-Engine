import React from 'react'
export default function Dashboard({ summary, groupSummary=[] }) {
  const cards = [
    { label: 'Source 1 Rows', value: summary?.total1 ?? 0 },
    { label: 'Source 2 Rows', value: summary?.total2 ?? 0 },
    { label: 'Matched', value: summary?.matched ?? 0 },
    { label: 'Exceptions', value: summary?.exceptions ?? 0 },
    { label: 'Unmatched (S1)', value: summary?.unmatched1 ?? 0 },
    { label: 'Unmatched (S2)', value: summary?.unmatched2 ?? 0 },
    { label: 'Match Rate', value: (summary?.matchRate ?? 0) + '%' },
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {cards.map((c, i) => (
          <div key={i} className="card p-4">
            <div className="text-xs text-slate-500">{c.label}</div>
            <div className="text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>
      {groupSummary.length > 0 && (
        <div className="card p-4">
          <div className="font-semibold mb-2">Group-Level Summary</div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-3 py-2">Group Key</th>
                  <th className="text-left px-3 py-2">Sum S1</th>
                  <th className="text-left px-3 py-2">Sum S2</th>
                  <th className="text-left px-3 py-2">Diff</th>
                  <th className="text-left px-3 py-2">Within Tolerance</th>
                </tr>
              </thead>
              <tbody>
                {groupSummary.map((g, i) => (
                  <tr key={i} className="odd:bg-white even:bg-slate-50">
                    <td className="px-3 py-2 border-t">{g.groupKey}</td>
                    <td className="px-3 py-2 border-t">{g.sumSource1}</td>
                    <td className="px-3 py-2 border-t">{g.sumSource2}</td>
                    <td className="px-3 py-2 border-t">{g.difference}</td>
                    <td className="px-3 py-2 border-t">{g.withinTolerance ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
