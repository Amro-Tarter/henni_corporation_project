import React from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, Mail, Crown } from 'lucide-react'

const RoleSection = ({ role, members, onEdit, onDelete, sectionInView, cardProps = {} }) => {

  if (!members.length) return null
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }
  
  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      } 
    }
  }

  const getGridLayout = (memberCount) => {
    if (memberCount === 1) return "grid-cols-1 max-w-2xl mx-auto"
    if (memberCount === 2) return "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto"
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  }

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div 
        className={`grid gap-8 ${getGridLayout(members.length)}`}
        variants={container}
      >
        {members.map((member, index) => (
          <motion.div
            key={member.id || index}
            variants={item}
            whileHover={{ 
              y: -4, 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="group relative"
          >
            {/* Main Profile Container */}
            <div className={`relative p-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${cardProps.className || 'bg-white/70 backdrop-blur-lg border border-gray-200/50'}`}>
              
              {/* Action Buttons */}
              {(onEdit || onDelete) && (
                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(member)}
                      className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg"
                      aria-label="עריכה"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(member)}
                      className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-red-50 transition-all duration-200 shadow-md hover:shadow-lg"
                      aria-label="מחיקה"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  )}
                </div>
              )}

              {/* Profile Section */}
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Profile Image with Status */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white/50">
                    <img
                      src={member.photoURL || '/default_user_pic.jpg'}
                      alt={member.username || member.displayName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = '/default_user_pic.jpg'
                      }}
                    />
                  </div>
                  {/* Status indicator for CEO */}
                  {(role === 'ceo' || role === 'מנהל') && (
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg ring-3 ring-white">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Name and Title */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {member.username || member.displayName}
                  </h3>
                  
                  {/* Role/Position */}
                  {member.in_role && (
                    <p className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {member.in_role}
                    </p>
                  )}
                </div>

                {/* Mentor Name - Prominently Displayed */}
                {member.mentorName && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 w-full">
                    <div className="flex items-center justify-center gap-2 text-purple-700">
                      <span className="font-semibold">מנטור:</span>
                      <span className="font-bold text-purple-800">{member.mentorName}</span>
                    </div>
                  </div>
                )}

                {/* Email */}
                {member.email && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 w-full">
                    <Mail className="w-4 h-4" />
                    <a 
                      href={`mailto:${member.email}`}
                      className="hover:text-blue-600 transition-colors duration-200 truncate"
                    >
                      {member.email}
                    </a>
                  </div>
                )}

                {/* Bio Section */}
                {member.bio && (
                  <div className="border-t border-gray-100 pt-4 w-full">
                    <p className="text-gray-700 text-sm leading-relaxed text-center">
                      {member.bio}
                    </p>
                  </div>
                )}

                {/* Specialties for Staff */}
                {(role === 'staff' || role === 'צוות') && member.specialties && (
                  <div className="w-full">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">התמחויות:</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.specialties.map((specialty, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200 font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Section Summary */}
      <motion.div 
        className="text-center pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Optional section summary content can go here */}
      </motion.div>
    </motion.div>
  )
}

export default RoleSection