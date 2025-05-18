import React from 'react'
import { motion } from 'framer-motion'

const ProfileCard = ({ 
  photoURL, 
  displayName, 
  bio, 
  region, 
  expertise, 
  role
}) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'mentor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'participant':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'family':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300'
    }
  }

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return 'מנהל'
      case 'mentor':
        return 'מנטור'
      case 'participant':
        return 'משתתף'
      case 'family':
        return 'משפחה'
      default:
        return role
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"
    >
      <div className="relative h-48">
        <img
          src={photoURL}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = `https://ui-avatars.com/api/?name=${displayName}&background=random`
          }}
        />

      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{displayName}</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{bio}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <span className="font-medium ml-2">אזור:</span>
            <span>{region}</span>
          </div>
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <span className="font-medium ml-2">מומחיות:</span>
            <span>{expertise}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProfileCard