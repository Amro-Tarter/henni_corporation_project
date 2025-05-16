import React from 'react'
import { FaFilter, FaTimes } from 'react-icons/fa'

export default function TeamFilters({ regions, expertises, filters, onChange, className = "" }) {
  const hasActiveFilters = filters.region || filters.expertise
  
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center text-gray-500 mr-1">
        <FaFilter className="mr-2" /> 
        <span className="hidden sm:inline">Filters:</span>
      </div>
      
      <div className="flex flex-wrap gap-3 flex-1">
        <select
          value={filters.region}
          onChange={e => onChange({ ...filters, region: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-[150px]"
          aria-label="Filter by region"
        >
          <option value="">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          value={filters.expertise}
          onChange={e => onChange({ ...filters, expertise: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-[150px]"
          aria-label="Filter by expertise"
        >
          <option value="">All Expertise</option>
          {expertises.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>
      
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ region: '', expertise: '' })}
          className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
          aria-label="Clear all filters"
        >
          <FaTimes className="mr-1" />
          <span>Clear</span>
        </button>
      )}
    </div>
  )
}