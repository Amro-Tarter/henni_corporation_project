import React, { useState, useCallback, useMemo } from 'react'
import { Edit2, Trash2, Mail, Crown, User, Award, Briefcase, Heart, Star, MapPin, Phone, Globe, Calendar, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

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
    
    return members.filter(member => {
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
    }).sort((a, b) => {
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

  // Stats calculation
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
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
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
      case 'מנהל':
        return 'from-amber-400 to-orange-500'
      case 'staff':
      case 'צוות':
        return 'from-blue-400 to-indigo-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Members Grid */}
      <div 
        className="space-y-8"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <div 
          className={`grid gap-6 ${getGridLayout(filteredMembers.length)}`}
          variants={container}
        >
          {filteredMembers.map((member, index) => {
            const memberId = member.id || index
            const isExpanded = expandedCards.has(memberId)
            const hasExpandableContent = member.bio || (member.specialties?.length > 3)
            
            return (
              <div
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
                    {/* Profile Image with Enhanced Status */}
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white/60 hover:ring-blue-200 transition-all duration-300">
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
                      {(role === 'ceo' || role === 'מנהל') && (
                        <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r ${getRoleColor(role)} rounded-full flex items-center justify-center shadow-lg ring-4 ring-white animate-pulse`}>
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                      )}
                                         
                    </div>

                    {/* Name and Title */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                        {member.username || member.displayName}
                      </h3>
                      
                      {/* Role/Position with icon */}
                      {member.in_role && (
                        <div className="flex items-center justify-center gap-2">
                          {getRoleIcon(role)}
                          <p className={`text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r ${getRoleColor(role)} text-white shadow-md`}>
                            {member.in_role}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Mentor Name  */}
                    {member.mentorName && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 w-full shadow-sm">
                        <div className="flex items-center justify-center gap-2 text-purple-700">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span className="font-bold text-purple-800 bg-white/50 px-2 py-1 rounded-lg">
                            {member.mentorName}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div className="w-full space-y-2">
                      {member.email && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 hover:bg-blue-50 rounded-lg px-3 py-2 w-full transition-colors duration-200 group/email">
                          <Mail className="w-4 h-4 group-hover/email:text-blue-600" />
                          <a 
                            href={`mailto:${member.email}`}
                            className="hover:text-blue-600 transition-colors duration-200 truncate font-medium"
                          >
                            {member.email}
                          </a>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/email:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>

                    {/* Bio Section - Expandable */}
                    {member.bio && (
                      <div className="border-t border-gray-100 pt-4 w-full">
                        <p className={`text-gray-700 text-sm leading-relaxed text-center transition-all duration-300 ${
                          isExpanded ? '' : 'line-clamp-3'
                        }`}>
                          {member.bio}
                        </p>
                        {hasExpandableContent && (
                          <button
                            onClick={() => toggleExpanded(memberId)}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 mx-auto transition-colors duration-200"
                          >
                            {isExpanded ? (
                              <>
                                הצג פחות <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                הצג עוד <ChevronDown className="w-3 h-3" />
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
                          <Award className="w-4 h-4 text-blue-600" />
                          <h4 className="text-sm font-semibold text-gray-800">התמחויות:</h4>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {(isExpanded ? member.specialties : member.specialties.slice(0, 3)).map((specialty, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-full border-2 border-blue-200 font-medium hover:bg-blue-100 transition-all duration-200 hover:scale-105 shadow-sm"
                            >
                              {specialty}
                            </span>
                          ))}
                          {!isExpanded && member.specialties.length > 3 && (
                            <button
                              onClick={() => toggleExpanded(memberId)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-300 font-medium hover:bg-gray-200 transition-all duration-200"
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
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{member.location}</span>
                          </div>
                        )}
                        {member.joinDate && (
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>הצטרף ב: {new Date(member.joinDate).toLocaleDateString('he-IL')}</span>
                          </div>
                        )}
                        {member.website && (
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <Globe className="w-4 h-4" />
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
                            className={`w-4 h-4 ${i < member.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">({member.rating}/5)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* No Results Message */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">לא נמצאו תוצאות</h3>
            <p className="text-gray-500">נסה לשנות את מונחי החיפוש או הפילטרים</p>
          </div>
        )}
      </div>

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
        
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  )
}

export default RoleSection