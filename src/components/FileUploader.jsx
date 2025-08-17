import React from 'react'
export default function FileUploader({ label, onFiles }) {
  const handleChange = (e) => onFiles?.(Array.from(e.target.files || []))
  return (
    <div className="space-y-2">
      <div className="label">{label}</div>
      <input type="file" multiple accept=".csv,.tsv,.txt" onChange={handleChange}
        className="block w-full text-sm text-slate-600
          file:mr-4 file:py-2 file:px-4
          file:rounded-xl file:border-0 file:text-sm file:font-semibold
          file:bg-slate-900 file:text-white hover:file:bg-slate-800" />
      <p className="text-xs text-slate-500">Accepts CSV/TSV (first row as headers).</p>
    </div>
  )
}
