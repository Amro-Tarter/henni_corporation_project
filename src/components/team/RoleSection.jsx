import React from 'react'
import { motion } from 'framer-motion'
import ProfileCard from './ProfileCard'

export default function RoleSection({ role, members }) {
  if (!members.length) return null
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        {role}
        <span className="mr-3 bg-element-soft text-element px-3 py-1 rounded-full text-sm">
          {members.length}
        </span>
      </h2>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {members.map(member => (
          <motion.div key={member.id} variants={item}>
            <ProfileCard {...member} role={role} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}