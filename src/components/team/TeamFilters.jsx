import React from 'react'
import { motion } from 'framer-motion'
import { FaFilter, FaTimes } from 'react-icons/fa'

export default function TeamFilters({ regions, expertises, locations, filters, onChange, className = "" }) {
  const hasActiveFilters = filters.region || filters.expertise || filters.location
  
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`} dir="rtl">
      <div className="flex items-center text-element/80 ml-2">
        <FaFilter className="ml-2" /> 
        <span className="hidden sm:inline font-medium">סינון:</span>
      </div>
      
      <div className="flex flex-wrap gap-3 flex-1">
        <motion.select
          whileTap={{ scale: 0.98 }}
          value={filters.expertise}
          onChange={e => onChange({ ...filters, expertise: e.target.value })}
          className="border border-element/20 rounded-lg px-4 py-2 text-foreground bg-element-soft focus:ring-2 focus:ring-element focus:border-element flex-1 min-w-[150px] shadow-sm appearance-none"
          aria-label="סינון לפי מומחיות"
          dir="rtl"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
            backgroundPosition: "left 0.5rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.5em 1.5em",
            paddingLeft: "2.5rem"
          }}
        >
          <option value="">כל המומחיות</option>
          {expertises.map(x => <option key={x} value={x}>{x}</option>)}
        </motion.select>

        <motion.select
          whileTap={{ scale: 0.98 }}
          value={filters.location}
          onChange={e => onChange({ ...filters, location: e.target.value })}
          className="border border-element/20 rounded-lg px-4 py-2 text-foreground bg-element-soft focus:ring-2 focus:ring-element focus:border-element flex-1 min-w-[150px] shadow-sm appearance-none"
          aria-label="סינון לפי מיקום"
          dir="rtl"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
            backgroundPosition: "left 0.5rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.5em 1.5em",
            paddingLeft: "2.5rem"
          }}
        >
          <option value="">כל המיקומים</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </motion.select>
      </div>
      
      {hasActiveFilters && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange({ region: '', expertise: '', location: '' })}
          className="flex items-center text-sm px-3 py-1 bg-element-soft hover:bg-element-soft/80 text-element rounded-lg transition-colors"
          aria-label="נקה את כל המסננים"
        >
          <FaTimes className="ml-1" />
          <span>נקה מסננים</span>
        </motion.button>
      )}
    </div>
  )
}