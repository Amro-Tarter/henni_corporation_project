import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserClock, FaTimes, FaCheck, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { doc, getDocs, collection, updateDoc, serverTimestamp, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firbaseConfig';
import { useUser } from '../../hooks/useUser';
import { toast } from 'sonner';
import { getFunctions, httpsCallable } from 'firebase/functions';

const PendingUsersModal = ({ onClose }) => {
  const { user } = useUser();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [processingUserId, setProcessingUserId] = useState(null);

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

  const handleUserAction = async (userId, action, displayName) => {
    try {
      setProcessingUserId(userId);
      
      if (action === 'accept') {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          is_active: true,
          updatedAt: serverTimestamp()
        });
        
        toast.success(`הבקשה של ${displayName} אושרה בהצלחה`);
        await loadPendingUsers();
      } else {
        const functions = getFunctions();
        const deleteUserFunction = httpsCallable(functions, 'deleteUser');
        
        // Delete user from Firebase Auth and all related documents
        await deleteUserFunction({ uid: userId });
        
        // Update UI immediately without reloading
        setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        toast.error(`הבקשה של ${displayName} נדחתה והוסרה`);
      }
    } catch (error) {
      console.error('Error handling user action:', error);
      toast.error('שגיאה בטיפול בבקשה. אנא נסה שוב.');
    } finally {
      setProcessingUserId(null);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'admin': 'מנהל',
      'mentor': 'מנטור',
      'participant': 'משתתף',
      'family': 'משפחה'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      'admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'mentor': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'participant': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'family': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
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
                      onClick={() => handleUserAction(userItem.id, 'accept', userItem.displayName)}
                      disabled={processingUserId === userItem.id}
                      className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      {processingUserId === userItem.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                      ) : (
                        <FaCheck className="ml-2" />
                      )}
                      אשר בקשה
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUserAction(userItem.id, 'reject', userItem.displayName)}
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