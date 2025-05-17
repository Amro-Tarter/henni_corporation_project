import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Edit2, Trash2 } from 'lucide-react'

const RoleSection = ({ role, members, onEdit, onDelete }) => {
  const roleTitles = {
    ceo: 'מנכ"ל ומייסד',
    admin: 'מנהלים',
    staff: 'צוות',
    mentor: 'מנטורים'
  }

  const roleColors = {
    ceo: 'bg-orange-100 text-orange-800',
    admin: 'bg-blue-100 text-blue-800',
    staff: 'bg-green-100 text-green-800',
    mentor: 'bg-purple-100 text-purple-800'
  }

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
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 } 
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{roleTitles[role] || role}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="relative">
                  <div className="absolute top-2 left-2 flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(member)}
                        className="bg-white/80 rounded-full p-1 hover:bg-gray-200 transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(member)}
                        className="bg-white/80 rounded-full p-1 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <img
                        src={member.photoURL || '/default_user_pic.jpg'}
                        alt={member.displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{member.displayName}</h3>
                      <p className="text-sm text-gray-600">{member.title}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                        {roleTitles[member.role] || member.role}
                      </span>
                    </div>
                  </div>
                  {member.bio && (
                    <p className="mt-4 text-sm text-gray-600 line-clamp-3">{member.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default RoleSection