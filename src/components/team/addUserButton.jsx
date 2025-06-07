import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserClock, FaTimes, FaCheck, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaSearch, FaUsers } from 'react-icons/fa';
import { doc, getDocs, collection, updateDoc, serverTimestamp, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firbaseConfig';
import { useUser } from '../../hooks/useUser';
import { toast } from 'sonner';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Role Selection Modal Component
const RoleSelectionModal = ({ user, onConfirm, onCancel, isProcessing }) => {
  const [selectedRole, setSelectedRole] = useState(user.role || 'participant');
  const [mentorId, setMentorId] = useState('');
  const [mentorsList, setMentorsList] = useState([]);

  const roles = [
    { value: 'admin', label: 'מנהל', description: 'גישה מלאה לכל המערכת', color: 'bg-purple-100 text-purple-800' },
    { value: 'mentor', label: 'מנטור', description: 'הדרכה וליווי משתתפים', color: 'bg-blue-100 text-blue-800' },
    { value: 'participant', label: 'משתתף', description: 'משתתף בתוכניות', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'staff', label: 'צוות', description: 'גישה מוגבלת למידע', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const mentors = usersSnap.docs
          .filter(doc => doc.data().role === 'mentor' && doc.data().is_active)
          .map(doc => ({ 
            id: doc.id, 
            name: doc.data().displayName || doc.data().username || 'מנטור' 
          }));
        setMentorsList(mentors);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      }
    };

    if (selectedRole === 'participant') {
      fetchMentors();
    }
  }, [selectedRole]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            בחירת תפקיד עבור {user.displayName}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`;
              }}
            />
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">{user.displayName}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            בחר תפקיד:
          </label>
          {roles.map((role) => (
            <motion.label
              key={role.value}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedRole === role.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selectedRole === role.value}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800 dark:text-white">
                    {role.label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${role.color}`}>
                    {role.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {role.description}
                </p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ml-3 ${
                selectedRole === role.value
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-slate-300 dark:border-slate-500'
              }`}>
                {selectedRole === role.value && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </motion.label>
          ))}
        </div>

        {selectedRole === 'participant' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              שייך למנטור:
            </label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">בחר מנטור (אופציונלי)</option>
              {mentorsList.map(mentor => (
                <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
              ))}
            </select>
            {mentorsList.length === 0 && selectedRole === 'participant' && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                אין מנטורים זמינים במערכת
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            ביטול
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onConfirm(selectedRole, mentorId)}
            disabled={isProcessing}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
            ) : (
              <FaCheck className="ml-2" />
            )}
            אשר בקשה
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PendingUsersModal = ({ onClose }) => {
  const { user } = useUser();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [processingUserId, setProcessingUserId] = useState(null);
  const [roleSelectionUser, setRoleSelectionUser] = useState(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [pendingUsers, searchTerm, sortBy]);

  const loadPendingUsers = async () => {
    try {
      setIsLoading(true);
      const usersSnap = await getDocs(collection(db, 'users'));
      const pendingUsersData = await Promise.all(
        usersSnap.docs
          .filter(doc => !doc.data().is_active)
          .map(async (userDoc) => {
            const userData = userDoc.data();
            const profileSnap = await getDoc(doc(db, 'profiles', userDoc.id));
            const profileData = profileSnap.exists() ? profileSnap.data() : {};
            
            return {
              id: userDoc.id,
              ...userData,
              ...profileData,
              displayName: profileData.displayName || userData.username || 'משתמש לא מזוהה',
              photoURL: profileData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username || 'User')}&background=random`,
              createdAt: userData.createdAt?.toDate?.() || new Date(),
              role: userData.role || 'participant'
            };
          })
      );
      setPendingUsers(pendingUsersData);
    } catch (error) {
      console.error('Error loading pending users:', error);
      toast.error('שגיאה בטעינת בקשות הצטרפות');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = pendingUsers.filter(user =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    switch (sortBy) {
      case 'name':
        filtered = filtered.sort((a, b) => a.displayName.localeCompare(b.displayName));
        break;
      case 'email':
        filtered = filtered.sort((a, b) => a.email.localeCompare(b.email));
        break;
      case 'role':
        filtered = filtered.sort((a, b) => a.role.localeCompare(b.role));
        break;
      case 'date':
      default:
        filtered = filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    setFilteredUsers(filtered);
  };

  const handleAcceptUser = (userToAccept) => {
    setRoleSelectionUser(userToAccept);
  };

  const handleConfirmAccept = async (selectedRole, mentorId) => {
    if (!roleSelectionUser) return;

    try {
      setProcessingUserId(roleSelectionUser.id);
      
      const userRef = doc(db, 'users', roleSelectionUser.id);
      const updateData = {
        is_active: true,
        role: selectedRole,
        updatedAt: serverTimestamp()
      };

      // Add mentor assignment for participants
      if (selectedRole === 'participant') {
        updateData.associatedMentor = mentorId || null;
      }

      await updateDoc(userRef, updateData);
      
      const profileRef = doc(db, 'profiles', roleSelectionUser.id);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          associated_id: roleSelectionUser.id,
          displayName: roleSelectionUser.displayName || "",
          username: roleSelectionUser.username || "",
          bio: "",
          location: roleSelectionUser.location || "",
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          createdAt: serverTimestamp(),
          photoURL: "https://firebasestorage.googleapis.com/v0/b/henini-prj.firebasestorage.app/o/profiles%2F123laith%2Fprofile.jpg?alt=media&token=3a72889a-42f8-490d-8968-bb2a3da06f98",
          role: selectedRole,
          ...(selectedRole === "participant" && { associatedMentor: mentorId || null }),
        });
      } else {
        if (selectedRole === 'staff') {
          await deleteDoc(profileRef);
        } else {
          const profileUpdateData = {
            role: selectedRole,
            updatedAt: serverTimestamp(),
          };
          if (selectedRole === 'participant') {
            profileUpdateData.associatedMentor = mentorId || null;
          }
          await updateDoc(profileRef, profileUpdateData);
        }
      }

      
      const mentorText = mentorId ? ' עם מנטור מוקצה' : '';
      toast.success(`הבקשה של ${roleSelectionUser.displayName} אושרה בהצלחה כ${getRoleDisplay(selectedRole)}${mentorText}`);
      setRoleSelectionUser(null);
      await loadPendingUsers();
    } catch (error) {
      console.error('Error accepting user:', error);
      toast.error('שגיאה באישור הבקשה. אנא נסה שוב.');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleRejectUser = async (userId, displayName) => {
    try {
      setProcessingUserId(userId);
      
      const functions = getFunctions();
      const deleteUserFunction = httpsCallable(functions, 'deleteUser');
      
      // Delete user from Firebase Auth and all related documents
      await deleteUserFunction({ uid: userId });
      
      // Update UI immediately without reloading
      setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast.error(`הבקשה של ${displayName} נדחתה והוסרה`);
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('שגיאה בדחיית הבקשה. אנא נסה שוב.');
    } finally {
      setProcessingUserId(null);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'admin': 'מנהל',
      'mentor': 'מנטור',
      'participant': 'משתתף',
      'staff': 'צוות',
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      'admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'mentor': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'participant': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'staff': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Only show the modal if user is admin
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl p-6 max-h-[90vh] overflow-hidden flex flex-col"
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              בקשות הצטרפות ממתינות
              {!isLoading && (
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 mr-2">
                  ({filteredUsers.length})
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="סגור חלון"
            >
              <FaTimes />
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                id="search-input"
                name="search"
                placeholder="חפש לפי שם, אימייל, טלפון או מיקום..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="date">מיין לפי תאריך</option>
              <option value="name">מיין לפי שם</option>
              <option value="email">מיין לפי אימייל</option>
              <option value="role">מיין לפי תפקיד</option>
            </select>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <FaUserClock className="mx-auto text-6xl text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  {searchTerm ? 'לא נמצאו תוצאות לחיפוש שלך' : 'אין בקשות הצטרפות ממתינות'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredUsers.map((userItem) => (
                  <motion.div
                    key={userItem.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-red-100 dark:border-red-900/30 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={userItem.photoURL}
                          alt={userItem.displayName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-red-200 dark:border-red-800"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.displayName)}&background=random`;
                          }}
                          loading="lazy"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-slate-800" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            {userItem.displayName}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(userItem.role)}`}>
                            {getRoleDisplay(userItem.role)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                            <FaEnvelope className="ml-2 flex-shrink-0" />
                            <span className="truncate">{userItem.email}</span>
                          </div>
                          {userItem.phone && (
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                              <FaPhone className="ml-2 flex-shrink-0" />
                              <span dir="ltr">{userItem.phone}</span>
                            </div>
                          )}
                          {userItem.location && (
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                              <FaMapMarkerAlt className="ml-2 flex-shrink-0" />
                              <span>{userItem.location}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                            <FaCalendarAlt className="ml-2 flex-shrink-0" />
                            <span>נרשם ב-{formatDate(userItem.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {userItem.bio && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        {userItem.bio}
                      </p>
                    )}

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAcceptUser(userItem)}
                        disabled={processingUserId === userItem.id}
                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                      >
                        {processingUserId === userItem.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                        ) : (
                          <FaUsers className="ml-2" />
                        )}
                        אשר בקשה
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRejectUser(userItem.id, userItem.displayName)}
                        disabled={processingUserId === userItem.id}
                        className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                      >
                        {processingUserId === userItem.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                        ) : (
                          <FaTimes className="ml-2" />
                        )}
                        דחה בקשה
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Role Selection Modal */}
      <AnimatePresence>
        {roleSelectionUser && (
          <RoleSelectionModal
            user={roleSelectionUser}
            onConfirm={handleConfirmAccept}
            onCancel={() => setRoleSelectionUser(null)}
            isProcessing={processingUserId === roleSelectionUser.id}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default function PendingUsersButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    if (user?.isAdmin) {
      loadPendingCount();
    }
  }, [user]);

  const loadPendingCount = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const count = usersSnap.docs.filter(doc => !doc.data().is_active).length;
      setPendingCount(count);
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  };

  // Only show the button if user is admin
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsModalOpen(true);
          loadPendingCount();
        }}
        className="relative inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-colors"
      >
        <FaUserClock className="ml-2" />
        בקשות הצטרפות
        {pendingCount > 0 && (
          <span className="absolute -top-2 -left-2 bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <PendingUsersModal onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}