import React from 'react'
import { FaSearch, FaUndo } from 'react-icons/fa'

export default function TeamEmptyState({ onReset }) {
  return (
    <div className="py-16 px-4 text-center">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FaSearch className="text-gray-400 text-xl" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">No team members found</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        We couldn't find any team members matching your current filters and search criteria.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FaUndo className="mr-2" />
        Reset filters
      </button>
    </div>
  )
}