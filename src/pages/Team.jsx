import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TeamFilters from '../components/team/TeamFilters'
import RoleSection from '../components/team/RoleSection'
import TeamSearch from '../components/team/TeamSearch'
import TeamEmptyState from '../components/team/TeamEmptyState'
import PendingUsersButton from '../components/team/addUserButton'
import ElementalLoader from '../theme/ElementalLoader'
import useTeamData from '../hooks/useTeamData'
import Layout from '../components/layout/Layout'
import { ThemeProvider, useElement } from '../theme/ThemeProvider'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { X, Trash2, User, Image, Info, Shield, Upload } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firbaseConfig'
import { toast } from 'sonner'
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions'

// Setup functions and emulator for local dev
const functions = getFunctions()
if (window.location.hostname === 'localhost') {
  connectFunctionsEmulator(functions, "localhost", 5001)
}

export default function Team() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showLoader, setShowLoader] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedMember, setEditedMember] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [avatarUploadUrl, setAvatarUploadUrl] = useState('')
  const avatarInputRef = useRef(null)

  const element = useElement()
  const { currentUser } = useAuth()

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

  // Permissions
  const isAdmin = currentUser?.role === 'admin'
  const canEdit = isAdmin || currentUser?.role === 'staff'

  // Initial loader
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  // --- Handlers ---
  const handleEdit = member => {
    setEditedMember({ ...member, originalRole: member.role })
    setIsEditing(true)
    setAvatarUploadUrl('')
  }

  const handleDelete = member => {
    setMemberToDelete(member)
    setIsDeleting(true)
  }

  const confirmDelete = async () => {
    if (!currentUser || !canEdit) {
      toast.error('אין לך הרשאות למחוק משתמשים.');
      setIsDeleting(false);
      return;
    }
    
    try {
      const deleteUserFunction = httpsCallable(functions, 'deleteUser');
      const deletePromise = deleteUserFunction({ uid: memberToDelete.id });
      
      toast.promise(deletePromise, {
        loading: 'מוחק משתמש...',
        success: async () => {
          await refreshData();
          return `${memberToDelete.displayName} נמחק בהצלחה`;
        },
        error: (error) => error?.message || 'שגיאה במחיקת המשתמש'
      });

      await deletePromise;
      setIsDeleting(false);
      setMemberToDelete(null);
    } catch (error) {
      setIsDeleting(false);
      setMemberToDelete(null);
    }
  };

  const handleSaveEdit = async () => {
  try {
    const updateUserRoleFunction = httpsCallable(functions, 'updateUserRole');
    setIsUpdatingRole(true);
    
    const updatePromise = (async () => {
      if (editedMember.role !== editedMember.originalRole) {
        await updateUserRoleFunction({
          uid: editedMember.id,
          newRole: editedMember.role,
          userData: {
            displayName: editedMember.displayName,
            title: editedMember.title,
            bio: editedMember.bio,
            photoURL: editedMember.photoURL
          }
        });
      }
      
      await updateDoc(doc(db, 'users', editedMember.id), {
        displayName: editedMember.displayName,
        title: editedMember.title,
        bio: editedMember.bio,
        updatedAt: new Date()
      });
      
      await updateDoc(doc(db, 'profiles', editedMember.id), {
        photoURL: editedMember.photoURL,
        updatedAt: new Date()
      });
      
      await refreshData();
    })();

    toast.promise(updatePromise, {
      loading: 'מעדכן פרטים...',
      success: 'השינויים נשמרו בהצלחה',
      error: (error) => error?.message || 'שגיאה בעדכון הפרטים'
    });

    await updatePromise;
    setIsEditing(false);
    setEditedMember(null);
  } catch (error) {
    setIsEditing(false);
    setEditedMember(null);
  } finally {
    setIsUpdatingRole(false);
  }
};

  // --- UI Animation Variants ---
  const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }, exit: { opacity: 0, y: -20 } }
  const itemVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } }
  const overlayVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
  const modalVariants = { hidden: { opacity: 0, scale: 0.96, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } } }

  if (showLoader) return <ElementalLoader />

  return (
    <ThemeProvider element={element}>
      <Layout>
        <div dir="rtl" lang="he" className="min-h-screen bg-gradient-to-b from-white via-element-soft/30 to-white">
          <AnimatePresence>
            <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} className="container mx-auto px-4 py-12">
              <div className="max-w-5xl mx-auto">
                <motion.div variants={itemVariants} className="text-center mb-12">
                  <h1 className="text-4xl font-extrabold text-element mb-2">צוות המתנדבים</h1>
                  <p className="text-gray-600 max-w-2xl mx-auto">נהל את חברי הצוות, סנן לפי תפקיד, חפש לפי שם, ועדכן או מחק בלחיצה.</p>
                </motion.div>
                <motion.div variants={itemVariants} className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-element/10">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <TeamSearch value={searchQuery} onChange={setSearchQuery} className="w-full md:w-2/5" />
                    <TeamFilters regions={regions} expertises={expertises} locations={locations} filters={filters} onChange={setFilters} className="w-full md:flex-1" />
                    {canEdit && <PendingUsersButton className="w-full md:w-auto mt-4 md:mt-0" />}
                  </div>
                </motion.div>
                {isLoading ? (
                  <motion.div variants={itemVariants} className="flex justify-center items-center py-32">
                    <ElementalLoader />
                  </motion.div>
                ) : hasResults ? (
                  <motion.div variants={itemVariants} className="space-y-16">
                    {groupedByRole.map(({ role, members }) => (
                      <RoleSection key={role} role={role} members={members} onEdit={canEdit ? handleEdit : undefined} onDelete={canEdit ? handleDelete : undefined} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants}>
                    <TeamEmptyState onReset={() => { setSearchQuery(''); setFilters({ region: '', expertise: '', location: '' }); }} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Edit Member Modal */}
          <AnimatePresence>
            {isEditing && editedMember && (
              <motion.div initial="hidden" animate="visible" exit="hidden" variants={overlayVariants} className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
                <motion.div variants={modalVariants} className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 z-10 flex justify-between items-center bg-white/95 backdrop-blur-sm py-4 px-6 md:px-8 border-b">
                    <h3 className="text-2xl font-bold">עריכת משתמש</h3>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full p-2" aria-label="סגור">
                      <X className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-6 md:p-8 pt-4">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/3">
                        <div className="bg-gray-50 rounded-xl p-4 sticky top-24 flex flex-col items-center">
                          <div className="relative">
                            {editedMember.photoURL ? (
                              <img src={editedMember.photoURL} alt={editedMember.displayName} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
                            ) : (
                              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                <User size={48} />
                              </div>
                            )}
                            <button
                              type="button"
                              className="absolute bottom-0 right-0 p-2 rounded-full bg-element shadow border-2 border-white hover:bg-orange-500 transition"
                              onClick={() => avatarInputRef.current && avatarInputRef.current.click()}
                            >
                              <Upload size={18} className="text-white" />
                            </button>
                            {/* Not implemented: upload file to Firebase Storage. For now just change the URL. */}
                            <input
                              type="file"
                              accept="image/*"
                              ref={avatarInputRef}
                              onChange={e => {
                                toast.info('העלאת תמונה לא נתמכת עדיין, נא להזין קישור.')
                              }}
                              className="hidden"
                            />
                          </div>
                          <div className="text-center mt-4">
                            <h4 className="font-bold text-lg">{editedMember.displayName}</h4>
                            <p className="text-gray-500 text-sm">{editedMember.title || 'ללא תפקיד'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="md:w-2/3 space-y-6">
                        <div className="bg-gray-50 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3 text-gray-700">
                            <User size={18} />
                            <h4 className="font-semibold">פרטים אישיים</h4>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                              <input type="text" value={editedMember.displayName} onChange={e => setEditedMember({ ...editedMember, displayName: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-element focus:border-element transition-all" placeholder="שם מלא" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד</label>
                              <input type="text" value={editedMember.title} onChange={e => setEditedMember({ ...editedMember, title: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-element focus:border-element transition-all" placeholder="תפקיד" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3 text-gray-700">
                            <Image size={18} />
                            <h4 className="font-semibold">תמונת פרופיל</h4>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">קישור לתמונה</label>
                            <input type="text" value={editedMember.photoURL} onChange={e => setEditedMember({ ...editedMember, photoURL: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-element focus:border-element transition-all" placeholder="קישור לתמונה" />
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3 text-gray-700">
                            <Info size={18} />
                            <h4 className="font-semibold">ביוגרפיה</h4>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ביוגרפיה</label>
                            <textarea value={editedMember.bio} onChange={e => setEditedMember({ ...editedMember, bio: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-element focus:border-element transition-all resize-none" placeholder="ביוגרפיה קצרה" rows={4} />
                          </div>
                        </div>
                        {canEdit && (
                          <div className="bg-gray-50 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3 text-gray-700">
                              <Shield size={18} />
                              <h4 className="font-semibold">הרשאות</h4>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד במערכת</label>
                              <select value={editedMember.role} onChange={e => setEditedMember({ ...editedMember, role: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-element focus:border-element transition-all appearance-none bg-white">
                                <option value="participant">משתתף</option>
                                <option value="staff">צוות</option>
                                <option value="mentor">מנטור</option>
                                <option value="family">משפחה</option>
                                {isAdmin && <option value="admin">מנהל</option>}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-8 border-t pt-6 flex justify-end gap-4">
                      <Button onClick={() => setIsEditing(false)} variant="outline" className="min-w-24">ביטול</Button>
                      <Button onClick={handleSaveEdit} className="bg-orange-500 hover:bg-orange-600 text-white min-w-24" disabled={isUpdatingRole}>
                        {isUpdatingRole ? <span className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin mr-2"></span> : null}
                        {isUpdatingRole ? 'מעדכן...' : 'שמירה'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {isDeleting && memberToDelete && (
              <motion.div initial="hidden" animate="visible" exit="hidden" variants={overlayVariants} className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleting(false)} />
                <motion.div variants={modalVariants} className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
                  <div className="p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="h-7 w-7 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">מחיקת משתמש</h3>
                      <div className="bg-gray-50 p-4 rounded-xl mb-4">
                        <div className="flex items-center justify-center gap-3">
                          {memberToDelete.photoURL ? (
                            <img src={memberToDelete.photoURL} alt={memberToDelete.displayName} className="w-12 h-12 rounded-full object-cover border-2 border-white" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User size={24} className="text-gray-400" />
                            </div>
                          )}
                          <div className="text-right">
                            <h4 className="font-bold">{memberToDelete.displayName}</h4>
                            <p className="text-sm text-gray-500">{memberToDelete.title || 'ללא תפקיד'}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        האם אתה בטוח שברצונך למחוק את המשתמש מהמערכת?
                        <br />
                        <span className="text-red-500 font-semibold">פעולה זו אינה ניתנת לביטול.</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={() => setIsDeleting(false)} variant="outline" className="w-full">ביטול</Button>
                      <Button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white w-full">אישור מחיקה</Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </ThemeProvider>
  )
}
