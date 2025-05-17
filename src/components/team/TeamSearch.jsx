import React from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaTimes } from 'react-icons/fa'

export default function TeamSearch({ value, onChange, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
        <FaSearch className="text-element/60" />
      </div>
      
      <motion.input
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="חיפוש חברי צוות..."
        className="w-full pr-12 pl-10 py-3 border border-element/20 rounded-lg focus:ring-2 focus:ring-element focus:border-element bg-element-soft text-foreground placeholder:text-foreground/60 shadow-sm"
        dir="rtl"
      />
      
      {value && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange('')}
          className="absolute inset-y-0 left-0 pl-3 flex items-center text-element/60 hover:text-element transition-colors"
          aria-label="נקה חיפוש"
        >
          <FaTimes />
        </motion.button>
      )}
    </div>
  )
}