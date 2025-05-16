import React from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaUndo } from 'react-icons/fa'

export default function TeamEmptyState({ onReset }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-16 px-4 text-center bg-white rounded-2xl shadow-md"
      dir="rtl"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-auto w-20 h-20 bg-element-soft rounded-full flex items-center justify-center mb-6"
      >
        <FaSearch className="text-element/60 text-2xl" />
      </motion.div>
      
      <h3 className="text-2xl font-medium text-foreground mb-3">לא נמצאו חברי צוות</h3>
      
      <p className="text-foreground/80 mb-8 max-w-md mx-auto">
        לא הצלחנו למצוא חברי צוות התואמים את המסננים וקריטריוני החיפוש הנוכחיים שלך. 
        נסה לשנות את המסננים או לאפס אותם.
      </p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-element hover:bg-element-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-element transition-colors"
      >
        <FaUndo className="ml-2" />
        אפס מסננים
      </motion.button>
    </motion.div>
  )
}