import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TeamFilters from '../components/team/TeamFilters'
import RoleSection from '../components/team/RoleSection'
import TeamSearch from '../components/team/TeamSearch'
import TeamEmptyState from '../components/team/TeamEmptyState'
import PendingUsersButton from '../components/team/addUserButton'
import ElementalLoader from '../theme/ElementalLoader'
import useTeamData from '../hooks/useTeamData'
import Layout from '../components/layout/Layout'
import { ThemeProvider } from '../theme/ThemeProvider'
import { useElement } from '../theme/ThemeProvider'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { X, Edit2, Trash2 } from 'lucide-react'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../config/firbaseConfig'
import { useToast } from '../hooks/use-toast'

export default function Team() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showLoader, setShowLoader] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedMember, setEditedMember] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const element = useElement()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  
  const { 
    groupedByRole, 
    regions, 
    expertises,
    locations,
    filters, 
    setFilters, 
    isLoading,
    hasResults,
    refreshData
  } = useTeamData(searchQuery)

  // Check if current user is admin or staff
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'staff'

  // Simulate loading state with the ElementalLoader
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleEdit = (member) => {
    setEditedMember(member)
    setIsEditing(true)
  }

  const handleDelete = (member) => {
    setMemberToDelete(member)
    setIsDeleting(true)
  }

  const confirmDelete = async () => {
    try {
      // Delete user document
      await deleteDoc(doc(db, 'users', memberToDelete.id))
      
      // Delete profile document
      await deleteDoc(doc(db, 'profiles', memberToDelete.id))

      // Refresh the data
      await refreshData()

      toast({
        title: "משתמש נמחק בהצלחה",
        description: `${memberToDelete.displayName} נמחק מהמערכת`,
        variant: "success",
      })

      setIsDeleting(false)
      setMemberToDelete(null)
    } catch (error) {
      console.error('Error deleting member:', error)
      toast({
        title: "שגיאה במחיקת המשתמש",
        description: "אירעה שגיאה בעת ניסיון למחוק את המשתמש",
        variant: "destructive",
      })
    }
  }

  const handleSaveEdit = async () => {
    try {
      // Update user document
      await updateDoc(doc(db, 'users', editedMember.id), {
        displayName: editedMember.displayName,
        title: editedMember.title,
        bio: editedMember.bio,
        updatedAt: new Date()
      })

      // Update profile document
      await updateDoc(doc(db, 'profiles', editedMember.id), {
        photoURL: editedMember.photoURL,
        updatedAt: new Date()
      })

      // Refresh the data
      await refreshData()

      toast({
        title: "פרטים עודכנו בהצלחה",
        description: "הפרטים עודכנו בהצלחה במערכת",
        variant: "success",
      })

      setIsEditing(false)
      setEditedMember(null)
    } catch (error) {
      console.error('Error updating member:', error)
      toast({
        title: "שגיאה בעדכון הפרטים",
        description: "אירעה שגיאה בעת ניסיון לעדכן את הפרטים",
        variant: "destructive",
      })
    }
  }

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
                      locations={locations}
                      filters={filters}
                      onChange={setFilters}
                      className="w-full md:flex-1"
                    />
                    <PendingUsersButton />
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
                      <RoleSection 
                        key={role} 
                        role={role} 
                        members={members} 
                        onEdit={canEdit ? handleEdit : undefined}
                        onDelete={canEdit ? handleDelete : undefined}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants}>
                    <TeamEmptyState onReset={() => {
                      setSearchQuery('')
                      setFilters({ region: '', expertise: '', location: '' })
                    }} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Edit Modal */}
          <AnimatePresence>
            {isEditing && editedMember && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditing(false)}></div>
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="absolute top-4 left-4 bg-white/80 rounded-full p-1 hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-600" />
                  </button>

                  <div className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold mb-6">עריכת פרטי משתמש</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                        <input
                          type="text"
                          value={editedMember.displayName}
                          onChange={(e) => setEditedMember({...editedMember, displayName: e.target.value})}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד</label>
                        <input
                          type="text"
                          value={editedMember.title}
                          onChange={(e) => setEditedMember({...editedMember, title: e.target.value})}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">תמונה</label>
                        <input
                          type="text"
                          value={editedMember.photoURL}
                          onChange={(e) => setEditedMember({...editedMember, photoURL: e.target.value})}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ביוגרפיה</label>
                        <textarea
                          value={editedMember.bio}
                          onChange={(e) => setEditedMember({...editedMember, bio: e.target.value})}
                          className="w-full p-2 border rounded-lg h-32"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                      >
                        ביטול
                      </Button>
                      <Button
                        onClick={handleSaveEdit}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        שמירה
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {isDeleting && memberToDelete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleting(false)}></div>
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
                  <button 
                    onClick={() => setIsDeleting(false)}
                    className="absolute top-4 left-4 bg-white/80 rounded-full p-1 hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-600" />
                  </button>

                  <div className="p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">מחיקת משתמש</h3>
                      <p className="text-gray-600">
                        האם אתה בטוח שברצונך למחוק את {memberToDelete.displayName}?
                        פעולה זו אינה ניתנת לביטול.
                      </p>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        onClick={() => setIsDeleting(false)}
                        variant="outline"
                      >
                        ביטול
                      </Button>
                      <Button
                        onClick={confirmDelete}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        מחיקה
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </ThemeProvider>
  )
}