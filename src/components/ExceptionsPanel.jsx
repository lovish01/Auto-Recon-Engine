import React from 'react'
export default function ExceptionsPanel({ exceptions = [], onResolve }) {
  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-semibold">Exceptions</h3>
      {exceptions.length === 0 ? (
        <div className="text-sm text-slate-500">No exceptions 🎉</div>
      ) : (
        <div className="space-y-3">
          {exceptions.map((ex, idx) => (
            <div key={idx} className="border rounded-xl p-3">
              <div className="text-sm text-slate-600 mb-2">{ex.reason}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium mb-1">Source 1</div>
                  <pre className="bg-slate-50 rounded-lg p-2 overflow-auto text-xs">{JSON.stringify(ex.left, null, 2)}</pre>
                </div>
                <div>
                  <div className="font-medium mb-1">Candidate(s) from Source 2</div>
                  <pre className="bg-slate-50 rounded-lg p-2 overflow-auto text-xs">{JSON.stringify(ex.rights, null, 2)}</pre>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="btn btn-primary" onClick={() => onResolve?.(idx)}>Mark Resolved</button>
                <button className="btn btn-outline">Ignore</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
