import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserClock, FaTimes, FaCheck, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import { doc, getDocs, collection, updateDoc, serverTimestamp, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firbaseConfig';
import { useUser } from '../../hooks/useUser';
import { toast } from 'sonner';
import { sendRequestNotification } from '../../utils/sendEmail';

const PendingUsersModal = ({ onClose }) => {
  const { user } = useUser();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
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
              displayName: profileData.displayName || userData.username,
              photoURL: profileData.photoURL || `https://ui-avatars.com/api/?name=${userData.username}&background=random`,
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

  const handleUserAction = async (userId, action, displayName, userEmail) => {
    try {
      if (action === 'accept') {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          is_active: true,
          updatedAt: serverTimestamp()
        });
        
        // Send acceptance email
        await sendRequestNotification(userEmail, 'accept', displayName);
        
        toast.success(`הבקשה של ${displayName} אושרה בהצלחה`);
        await loadPendingUsers();
      } else {
        // Send rejection email before deleting
        await sendRequestNotification(userEmail, 'reject', displayName);
        
        // Delete both user and profile documents
        const userRef = doc(db, 'users', userId);
        const profileRef = doc(db, 'profiles', userId);
        
        // Delete both documents
        await Promise.all([
          deleteDoc(userRef),
          deleteDoc(profileRef)
        ]);
        
        // Update UI immediately without reloading
        setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        toast.error(`הבקשה של ${displayName} נדחתה והוסרה`);
      }
    } catch (error) {
      console.error('Error handling user action:', error);
      toast.error('שגיאה בטיפול בבקשה. אנא נסה שוב.');
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return 'מנהל';
      case 'mentor':
        return 'מנטור';
      case 'participant':
        return 'משתתף';
      case 'family':
        return 'משפחה';
      default:
        return role;
    }
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
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">בקשות הצטרפות ממתינות</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="סגור חלון"
          >
            <FaTimes />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            אין בקשות הצטרפות ממתינות
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-red-100 dark:border-red-900/30"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-red-200 dark:border-red-800"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-slate-800" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{user.displayName}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        {getRoleDisplay(user.role)}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <FaEnvelope className="ml-2" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                          <FaPhone className="ml-2" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                          <FaMapMarkerAlt className="ml-2" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <FaCalendarAlt className="ml-2" />
                        <span>נרשם ב-{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {user.bio && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    {user.bio}
                  </p>
                )}

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUserAction(user.id, 'accept', user.displayName, user.email)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <FaCheck className="ml-2" />
                    אשר בקשה
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUserAction(user.id, 'reject', user.displayName, user.email)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <FaTimes className="ml-2" />
                    דחה בקשה
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function PendingUsersButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUser();

  // Only show the button if user is admin
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
      >
        <FaUserClock className="ml-2" />
        בקשות הצטרפות
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <PendingUsersModal onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}