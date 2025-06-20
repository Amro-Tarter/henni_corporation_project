import React, { useState, useEffect, useCallback, useMemo } from "react";
import { collection, query, getDocs, orderBy, updateDoc, doc, deleteDoc, getDoc, where, setDoc } from "firebase/firestore";
import { db } from "../../config/firbaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faEye,
  faUserFriends,
  faTimes,
  faUsers,
  faFilter,
  faSave,
  faSpinner,
  faCrown,
  faBullseye,
  faStar,
  faMapMarkerAlt,
  faEnvelope,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import { Search, Filter, Users as UsersIcon, ChevronDown } from "lucide-react";
import AirIcon from '@mui/icons-material/Air';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { PendingUsersButton } from "../../components/team/addUserButton";
import { useUser } from "../../hooks/useUser";
import ElementalLoader from "@/theme/ElementalLoader";

// Enhanced Constants with new element structure
const ELEMENTS = [
  { key: 'earth', emoji: '🌱', color: 'from-green-600 to-emerald-500', bgColor: 'bg-green-100', textColor: 'text-green-600', name: 'אדמה' },
  { key: 'metal', emoji: '⚒️', color: 'from-gray-600 to-slate-500', bgColor: 'bg-gray-100', textColor: 'text-gray-600', name: 'מתכת' },
  { key: 'air', emoji: <AirIcon style={{color: '#87ceeb'}} />, color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-100', textColor: 'text-blue-600', name: 'אוויר' },
  { key: 'water', emoji: '💧', color: 'from-indigo-500 to-purple-400', bgColor: 'bg-indigo-100', textColor: 'text-indigo-600', name: 'מים' },
  { key: 'fire', emoji: '🔥', color: 'from-red-600 to-orange-500', bgColor: 'bg-red-100', textColor: 'text-red-600', name: 'אש' },
];

const ROLES = [
  { key: 'admin', emoji: '👑', icon: faCrown, name: 'מנהל', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { key: 'mentor', emoji: '🎯', icon: faBullseye, name: 'מנטור', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { key: 'participant', emoji: '🌟', icon: faStar, name: 'משתתף', color: 'text-green-600', bgColor: 'bg-green-100' },
];


// Utility functions
const getElementConfig = (elementKey) => {
  return ELEMENTS.find(el => el.key === elementKey) || ELEMENTS[0];
};


// Enhanced Edit User Modal
const EditUserModal = ({ user, onClose, onSave, availableMentors }) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    element: user.element || '',
    location: user.location || '',
    role: user.role || 'participant',
    displayName: user.profile?.displayName || '',
    bio: user.profile?.bio || '',
    photoURL: user.profile?.photoURL || '',
    mentors: user.mentors || []
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(user.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('שגיאה בשמירת המשתמש');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faEdit} className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                עריכת משתמש
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg">{user.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all duration-200"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faUserShield} className="text-blue-600" />
              מידע בסיסי
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">שם משתמש</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">שם תצוגה</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-green-600" />
              פרטי התקשרות
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">אימייל</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">מיקום</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  placeholder="עיר, מדינה..."
                />
              </div>
            </div>
          </div>

          {/* Role & Element */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCrown} className="text-purple-600" />
              תפקיד ואלמנט
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">תפקיד</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {ROLES.map(role => (
                    <option key={role.key} value={role.key}>
                       {role.name}
                    </option>
                  ))}
                </select>
              </div>
              {formData.role === 'participant' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">אלמנט</label>
                  <select
                    value={formData.element}
                    onChange={(e) => setFormData({...formData, element: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">בחר אלמנט</option>
                    {ELEMENTS.map(element => (
                      <option key={element.key} value={element.key}>
                         {element.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Mentors Selection for Participants */}
          {formData.role === 'participant' && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faUserFriends} className="text-blue-600" />
                מנטורים
              </h4>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">בחר מנטורים</label>
                <select
                  multiple
                  value={formData.mentors || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    setFormData({ ...formData, mentors: selected });
                  }}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-[120px]"
                >
                  {availableMentors.map(mentor => (
                    <option key={mentor.id} value={mentor.id} className="py-2">
                      {mentor.profile?.displayName || mentor.username}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  החזק Ctrl/Cmd לבחירת מספר מנטורים
                </p>
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faEdit} className="text-indigo-600" />
              אודות
            </h4>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">ביוגרפיה</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 resize-none"
                placeholder="ספר על עצמך..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-600">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 font-medium"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin ml-2" />
              ) : (
                <FontAwesomeIcon icon={faSave} className="ml-2" />
              )}
              שמור שינויים
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Delete Confirmation Modal
const DeleteConfirmModal = ({ user, onConfirm, onCancel, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-red-200 dark:border-red-800"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-6">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center ml-4">
            <FontAwesomeIcon icon={faTrash} className="text-red-600 text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              אישור מחיקה
            </h3>
            <p className="text-red-600 text-sm">פעולה בלתי הפיכה</p>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
          <p className="text-slate-700 dark:text-slate-300 mb-2">
            האם אתה בטוח שברצונך למחוק את המשתמש <strong className="text-red-600">{user.username}</strong>?
          </p>
          <p className="text-sm text-red-600 font-medium">
            פעולה זו תמחק לצמיתות את כל הנתונים, הפוסטים והתגובות של המשתמש.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={() => onConfirm(user.id)}
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin ml-2" />
            ) : (
              <FontAwesomeIcon icon={faTrash} className="ml-2" />
            )}
            מחק סופית
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Cascade delete function
async function cascadeDeleteUser(uid, db) {
  try {
    await deleteDoc(doc(db, "users", uid));
    //(`User ${uid} deleted from users collection.`);

    await deleteDoc(doc(db, "profiles", uid));
    //(`Profile ${uid} deleted.`);

    const messagesRef = collection(db, "conversations", uid, "messages");
    const messagesSnap = await getDocs(messagesRef);
    for (const msgDoc of messagesSnap.docs) {
      await deleteDoc(doc(db, "conversations", uid, "messages", msgDoc.id));
    }
    await deleteDoc(doc(db, "conversations", uid));
    //(`Messages for user ${uid} deleted.`);

    const postsQuery = query(collection(db, "posts"), where("authorId", "==", uid));
    const postsSnapshot = await getDocs(postsQuery);
    for (const postDoc of postsSnapshot.docs) {
      const commentsRef = collection(db, "posts", postDoc.id, "comments");
      const commentsSnapshot = await getDocs(commentsRef);
      for (const commentDoc of commentsSnapshot.docs) {
        await deleteDoc(doc(db, "posts", postDoc.id, "comments", commentDoc.id));
      }
      await deleteDoc(doc(db, "posts", postDoc.id));
    }
    //(`Posts and comments for user ${uid} deleted.`);

    const allPostsQuery = query(collection(db, "posts"));
    const allPostsSnapshot = await getDocs(allPostsQuery);
    for (const postDoc of allPostsSnapshot.docs) {
      const commentsRef = collection(db, "posts", postDoc.id, "comments");
      const commentsSnapshot = await getDocs(commentsRef);
      for (const commentDoc of commentsSnapshot.docs) {
        if (commentDoc.data().authorId === uid) {
          await deleteDoc(doc(db, "posts", postDoc.id, "comments", commentDoc.id));
        }
      }
    }
    //(`Comments by user ${uid} in other posts deleted.`);

    const mentorQuery = query(collection(db, "mentorship"), where("mentorId", "==", uid));
    const mentorSnapshot = await getDocs(mentorQuery);
    for (const msDoc of mentorSnapshot.docs) {
      await deleteDoc(doc(db, "mentorship", msDoc.id));
    }

    const participantQuery = query(collection(db, "mentorship"), where("participantId", "==", uid));
    const participantSnapshot = await getDocs(participantQuery);
    for (const msDoc of participantSnapshot.docs) {
      await deleteDoc(doc(db, "mentorship", msDoc.id));
    }
    //(`Mentorship relationships for user ${uid} deleted.`);

    return true;
  } catch (error) {
    console.error("Error in cascadeDeleteUser:", error);
    throw error;
  }
}

// Enhanced User Card Component
const UserCard = React.memo(({ user, isAdmin, onEdit, onDelete, onView }) => {
  const elementConfig = getElementConfig(user.element);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 relative group border border-slate-200 dark:border-slate-700"
    >

      {/* Admin Actions */}
      {isAdmin && (
        <div className="absolute top-6 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex flex-col gap-2 z-20">
          {user.role !== 'staff' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onView(user)}
              className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-colors backdrop-blur-sm"
              title="צפייה בפרופיל"
            >
              <FontAwesomeIcon icon={faEye} />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(user)}
            className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-colors backdrop-blur-sm"
            title="עריכה"
          >
            <FontAwesomeIcon icon={faEdit} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(user)}
            className="p-3 bg-red-600 text-white rounded-2xl shadow-lg hover:bg-red-700 transition-colors backdrop-blur-sm"
            title="מחיקה"
          >
            <FontAwesomeIcon icon={faTrash} />
          </motion.button>
        </div>
      )}

      <div className="p-8">
        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
              <img
                src={user.profile?.photoURL || "https://placehold.co/100x100/e2e8f0/64748b?text=User"}
                alt={user.username}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/100x100/e2e8f0/64748b?text=User";
                }}
              />
            </div>
           
          </div>
        </div>

        {/* User Info */}
        <div className="text-center space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate mb-2">
              {user.profile?.displayName || user.username}
            </h3>     
          </div>

        {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
              <span className="text-sm truncate">{user.email}</span>
            </div>
            {user.location && (
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                <span className="text-sm truncate">{user.location}</span>
              </div>
            )}
          </div>

          {/* Element Info for Participants */}
          {user.role === 'participant' && user.element && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${elementConfig.textColor} ${elementConfig.bgColor} dark:bg-opacity-20`}>
                {typeof elementConfig.emoji === 'string' ? (
                  <span>{elementConfig.emoji}</span>
                ) : (
                  <div className="w-4 h-4">
                    {elementConfig.emoji}
                  </div>
                )}
                <span>אלמנט {elementConfig.name}</span>
              </div>
            </div>
          )}

          {/* Bio Preview */}
          {user.profile?.bio && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {user.profile.bio}
              </p>
            </div>
          )}

          {/* Mentors Count for Participants */}
          {user.role === 'participant' && user.mentors && user.mentors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                <FontAwesomeIcon icon={faUserFriends} className="w-4 h-4" />
                <span className="text-sm font-medium">{user.mentors.length} מנטורים</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// Enhanced Stats Cards Component
const StatsCard = ({ title, value, icon, color, bgColor, subtitle }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    className={`${bgColor} dark:bg-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">{title}</p>
        <p className={`text-4xl font-bold ${color} mb-1`}>{value}</p>
        {subtitle && (
          <p className="text-slate-500 dark:text-slate-500 text-xs">{subtitle}</p>
        )}
      </div>
      <div className={`w-16 h-16 ${color.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20 rounded-2xl flex items-center justify-center`}>
        <FontAwesomeIcon icon={icon} className={`${color} text-2xl`} />
      </div>
    </div>
  </motion.div>
);

// Main User Management Component
const UserManagement = () => {
  const { user: currentUser, loading: userLoading } = useUser();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedElement, setSelectedElement] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    mentors: 0,
    participants: 0,
    byElement: {}
  });

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Fetch users
 const fetchUsers = useCallback(async () => {
  if (!currentUser) return;
  
  setLoading(true);
  try {
    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(usersQuery);
    
    // Extract user IDs for batch profile fetching
    const userIds = snapshot.docs.map(doc => doc.id);
    
    // Batch fetch all profiles in parallel (max 10 per batch due to Firestore limitations)
    const batchSize = 10;
    const profileBatches = [];
    
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batchIds = userIds.slice(i, i + batchSize);
      const batchPromises = batchIds.map(async (userId) => {
        try {
          const profileDoc = await getDoc(doc(db, "profiles", userId));
          return {
            id: userId,
            profile: profileDoc.exists() ? profileDoc.data() : null
          };
        } catch (error) {
          console.warn(`Could not fetch profile for user ${userId}:`, error);
          return { id: userId, profile: null };
        }
      });
      
      profileBatches.push(Promise.all(batchPromises));
    }
    
    // Wait for all profile batches to complete
    const profileResults = await Promise.all(profileBatches);
    const profileMap = new Map();
    
    // Flatten results and create a map for quick lookup
    profileResults.flat().forEach(result => {
      profileMap.set(result.id, result.profile);
    });
    
    // Process users with their profiles
    const fetchedUsers = [];
    const mentors = [];
    
    for (const docSnap of snapshot.docs) {
      const userData = { 
        id: docSnap.id, 
        ...docSnap.data(),
        profile: profileMap.get(docSnap.id) || null
      };
      
      fetchedUsers.push(userData);
      
      // Collect mentors for the dropdown
      if (userData.role === 'mentor') {
        mentors.push(userData);
      }
    }
    
    const nonStaff = fetchedUsers.filter(u => u.role !== 'staff');
    setUsers(nonStaff);
    setAvailableMentors(mentors);
    calculateStats(fetchedUsers);
    
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("שגיאה בטעינת המשתמשים");
  } finally {
    setLoading(false);
  }
}, [currentUser]);
  
  const handleUserProcessed = () => {
    fetchUsers(); // Refresh the main users list
  };

  // Calculate statistics
  const calculateStats = useCallback((usersList) => {
    const newStats = {
      total: usersList.length,
      admins: usersList.filter(u => u.role === 'admin').length,
      mentors: usersList.filter(u => u.role === 'mentor').length,
      participants: usersList.filter(u => u.role === 'participant').length,
      byElement: {}
    };

    // Calculate by element
    ELEMENTS.forEach(element => {
      newStats.byElement[element.key] = usersList.filter(u => u.element === element.key).length;
    });

    setStats(newStats);
  }, []);

  // Filter users
  const filterUsers = useMemo(() => {
    let filtered = users.filter(u => u.role !== 'staff');

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.profile?.displayName?.toLowerCase().includes(term) ||
        user.location?.toLowerCase().includes(term)
      );
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Element filter
    if (selectedElement !== 'all') {
      filtered = filtered.filter(user => user.element === selectedElement);
    }

    return filtered;
  }, [users, searchTerm, selectedRole, selectedElement]);

  // Save user changes
  const handleSaveUser = async (userId, formData) => {
    try {
      const userRef = doc(db, "users", userId);
      const profileRef = doc(db, "profiles", userId);

      // Update user document
      await updateDoc(userRef, {
        username: formData.username,
        email: formData.email,
        element: formData.element,
        location: formData.location,
        role: formData.role,
        mentors: formData.mentors || [],
        updatedAt: new Date()
      });

      // Update or create profile document
      await setDoc(profileRef, {
        displayName: formData.displayName || formData.username,
        bio: formData.bio || '',
        photoURL: formData.photoURL || '',
        updatedAt: new Date()
      }, { merge: true });

      toast.success("המשתמש עודכן בהצלחה");
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    setIsDeleteLoading(true);
    try {
      await cascadeDeleteUser(userId, db);
      toast.success("המשתמש נמחק בהצלחה");
      setDeletingUser(null);
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("שגיאה במחיקת המשתמש");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (!userLoading && currentUser) {
      fetchUsers();
    }
  }, [currentUser, userLoading, fetchUsers]);

  useEffect(() => {
    setFilteredUsers(filterUsers);
  }, [filterUsers]);

  // Show loading state
  if (userLoading || loading) {
    return (
          <ElementalLoader />
    );
  }

  // Show unauthorized message for non-admins
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faUserShield} className="text-red-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              אין הרשאה
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              אתה צריך הרשאות מנהל כדי לצפות בדף זה
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
                  ניהול משתמשים
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  נהל את כל המשתמשים במערכת
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <PendingUsersButton onUserProcessed={handleUserProcessed} />
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="סך הכל משתמשים"
              value={stats.total}
              icon={faUsers}
              color="text-blue-600"
              bgColor="bg-white"
              subtitle="משתמשים רשומים"
            />
            <StatsCard
              title="מנהלים"
              value={stats.admins}
              icon={faCrown}
              color="text-purple-600"
              bgColor="bg-white"
              subtitle="הרשאות מנהל"
            />
            <StatsCard
              title="מנטורים"
              value={stats.mentors}
              icon={faBullseye}
              color="text-indigo-600"
              bgColor="bg-white"
              subtitle="מנטורים פעילים"
            />
            <StatsCard
              title="משתתפים"
              value={stats.participants}
              icon={faStar}
              color="text-green-600"
              bgColor="bg-white"
              subtitle="משתתפים פעילים"
            />
          </div>

          {/* Element Statistics */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <FontAwesomeIcon icon={faFilter} className="text-blue-600" />
              התפלגות לפי אלמנטים
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {ELEMENTS.map(element => (
                <div key={element.key} className={`${element.bgColor} dark:bg-slate-700 rounded-2xl p-6 text-center`}>
                  <div className="text-3xl mb-2">
                    {typeof element.emoji === 'string' ? element.emoji : <AirIcon style={{color: '#87ceeb'}} />}
                  </div>
                  <div className={`text-2xl font-bold ${element.textColor} mb-1`}>
                    {stats.byElement[element.key] || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {element.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="חיפוש משתמשים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Filter className="h-5 w-5" />
                <span>מסננים</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Expandable Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Role Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">תפקיד</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">כל התפקידים</option>
                      {ROLES.map(role => (
                        <option key={role.key} value={role.key}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Element Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">אלמנט</label>
                    <select
                      value={selectedElement}
                      onChange={(e) => setSelectedElement(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">כל האלמנטים</option>
                      {ELEMENTS.map(element => (
                        <option key={element.key} value={element.key}>
                           {element.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Users Grid */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <UsersIcon className="h-6 w-6 text-blue-600" />
                משתמשים ({filteredUsers.length})
              </h2>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">
                  לא נמצאו משתמשים
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  נסה לשנות את הפילטרים או את מונחי החיפוש
                </p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      isAdmin={isAdmin}
                      onEdit={setEditingUser}
                      onDelete={setDeletingUser}
                      onView={setViewingUser}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {editingUser && (
            <EditUserModal
              user={editingUser}
              onClose={() => setEditingUser(null)}
              onSave={handleSaveUser}
              availableMentors={availableMentors}
            />
          )}

          {deletingUser && (
            <DeleteConfirmModal
              user={deletingUser}
              onConfirm={handleDeleteUser}
              onCancel={() => setDeletingUser(null)}
              isLoading={isDeleteLoading}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;