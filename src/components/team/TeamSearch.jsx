import React from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'

export default function TeamSearch({ value, onChange, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <FaSearch className="text-element/60" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="חיפוש חברי צוות..."
        className="w-full pr-10 pl-4 py-2 border border-element/20 rounded-lg focus:ring-2 focus:ring-element focus:border-element bg-element-soft text-foreground placeholder:text-foreground/60"
        dir="rtl"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 left-0 pl-3 flex items-center text-element/60 hover:text-element"
          aria-label="נקה חיפוש"
        >
          <FaTimes />
        </button>
      )}
    </div>
  )
}