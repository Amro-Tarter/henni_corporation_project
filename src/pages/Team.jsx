import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TeamFilters from '../components/team/TeamFilters'
import RoleSection from '../components/team/RoleSection'
import TeamSearch from '../components/team/TeamSearch'
import TeamEmptyState from '../components/team/TeamEmptyState'
import AddUserButton from '../components/team/addUserButton'
import ElementalLoader from '../theme/ElementalLoader'
import useTeamData from '../hooks/useTeamData'
import Layout from '../components/layout/Layout'
import { ThemeProvider } from '../theme/ThemeProvider'
import { useElement } from '../theme/ThemeProvider'

export default function Team() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showLoader, setShowLoader] = useState(true)
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

  // Simulate loading state with the ElementalLoader
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -20 }
  }

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  if (showLoader) {
    return <ElementalLoader />
  }

  return (
    <ThemeProvider element={element}>
      <Layout>
        <div dir="rtl" lang="he" className="min-h-screen bg-gradient-to-b from-white to-element-soft/20">
          <AnimatePresence>
            <motion.div 
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              className="container mx-auto px-4 py-12"
            >
              <div className="max-w-5xl mx-auto">
                <motion.div 
                  variants={itemVariants}
                  className="text-center mb-12"
                >
                </motion.div>
                
                <motion.div 
                  variants={itemVariants} 
                  className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-element/10"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <TeamSearch 
                      value={searchQuery}
                      onChange={setSearchQuery}
                      className="w-full md:w-2/5"
                    />
                    <TeamFilters
                      regions={regions}
                      expertises={expertises}
                      filters={filters}
                      onChange={setFilters}
                      className="w-full md:flex-1"
                    />
                    <AddUserButton />
                  </div>
                </motion.div>

                {isLoading ? (
                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-center items-center py-32"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-element border-r-transparent rounded-full animate-spin"></div>
                      <div className="mt-4 text-element text-center font-medium">טוען...</div>
                    </div>
                  </motion.div>
                ) : hasResults ? (
                  <motion.div 
                    variants={itemVariants}
                    className="space-y-16"
                  >
                    {groupedByRole.map(({ role, members }) => (
                      <RoleSection key={role} role={role} members={members} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants}>
                    <TeamEmptyState onReset={() => {
                      setSearchQuery('')
                      setFilters({ region: '', expertise: '' })
                    }} />
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