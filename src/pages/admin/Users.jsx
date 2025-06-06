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
  faSpinner,
  faUsers,
  faFilter,
  faSearch
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

// Enhanced User Card Component
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
      <div className={`h-2 bg-gradient-to-r ${elementConfig.gradient}`} />
      
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
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r ${elementConfig.gradient} flex items-center justify-center shadow-md border-2 border-white dark:border-slate-700`}>
              <FontAwesomeIcon
                icon={ELEMENT_ICONS[user.element] || faLeaf}
                className="text-white text-sm"
              />
            </div>
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
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className={elementConfig.color}>
              <FontAwesomeIcon icon={ELEMENT_ICONS[user.element] || faLeaf} />
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {elementConfig.label}
            </span>
          </div>

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

// Enhanced Filter Component
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

// Enhanced Empty State Component
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
    return users.filter(user => {
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
        querySnapshot.docs.map(async (doc) => {
          const userData = { id: doc.id, ...doc.data() };
          const profileSnap = await getDoc(doc(db, "profiles", doc.id));
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
    try {
      // Update user document
      await updateDoc(doc(db, "users", userId), {
        username: formData.username,
        email: formData.email,
        element: formData.element,
        location: formData.location,
        role: formData.role,
        mentors: formData.role === 'participant' ? (formData.mentors || []) : [],
        updatedAt: new Date(),
      });

      // Handle profile based on role
      const profileRef = doc(db, "profiles", userId);
      const profileSnap = await getDoc(profileRef);

      if (formData.role === "staff") {
        if (profileSnap.exists()) {
          await deleteDoc(profileRef);
        }
      } else {
        const profileData = {
          displayName: formData.displayName,
          bio: formData.bio,
          photoURL: formData.photoURL,
          role: formData.role,
          updatedAt: new Date(),
        };

        if (profileSnap.exists()) {
          await updateDoc(profileRef, profileData);
        } else {
          await setDoc(profileRef, {
            ...profileData,
            createdAt: new Date(),
          });
        }
      }

      toast.success("המשתמש עודכן בהצלחה");
      await fetchUsers();
    } catch (error) {
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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FontAwesomeIcon icon={faUsers} className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              קהילת משתמשי הניני
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              ניהול וצפייה בכל משתמשי המערכת
            </p>
          </div>
        </div>
        {isAdmin && <PendingUsersButton />}
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
          <ElementalLoader />
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
