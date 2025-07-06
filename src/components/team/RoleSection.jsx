import React, { useState, useCallback, useMemo } from 'react'
import { Edit2, Trash2, Mail, Crown, User, Award, Briefcase, Heart, Star, MapPin, Phone, Globe, Calendar, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion' // Make sure to import motion if you're using it here directly

const RoleSection = ({
  role,
  members,
  onEdit,
  onDelete,
  cardProps = {},
  compactMode = false
}) => {
  const [searchTerm] = useState('')
  const [sortBy] = useState('name')
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [filterBy] = useState('all')

  // Filter and search logic
  const filteredMembers = useMemo(() => {
    if (!members?.length) return []

    return members
      .filter(member => {
        const matchesSearch = !searchTerm ||
          (member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.mentorName?.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesFilter = filterBy === 'all' ||
          (filterBy === 'has-mentor' && member.mentorName) ||
          (filterBy === 'no-mentor' && !member.mentorName) ||
          (filterBy === 'has-bio' && member.bio) ||
          (filterBy === 'has-specialties' && member.specialties?.length)

        return matchesSearch && matchesFilter
      })
      .sort((a, b) => {
        // ✅ Move CEO to top
        const aIsCeo = /(ceo|מנכ״ל|מנכ״לית)/i.test(a.in_role || "")
        const bIsCeo = /(ceo|מנכ״ל|מנכ״לית)/i.test(b.in_role || "")
        if (aIsCeo && !bIsCeo) return -1
        if (!aIsCeo && bIsCeo) return 1

        // fallback to current sorting logic
        switch (sortBy) {
          case 'name':
            return (a.username || a.displayName || '').localeCompare(b.username || b.displayName || '')
          case 'role':
            return (a.in_role || '').localeCompare(b.in_role || '')
          case 'mentor':
            return (a.mentorName || '').localeCompare(b.mentorName || '')
          default:
            return 0
        }
      })
  }, [members, searchTerm, sortBy, filterBy])

  const toggleExpanded = useCallback((memberId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(memberId)) {
        newSet.delete(memberId)
      } else {
        newSet.add(memberId)
      }
      return newSet
    })
  }, [])

  // Stats calculation (not directly used in current output but good to keep)
  const stats = useMemo(() => {
    if (!members?.length) return null

    const totalMembers = members.length
    const withMentors = members.filter(m => m.mentorName).length
    const withBios = members.filter(m => m.bio).length
    const withSpecialties = members.filter(m => m.specialties?.length).length

    return {
      total: totalMembers,
      withMentors,
      withBios,
      withSpecialties,
      mentorPercentage: Math.round((withMentors / totalMembers) * 100)
    }
  }, [members])

  if (!members?.length) return null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 120,
        damping: 12
      }
    }
  }

  const getGridLayout = (memberCount) => {
    if (compactMode) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    if (memberCount === 1) return "grid-cols-1 max-w-2xl mx-auto"
    if (memberCount === 2) return "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto"
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" // Main grid for staff/mentors
  }

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'ceo':
      case 'מנהל':
        return <Crown className="w-5 h-5" />
      case 'staff':
      case 'צוות':
        return <Briefcase className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'ceo':
      case 'מנכ״ל': // Added Hebrew for CEO as per original logic
      case 'מנכ״לית':
        return 'from-amber-400 to-orange-500'
      case 'staff':
      case 'צוות':
        return 'from-blue-400 to-indigo-500'
      case 'mentor': // Added mentor role for specific color
      case 'מנטור':
        return 'from-emerald-400 to-green-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Members Grid */}
      <motion.div // Added motion to this div for initial animation
        className="space-y-8"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <div
          className={`grid gap-6 ${getGridLayout(filteredMembers.length)}`}
        >
          {filteredMembers.map((member, index) => {
            const memberId = member.id || index
            const isExpanded = expandedCards.has(memberId)
            // Determine if there's enough content to warrant an expand button
            const hasExpandableContent = member.bio || (member.specialties?.length > 3)

            return (
              <motion.div // motion.div for individual cards
                key={memberId}
                variants={item}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group relative"
              >
                {/* Main Profile Container */}
                <div className={`relative p-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border-2 hover:border-blue-200 ${cardProps.className || 'bg-white/80 backdrop-blur-lg border-gray-200/50'}`}>

                  {/* Action Buttons */}
                  {(onEdit || onDelete) && (
                    <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(member)}
                          className="bg-white/95 backdrop-blur-sm rounded-full p-2.5 hover:bg-blue-50 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl"
                          aria-label="עריכה"
                        >
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(member)}
                          className="bg-white/95 backdrop-blur-sm rounded-full p-2.5 hover:bg-red-50 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl"
                          aria-label="מחיקה"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Profile Section */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Profile Image with Enhanced Status - **BIGGER IMAGE HERE** */}
                    <div className="relative">
                      {/* Increased size from w-28 h-28 to w-36 h-36 */}
                      <div className="w-36 h-36 rounded-full overflow-hidden shadow-xl bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white/60 hover:ring-blue-200 transition-all duration-300">
                        <img
                          src={member.photoURL || '/default_user_pic.jpg'}
                          alt={member.username || member.displayName}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 filter hover:brightness-110"
                          onError={(e) => {
                            e.target.src = '/default_user_pic.jpg'
                          }}
                        />
                      </div>

                      {/* Enhanced Status indicator */}
                      {(member.in_role?.toLowerCase() === 'ceo' || member.in_role?.toLowerCase() === 'מנכ״ל' || member.in_role?.toLowerCase() === 'מנכ״לית') && (
                        <div className={`absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r ${getRoleColor('ceo')} rounded-full flex items-center justify-center shadow-lg ring-4 ring-white animate-pulse`}>
                          <Crown className="w-5 h-5 text-white" /> {/* Slightly larger icon */}
                        </div>
                      )}
                      {member.role?.toLowerCase() === 'mentor' && (
                        <div className={`absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r ${getRoleColor('mentor')} rounded-full flex items-center justify-center shadow-lg ring-4 ring-white animate-pulse`}>
                          <Heart className="w-5 h-5 text-white" /> {/* Slightly larger icon */}
                        </div>
                      )}
                    </div>

                    {/* Name and Title */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"> {/* Increased font size */}
                        {member.username || member.displayName}
                      </h3>

                      {/* Role/Position with icon */}
                      {member.in_role && (
                        <div className="flex items-center justify-center gap-2">
                          {getRoleIcon(member.in_role)} {/* Pass member.in_role for specific icon */}
                          <p className={`text-base font-medium px-4 py-2 rounded-full bg-gradient-to-r ${getRoleColor(member.in_role)} text-white shadow-md`}> {/* Increased font size */}
                            {member.in_role}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Mentor Name  */}
                    {member.mentorName && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 w-full shadow-sm">
                        <div className="flex items-center justify-center gap-2 text-purple-700">
                          <Heart className="w-5 h-5 text-pink-500" /> {/* Slightly larger icon */}
                          <span className="font-bold text-purple-800 bg-white/50 px-2 py-1 rounded-lg text-lg"> {/* Increased font size */}
                            {member.mentorName}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div className="w-full space-y-2">
                      {member.email && (
                        <div className="flex items-center justify-center gap-2 text-base text-gray-600 bg-gray-50 hover:bg-blue-50 rounded-lg px-3 py-2 w-full transition-colors duration-200 group/email"> {/* Increased text size */}
                          <Mail className="w-5 h-5 group-hover/email:text-blue-600" /> {/* Slightly larger icon */}
                          <a
                            href={`mailto:${member.email}`}
                            className="hover:text-blue-600 transition-colors duration-200 truncate font-medium"
                          >
                            {member.email}
                          </a>
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover/email:opacity-100 transition-opacity" /> {/* Slightly larger icon */}
                        </div>
                      )}
                      {member.phone && ( // Added phone number display
                        <div className="flex items-center justify-center gap-2 text-base text-gray-600 bg-gray-50 hover:bg-blue-50 rounded-lg px-3 py-2 w-full transition-colors duration-200 group/phone">
                          <Phone className="w-5 h-5 group-hover/phone:text-blue-600" />
                          <a
                            href={`tel:${member.phone}`}
                            className="hover:text-blue-600 transition-colors duration-200 truncate font-medium"
                          >
                            {member.phone}
                          </a>
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover/phone:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>

                    {/* Bio Section - Expandable */}
                    {member.bio && (
                      <div className="border-t border-gray-100 pt-4 w-full">
                        <p className={`text-gray-700 text-base leading-relaxed text-center transition-all duration-300 ${ // Increased text size
                          isExpanded ? '' : 'line-clamp-3'
                        }`}>
                          {member.bio}
                        </p>
                        {hasExpandableContent && (
                          <button
                            onClick={() => toggleExpanded(memberId)}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mx-auto transition-colors duration-200" // Increased text size
                          >
                            {isExpanded ? (
                              <>
                                הצג פחות <ChevronUp className="w-4 h-4" /> {/* Slightly larger icon */}
                              </>
                            ) : (
                              <>
                                הצג עוד <ChevronDown className="w-4 h-4" /> {/* Slightly larger icon */}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Enhanced Specialties for Staff */}
                    {(role === 'staff' || role === 'צוות') && member.specialties && (
                      <div className="w-full">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Award className="w-5 h-5 text-blue-600" /> {/* Slightly larger icon */}
                          <h4 className="text-lg font-semibold text-gray-800">התמחויות:</h4> {/* Increased font size */}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {(isExpanded ? member.specialties : member.specialties.slice(0, 3)).map((specialty, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm rounded-full border-2 border-blue-200 font-medium hover:bg-blue-100 transition-all duration-200 hover:scale-105 shadow-sm" // Increased padding and text size
                            >
                              {specialty}
                            </span>
                          ))}
                          {!isExpanded && member.specialties.length > 3 && (
                            <button
                              onClick={() => toggleExpanded(memberId)}
                              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-full border border-gray-300 font-medium hover:bg-gray-200 transition-all duration-200" // Increased padding and text size
                            >
                              +{member.specialties.length - 3} עוד
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Additional Info - Expandable */}
                    {isExpanded && (
                      <div className="w-full pt-4 border-t border-gray-100 space-y-3 animate-fadeIn">
                        {member.location && (
                          <div className="flex items-center justify-center gap-2 text-base text-gray-600"> {/* Increased text size */}
                            <MapPin className="w-5 h-5" /> {/* Slightly larger icon */}
                            <span>{member.location}</span>
                          </div>
                        )}
                        {member.joinDate && (
                          <div className="flex items-center justify-center gap-2 text-base text-gray-600"> {/* Increased text size */}
                            <Calendar className="w-5 h-5" /> {/* Slightly larger icon */}
                            <span>הצטרף ב: {new Date(member.joinDate).toLocaleDateString('he-IL')}</span>
                          </div>
                        )}
                        {member.website && (
                          <div className="flex items-center justify-center gap-2 text-base"> {/* Increased text size */}
                            <Globe className="w-5 h-5" /> {/* Slightly larger icon */}
                            <a
                              href={member.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                              אתר אישי
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rating/Stars */}
                    {member.rating && (
                      <div className="flex items-center justify-center gap-1 pt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < member.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} // Slightly larger icon
                          />
                        ))}
                        <span className="text-base text-gray-600 ml-2">({member.rating}/5)</span> {/* Increased text size */}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* No Results Message */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-20 h-20 text-gray-300 mx-auto mb-4" /> {/* Slightly larger icon */}
            <h3 className="text-xl font-medium text-gray-900 mb-2">לא נמצאו תוצאות</h3> {/* Increased font size */}
            <p className="text-lg text-gray-500">נסה לשנות את מונחי החיפוש או הפילטרים</p> {/* Increased font size */}
          </div>
        )}
      </motion.div>

      {/* Internal CSS */}
      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default RoleSection