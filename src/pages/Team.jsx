import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TeamFilters from '../components/team/TeamFilters'
import RoleSection from '../components/team/RoleSection'
import TeamSearch from '../components/team/TeamSearch'
import TeamEmptyState from '../components/team/TeamEmptyState'
import ElementalLoader from '../theme/ElementalLoader'
import useTeamData from '../hooks/useTeamData'
import Layout from '../components/layout/Layout'
import { ThemeProvider, useElement } from '../theme/ThemeProvider'

export default function Team() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showLoader, setShowLoader] = useState(true)

  const element = useElement()

  const {
    groupedByRole,
    regions,
    expertises,
    locations,
    filters,
    setFilters,
    isLoading,
    hasResults,
    allMembers // Add this if available in your hook
  } = useTeamData(searchQuery)

  // Debug: Log the data being fetched
  useEffect(() => {
    console.log('All grouped data:', groupedByRole)
    console.log('All members:', allMembers)
    if (groupedByRole) {
      groupedByRole.forEach(({ role, members }) => {
        console.log(`Role: ${role}, Members count: ${members.length}`)
      })
    }
  }, [groupedByRole, allMembers])

  // Filter to show only admins and mentors (Hebrew role names)
  const filteredGroupedByRole = groupedByRole.filter(({ role }) => 
    role === 'מנהלים' || role === 'מנטורים'
  )

  // Debug: Log filtered results
  useEffect(() => {
    console.log('Filtered results:', filteredGroupedByRole)
  }, [filteredGroupedByRole])

  // Check if we have results after filtering
  const hasFilteredResults = filteredGroupedByRole.length > 0 && 
    filteredGroupedByRole.some(({ members }) => members.length > 0)

  // Initial loader
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // UI Animation Variants
  const pageVariants = { 
    initial: { opacity: 0, y: 20 }, 
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }, 
    exit: { opacity: 0, y: -20 } 
  }
  const itemVariants = { 
    initial: { opacity: 0, y: 20 }, 
    animate: { opacity: 1, y: 0 }, 
    exit: { opacity: 0, y: -20 } 
  }

  if (showLoader) return <ElementalLoader />

  return (
    <ThemeProvider element={element}>
      <Layout>
        <div dir="rtl" lang="he" className="min-h-screen bg-gradient-to-b from-white via-element-soft/30 to-white">
          <AnimatePresence>
            <motion.div 
              initial="initial" 
              animate="animate" 
              exit="exit" 
              variants={pageVariants} 
              className="container mx-auto px-4 py-12"
            >
              <div className="max-w-5xl mx-auto">
                <motion.div variants={itemVariants} className="text-center mb-12">
                  <h1 className="text-4xl font-extrabold text-element mb-2">צוות הניהול והמנטורים</h1>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    הכירו את צוות הניהול והמנטורים שלנו - האנשים שמובילים ומנחים את הקהילה שלנו.
                  </p>
                </motion.div>
                
                <motion.div variants={itemVariants} className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-element/10">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <TeamSearch 
                      value={searchQuery} 
                      onChange={setSearchQuery} 
                      className="w-full md:w-2/5" 
                    />
                    <TeamFilters 
                      regions={regions} 
                      expertises={expertises} 
                      locations={locations} 
                      filters={filters} 
                      onChange={setFilters} 
                      className="w-full md:flex-1" 
                    />
                  </div>
                </motion.div>

                {isLoading ? (
                  <motion.div variants={itemVariants} className="flex justify-center items-center py-32">
                    <ElementalLoader />
                  </motion.div>
                ) : hasFilteredResults ? (
                  <motion.div variants={itemVariants} className="space-y-16">
                    {filteredGroupedByRole.map(({ role, members }) => (
                      members.length > 0 && (
                        <RoleSection 
                          key={role} 
                          role={role} 
                          members={members}
                          // No edit or delete handlers - view only
                        />
                      )
                    ))}
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants}>
                    <TeamEmptyState 
                      onReset={() => { 
                        setSearchQuery(''); 
                        setFilters({ region: '', expertise: '', location: '' }); 
                      }} 
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Layout>
    </ThemeProvider>
  )
}