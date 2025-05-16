import React from 'react'
import { FaFilter, FaTimes } from 'react-icons/fa'

export default function TeamFilters({ regions, expertises, filters, onChange, className = "" }) {
  const hasActiveFilters = filters.region || filters.expertise
  
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center text-element/80 mr-1">
        <FaFilter className="ml-2" /> 
        <span className="hidden sm:inline">סינון:</span>
      </div>
      
      <div className="flex flex-wrap gap-3 flex-1">
        <select
          value={filters.region}
          onChange={e => onChange({ ...filters, region: e.target.value })}
          className="border border-element/20 rounded-lg px-3 py-2 text-foreground bg-element-soft focus:ring-2 focus:ring-element focus:border-element flex-1 min-w-[150px]"
          aria-label="סינון לפי אזור"
          dir="rtl"
        >
          <option value="">כל האזורים</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          value={filters.expertise}
          onChange={e => onChange({ ...filters, expertise: e.target.value })}
          className="border border-element/20 rounded-lg px-3 py-2 text-foreground bg-element-soft focus:ring-2 focus:ring-element focus:border-element flex-1 min-w-[150px]"
          aria-label="סינון לפי מומחיות"
          dir="rtl"
        >
          <option value="">כל המומחיות</option>
          {expertises.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>
      
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ region: '', expertise: '' })}
          className="flex items-center text-sm text-element/80 hover:text-element transition-colors"
          aria-label="נקה את כל המסננים"
        >
          <FaTimes className="ml-1" />
          <span>נקה</span>
        </button>
      )}
    </div>
  )
}