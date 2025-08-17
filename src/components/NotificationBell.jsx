import React from 'react'
export default function NotificationBell({ count = 0 }) {
  return (
    <div className="relative">
      <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center">🔔</div>
      {count > 0 && (<span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">{count}</span>)}
    </div>
  )
}
