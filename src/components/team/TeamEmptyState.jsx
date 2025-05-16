import React from 'react'
import { FaSearch, FaUndo } from 'react-icons/fa'

export default function TeamEmptyState({ onReset }) {
  return (
    <div className="py-16 px-4 text-center">
      <div className="mx-auto w-16 h-16 bg-element-soft rounded-full flex items-center justify-center mb-4">
        <FaSearch className="text-element/60 text-xl" />
      </div>
      <h3 className="text-xl font-medium text-foreground mb-2">לא נמצאו חברי צוות</h3>
      <p className="text-foreground/80 mb-6 max-w-md mx-auto">
        לא הצלחנו למצוא חברי צוות התואמים את המסננים וקריטריוני החיפוש הנוכחיים שלך.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-element hover:bg-element-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-element"
      >
        <FaUndo className="ml-2" />
        אפס מסננים
      </button>
    </div>
  )
}