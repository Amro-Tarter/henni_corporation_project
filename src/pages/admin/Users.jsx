import React, { useState, useEffect, useCallback, useMemo } from "react";
import { collection, query, getDocs, orderBy, updateDoc, doc, deleteDoc, getDoc, where, setDoc } from "firebase/firestore";
import { db } from "../../config/firbaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire,
  faEdit,
  faTrash,
  faEye,
  faUserFriends,
  faTimes,
  faUsers,
  faFilter,
  faSave,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { Search, Filter, User, Users as UsersIcon, Shield, Zap, MapPin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PendingUsersButton from "../../components/team/addUserButton";
import { useUser } from "../../hooks/useUser";
import ElementalLoader from "@/theme/ElementalLoader";
import AirIcon from '@mui/icons-material/Air';
import CleanElementalOrbitLoader from '../../theme/ElementalLoader'

// Constants
const ELEMENT_OPTIONS = [
  { value: 'fire', label: 'אש', icon: '🔥', gradient: 'from-rose-700 via-amber-550 to-yellow-500', color: 'text-red-500' },
  { value: 'water', label: 'מים', icon: '💧', gradient: 'from-indigo-500 via-blue-400 to-teal-300', color: 'text-blue-500' },
  { value: 'earth', label: 'אדמה', icon: '🌱', gradient: 'from-lime-700 via-amber-600 to-stone-400', color: 'text-green-500' },
  { value: 'air', label: 'אוויר', icon: <AirIcon style={{color: '#87ceeb'}} />, color: 'from-blue-500 to-cyan-400', gradient: 'from-white via-sky-200 to-indigo-100', color: 'text-cyan-500' },
  { value: 'metal', label: 'מתכת', icon: '⚒️', gradient: 'from-zinc-300 via-slate-500 to-neutral-700', color: 'text-neutral-500' }
];

const ROLE_OPTIONS = [
  { value: 'admin', label: 'מנהל', icon: '👑', color: 'text-purple-600' },
  { value: 'mentor', label: 'מנטור', icon: '🎯', color: 'text-blue-600' },
  { value: 'participant', label: 'משתתף', icon: '🌟', color: 'text-green-600' },
  { value: 'staff', label: 'צוות', icon: '⚡', color: 'text-orange-600' }
];

const ELEMENT_ICONS = {
  fire: faFire,
  water: faWater,
  earth: faLeaf,
  air: faWind,
  metal: faHammer
};


const EditUserModal = ({ user, onClose, onSave, availableMentors }) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    element: user.element || '',
    location: user.location || '',
    role: user.role || 'participant',
    displayName: user.profile?.displayName || '',
    bio: user.profile?.bio || '',
    photoURL: user.profile?.photoURL || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const elementOptions = [
    { value: 'fire', label: 'אש' },
    { value: 'water', label: 'מים' },
    { value: 'earth', label: 'אדמה' },
    { value: 'air', label: 'אוויר' },
    { value: 'metal', label: 'מתכת' }
  ];

  const roleOptions = [
    { value: 'admin', label: 'מנהל' },
    { value: 'mentor', label: 'מנטור' },
    { value: 'participant', label: 'משתתף' },
    { value: 'staff', label: 'צוות' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(user.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
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
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto border border-slate-200"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faEdit} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                עריכת משתמש
              </h3>
              <p className="text-slate-500">{user.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">שם משתמש</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">שם תצוגה</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">אימייל</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.role === 'participant' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">אלמנט</label>
              <select
                value={formData.element}
                onChange={(e) => setFormData({...formData, element: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
              >
                <option value="">בחר אלמנט</option>
                {elementOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
           )}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">תפקיד</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">מיקום</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
            />
          </div>

          {formData.role === 'participant' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">מנטורים</label>
              <select
                multiple
                value={formData.mentors || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                  setFormData({ ...formData, mentors: selected });
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white min-h-[120px]"
              >
                {availableMentors.map(mentor => (
                  <option key={mentor.id} value={mentor.id} className="py-2">
                    {mentor.profile?.displayName || mentor.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">ביו</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white resize-none"
              placeholder="ספר על עצמך..."
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200 font-medium"
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

// Delete Confirmation Modal
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
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-red-200"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center ml-4">
            <FontAwesomeIcon icon={faTrash} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            אישור מחיקה
          </h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          האם אתה בטוח שברצונך למחוק את המשתמש <strong className="text-red-600">{user.username}</strong>?
          <br />
          <span className="text-sm text-red-500 font-medium">פעולה זו לא ניתנת לביטול ותמחק את כל הנתונים המשויכים.</span>
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={() => onConfirm(user.id)}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
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


async function cascadeDeleteUser(uid, db) {
  try {
    // Delete user document
    await deleteDoc(doc(db, "users", uid));
    console.log(`User ${uid} deleted from users collection.`);

    // Delete profile document
    await deleteDoc(doc(db, "profiles", uid));
    console.log(`Profile ${uid} deleted.`);

    // Delete all messages in conversations
    const messagesRef = collection(db, "conversations", uid, "messages");
    const messagesSnap = await getDocs(messagesRef);
    for (const msgDoc of messagesSnap.docs) {
      await deleteDoc(doc(db, "conversations", uid, "messages", msgDoc.id));
    }
    await deleteDoc(doc(db, "conversations", uid));
    console.log(`Messages for user ${uid} deleted.`);

    // Delete posts and their comments
    const postsQuery = query(collection(db, "posts"), where("authorId", "==", uid));
    const postsSnapshot = await getDocs(postsQuery);
    for (const postDoc of postsSnapshot.docs) {
      // Delete all comments for this post
      const commentsRef = collection(db, "posts", postDoc.id, "comments");
      const commentsSnapshot = await getDocs(commentsRef);
      for (const commentDoc of commentsSnapshot.docs) {
        await deleteDoc(doc(db, "posts", postDoc.id, "comments", commentDoc.id));
      }
      // Delete the post itself
      await deleteDoc(doc(db, "posts", postDoc.id));
    }
    console.log(`Posts and comments for user ${uid} deleted.`);

    // Delete comments by this user in other posts
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
    console.log(`Comments by user ${uid} in other posts deleted.`);

    // Delete mentorship relationships
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
    console.log(`Mentorship relationships for user ${uid} deleted.`);

    // Delete any other user-related data
    // Add more collections as needed

    return true;
  } catch (error) {
    console.error("Error in cascadeDeleteUser:", error);
    throw error;
  }
}

// Utility functions
const getElementConfig = (element) => {
  return ELEMENT_OPTIONS.find(opt => opt.value === element) || ELEMENT_OPTIONS[0];
};

const getRoleConfig = (role) => {
  return ROLE_OPTIONS.find(opt => opt.value === role) || ROLE_OPTIONS[2];
};

// User Card Component
const UserCard = React.memo(({ user, isAdmin, onEdit, onDelete, onView }) => {
  const elementConfig = getElementConfig(user.element);
  const roleConfig = getRoleConfig(user.role);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 relative group border border-slate-200 dark:border-slate-700"
    >
      {/* Element Header */}
      {user.role === 'participant' ? (
        <div className={`h-2 bg-gradient-to-r ${elementConfig.gradient}`} />
      ) : (
        <div className="h-2 bg-red-900" />
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <div className="absolute top-4 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex flex-col gap-2 z-20">
          {user.role !== 'staff' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onView(user)}
              className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors backdrop-blur-sm"
              title="צפייה בפרופיל"
            >
              <FontAwesomeIcon icon={faEye} size="sm" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(user)}
            className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-colors backdrop-blur-sm"
            title="עריכה"
          >
            <FontAwesomeIcon icon={faEdit} size="sm" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(user)}
            className="p-2.5 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-colors backdrop-blur-sm"
            title="מחיקה"
          >
            <FontAwesomeIcon icon={faTrash} size="sm" />
          </motion.button>
        </div>
      )}

      <div className="p-6">
        {/* Profile Picture */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
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
            {/* Element Badge */}
            {user.role === 'participant' && (
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r ${elementConfig.gradient} flex items-center justify-center shadow-md border-2 border-white dark:border-slate-700`}>
                <FontAwesomeIcon
                  icon={ELEMENT_ICONS[user.element] || faLeaf}
                  className="text-white text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="text-center space-y-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">
              {user.profile?.displayName || user.username}
            </h3>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleConfig.color} bg-opacity-10`}>
              <span>{roleConfig.icon}</span>
              <span>{roleConfig.label}</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-center gap-2">
              <Mail size={14} />
              <span className="truncate">{user.email}</span>
            </div>
            
            {user.location && (
              <div className="flex items-center justify-center gap-2">
                <MapPin size={14} />
                <span className="truncate">{user.location}</span>
              </div>
            )}
          </div>

          {/* Element Display */}
          {user.role === 'participant' && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className={elementConfig.color}>
                <FontAwesomeIcon icon={ELEMENT_ICONS[user.element] || faLeaf} />
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {elementConfig.label}
              </span>
            </div>
          )}

          {/* Role-specific Info */}
          {user.role === 'mentor' && user.mentorshipCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              <FontAwesomeIcon icon={faUserFriends} />
              <span>{user.mentorshipCount} חניכים</span>
            </div>
          )}

          {user.role === 'participant' && user.mentorProfiles?.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">מנטורים:</div>
              <div className="flex flex-wrap justify-center gap-1">
                {user.mentorProfiles.slice(0, 2).map((mentor, index) => (
                  <span
                    key={mentor.id}
                    className="inline-block px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-xs truncate max-w-20"
                    title={mentor.profile?.displayName || mentor.username}
                  >
                    {mentor.profile?.displayName || mentor.username}
                  </span>
                ))}
                {user.mentorProfiles.length > 2 && (
                  <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-xs">
                    +{user.mentorProfiles.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

UserCard.displayName = 'UserCard';

// Filter Component
const FilterPanel = React.memo(({ 
  searchTerm, 
  setSearchTerm, 
  elementFilter, 
  setElementFilter, 
  locationFilter, 
  setLocationFilter, 
  roleFilter, 
  setRoleFilter, 
  onClearFilters,
  resultCount 
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FontAwesomeIcon icon={faFilter} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">סינון וחיפוש</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {resultCount} משתמשים נמצאו
            </p>
          </div>
        </div>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-sm font-medium"
        >
          נקה הכל
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            חיפוש משתמשים
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="שם משתמש או שם תצוגה..."
              className="w-full px-4 py-3 pr-11 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-slate-800 dark:text-slate-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
          </div>
        </div>

        {/* Element Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            סינון לפי אלמנט
          </label>
          <select
            value={elementFilter}
            onChange={(e) => setElementFilter(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="">כל האלמנטים</option>
            {ELEMENT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            סינון לפי מיקום
          </label>
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="הזן מיקום..."
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Role Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            סינון לפי תפקיד
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="">כל התפקידים</option>
            {ROLE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

// Empty State Component
const EmptyState = React.memo(({ hasFilters, onClearFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <FontAwesomeIcon icon={faUsers} className="text-4xl text-slate-400" />
    </div>
    <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
      {hasFilters ? 'לא נמצאו משתמשים' : 'אין משתמשים להצגה'}
    </h3>
    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
      {hasFilters 
        ? 'נסה לשנות את פרמטרי החיפוש או לנקות את הסינון'
        : 'עדיין לא נוספו משתמשים למערכת'
      }
    </p>
    {hasFilters && (
      <button
        onClick={onClearFilters}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium shadow-lg"
      >
        נקה סינון
      </button>
    )}
  </motion.div>
));

EmptyState.displayName = 'EmptyState';

// Main Users Component
function Users() {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [elementFilter, setElementFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [availableMentors, setAvailableMentors] = useState([]);
  
  const { user: currentUser } = useUser();

  // Memoized computed values
  const isAdmin = useMemo(() => 
    currentUser?.isAdmin || currentUser?.role === 'admin', 
    [currentUser]
  );

 const displayedUsers = useMemo(() => {
  return users
    .filter(user => user.role !== "staff") 
    .filter(user => {
      const matchesSearch = !searchTerm || 
        (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.profile?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesElement = !elementFilter || user.element === elementFilter;
      const matchesLocation = !locationFilter || 
        (user.location?.toLowerCase().includes(locationFilter.toLowerCase()));
      const matchesRole = !roleFilter || user.role === roleFilter;
      
      return matchesSearch && matchesElement && matchesLocation && matchesRole;
    });
}, [users, searchTerm, elementFilter, locationFilter, roleFilter]);


  const hasActiveFilters = useMemo(() => 
    searchTerm || elementFilter || locationFilter || roleFilter,
    [searchTerm, elementFilter, locationFilter, roleFilter]
  );

  // Optimized data fetching
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const usersData = [];

      // Batch all profile fetches
      const profilePromises = querySnapshot.docs.map(async (userDoc) => {
        const userData = { id: userDoc.id, ...userDoc.data() };
        
        try {
          // Fetch profile data
          const profileSnap = await getDoc(doc(db, "profiles", userDoc.id));
          if (profileSnap.exists()) {
            userData.profile = profileSnap.data();
          }

          // Fetch role-specific data
          if (userData.role === 'mentor') {
            const mentorQuery = query(collection(db, "mentorship"), where("mentorId", "==", userDoc.id));
            const mentorSnapshot = await getDocs(mentorQuery);
            userData.mentorshipCount = mentorSnapshot.size;
          }

          if (userData.role === 'participant' && userData.mentors?.length > 0) {
            const mentorProfiles = await Promise.all(
              userData.mentors.map(async (mentorId) => {
                const mentorDoc = await getDoc(doc(db, "users", mentorId));
                if (mentorDoc.exists()) {
                  const mentorProfile = await getDoc(doc(db, "profiles", mentorId));
                  return {
                    id: mentorId,
                    ...mentorDoc.data(),
                    profile: mentorProfile.exists() ? mentorProfile.data() : null
                  };
                }
                return null;
              })
            );
            userData.mentorProfiles = mentorProfiles.filter(Boolean);
          }

        } catch (error) {
          console.error(`Error fetching data for user ${userDoc.id}:`, error);
        }

        return userData;
      });

      const resolvedUsers = await Promise.all(profilePromises);
      setUsers(resolvedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("שגיאה בטעינת המשתמשים");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available mentors
  const fetchAvailableMentors = useCallback(async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "mentor"));
      const querySnapshot = await getDocs(q);
      const mentors = await Promise.all(
        querySnapshot.docs.map(async (mentorDoc) => {
          const userData = { id: mentorDoc.id, ...mentorDoc.data() };
          const profileSnap = await getDoc(doc(db, "profiles", mentorDoc.id));
          if (profileSnap.exists()) {
            userData.profile = profileSnap.data();
          }
          return userData;
        })
      );
      setAvailableMentors(mentors);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  }, []);

  // Event handlers
  const handleSaveUser = useCallback(async (userId, formData) => {
    const userRef = doc(db, "users", userId);

    try {
      // 1) Fetch current data so we know the old role
      const userSnap = await getDoc(userRef);
      const oldRole = userSnap.data()?.role;

      // 2) Update all the common fields in one shot
      await updateDoc(userRef, {
        username: formData.username,
        email:    formData.email,
        element: formData.role === 'participant'
           ? formData.element
           : '',        location: formData.location,
        role:     formData.role,
        updatedAt: new Date(),
        // if switching to participant, write their selected mentors
        mentors: formData.role === 'participant' ? (formData.mentors || []) : [],
        // always clear bio/displayName/photoURL in the user doc itself
        bio: formData.role === 'staff' ? '' : formData.bio,
        displayName: formData.role === 'staff' ? '' : formData.displayName,
        photoURL: formData.role === 'staff' ? '' : formData.photoURL,
      });
      // 3) Now enforce the “empty array” rule whenever the role flips
      if (oldRole !== formData.role) {
        if (formData.role === 'mentor') {
          // newly a mentor → ensure a participants field exists
          await updateDoc(userRef, { participants: [] });
        }
        else if (formData.role === 'participant') {
          // newly a participant → ensure a mentors field exists (we already seeded it above), and remove any stray participants property
          await updateDoc(userRef, { mentors: formData.mentors || [], participants: [] });
        }
        else {
          // any other role: drop both arrays
          await updateDoc(userRef, { mentors: [], participants: [] });
        }
      }

      // 4) Profile logic (unchanged) …
      const profileRef = doc(db, "profiles", userId);
      const profileSnap = await getDoc(profileRef);
      if (formData.role === "staff") {
        if (profileSnap.exists()) await deleteDoc(profileRef);
      } else {
        const data = {
          displayName: formData.displayName,
          bio:         formData.bio,
          photoURL:    formData.photoURL,
          role:        formData.role,
          updatedAt:   new Date(),
        };
        if (profileSnap.exists()) await updateDoc(profileRef, data);
        else              await setDoc(profileRef, { ...data, createdAt: new Date() });
      }

      toast.success("המשתמש עודכן בהצלחה");
      await fetchUsers();
    }
    catch (error) {
      console.error("Error updating user:", error);
      toast.error("שגיאה בעדכון המשתמש");
      throw error;
    }
  }, [fetchUsers]);


  const handleDeleteUser = useCallback(async (userId) => {
    setIsDeleting(true);
    try {
      // Import the cascadeDeleteUser function (assumed to be available)
      await cascadeDeleteUser(userId, db);

      toast.success("המשתמש נמחק בהצלחה");
      setUsers(prev => prev.filter(u => u.id !== userId));
      setDeletingUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("שגיאה במחיקת המשתמש");
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setElementFilter("");
    setLocationFilter("");
    setRoleFilter("");
  }, []);

  const handleViewUser = useCallback((user) => {
    // Navigate to user profile - implement based on your routing
    window.open(`/profile/${user.id}`, '_blank');
  }, []);

  // Effects
  useEffect(() => {
    fetchUsers();
    fetchAvailableMentors();
  }, [fetchUsers, fetchAvailableMentors]);
  if (loading) return <CleanElementalOrbitLoader/>;

  return (
    <DashboardLayout>
      {/* Header */}
    <div className="flex justify-center items-center mb-8 relative">
      {isAdmin && (
        <div className="absolute left-0">
          <PendingUsersButton />
        </div>
      )}
      <div className="flex flex-col items-center gap-4">
        <div className="p-6 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent leading-[1.5] px-4">
              קהילת משתמשי העמותה
            </h1>
          </motion.div>
        </div>
      </div>
    </div>


      {/* Filters */}
      <FilterPanel
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        elementFilter={elementFilter}
        setElementFilter={setElementFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        onClearFilters={clearFilters}
        resultCount={displayedUsers.length}
      />
  

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
        </div>
      ) : displayedUsers.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isAdmin={isAdmin}
                onEdit={setEditingUser}
                onDelete={setDeletingUser}
                onView={handleViewUser}
              />
            ))}
            
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      )}

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
      </AnimatePresence>

      <AnimatePresence>
        {deletingUser && (
          <DeleteConfirmModal
            user={deletingUser}
            onConfirm={handleDeleteUser}
            onCancel={() => setDeletingUser(null)}
            isLoading={isDeleting}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
export default Users;
