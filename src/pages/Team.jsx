import React, { useState } from 'react'
import { motion } from 'framer-motion'
import TeamFilters from '../components/team/TeamFilters'
import RoleSection from '../components/team/RoleSection'
import TeamSearch from '../components/team/TeamSearch'
import TeamEmptyState from '../components/team/TeamEmptyState'
import useTeamData from '../hooks/useTeamData'
import Layout from '../components/layout/Layout'
import { ThemeProvider } from '../theme/ThemeProvider'
import { useElement } from '../theme/ThemeProvider'

export default function Team() {
  const [searchQuery, setSearchQuery] = useState('')
  const element = useElement()
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
    <ThemeProvider element={element}>
      <Layout>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto px-4 py-12"
        >
          <div className="max-w-5xl mx-auto">
            <motion.h1 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-element-accent to-element text-transparent bg-clip-text"
            >
              הכירו את הצוות שלנו
            </motion.h1>
            
            <div className="mb-8 bg-element-soft rounded-xl shadow-md p-6 border border-element/20">
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
                <div className="w-16 h-16 border-4 border-element border-t-transparent rounded-full animate-spin"></div>
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
      </Layout>
    </ThemeProvider>
  )
}