import React from 'react'
import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaPalette, FaLinkedin, FaTwitter } from 'react-icons/fa'

export default function ProfileCard({ 
  imageURL, 
  first_name, 
  last_name, 
  bio, 
  region, 
  expertise, 
  role,
  social = {}
}) {
  const getRoleColor = (role) => {
    const colors = {
      'CEO': 'bg-purple-100 text-purple-800',
      'Employee': 'bg-blue-100 text-blue-800',
      'Volunteer': 'bg-green-100 text-green-800',
      'Mentor': 'bg-amber-100 text-amber-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden flex flex-col h-full"
    >
      <div className="relative">
        <img 
          src={imageURL || `https://ui-avatars.com/api/?name=${first_name}+${last_name}&background=random`} 
          alt={`${first_name} ${last_name}`} 
          className="w-full h-56 object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${first_name}+${last_name}&background=random`
          }}
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
            {role}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900">{first_name} {last_name}</h3>
        
        <div className="mt-2 space-y-1 mb-4">
          {region && (
            <div className="flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-gray-400" />
              <span>{region}</span>
            </div>
          )}
          
          {expertise && (
            <div className="flex items-center text-sm text-gray-600">
              <FaPalette className="mr-2 text-gray-400" />
              <span>{expertise}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-700 flex-grow line-clamp-3 mb-4">{bio}</p>
        
        {(social.linkedin || social.twitter) && (
          <div className="pt-4 border-t border-gray-100 flex gap-3">
            {social.linkedin && (
              <a 
                href={social.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
                aria-label={`${first_name}'s LinkedIn profile`}
              >
                <FaLinkedin size={20} />
              </a>
            )}
            {social.twitter && (
              <a 
                href={social.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-600"
                aria-label={`${first_name}'s Twitter profile`}
              >
                <FaTwitter size={20} />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}