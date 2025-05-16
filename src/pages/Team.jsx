import React, { useState } from 'react'
import { motion } from 'framer-motion'
import TeamFilters from '../components/Team/TeamFilters'
import RoleSection from '../components/Team/RoleSection'
import TeamSearch from '../components/Team/TeamSearch'
import TeamEmptyState from '../components/Team/TeamEmptyState'
import useTeamData from '../hooks/useTeamData'
import { Helmet } from 'react-helmet'

export default function Team() {
  const [searchQuery, setSearchQuery] = useState('')
  const { 
    groupedByRole, 
    regions, 
    expertises, 
    filters, 
    setFilters, 
    isLoading,
    hasResults
  } = useTeamData(searchQuery)

  return (
    <>
      <Helmet>
        <title>Our Team | Art Mentorship Platform</title>
        <meta name="description" content="Meet our dedicated team of staff, volunteers, and art mentors." />
      </Helmet>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-12"
      >
        <div className="max-w-5xl mx-auto">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
          >
            Meet Our Team
          </motion.h1>
          
          <div className="mb-8 bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <TeamSearch 
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full md:w-1/3"
              />
              <TeamFilters
                regions={regions}
                expertises={expertises}
                filters={filters}
                onChange={setFilters}
                className="w-full md:flex-1"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : hasResults ? (
            <div className="space-y-16">
              {groupedByRole.map(({ role, members }) => (
                <RoleSection key={role} role={role} members={members} />
              ))}
            </div>
          ) : (
            <TeamEmptyState onReset={() => {
              setSearchQuery('')
              setFilters({ region: '', expertise: '' })
            }} />
          )}
        </div>
      </motion.div>
    </>
  )
}