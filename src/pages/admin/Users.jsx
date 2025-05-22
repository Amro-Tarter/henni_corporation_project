import React, { useState, useEffect } from "react";
import { collection, query, getDocs, where, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
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
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Search, Filter, User, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import PendingUsersButton from "../../components/team/addUserButton"; // Import your button component
import { useUser } from "../../hooks/useUser";

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onSave }) => {
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
    { value: 'family', label: 'משפחה' }
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            עריכת משתמש: {user.username}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">שם משתמש</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">שם תצוגה</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">אלמנט</label>
              <select
                value={formData.element}
                onChange={(e) => setFormData({...formData, element: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">בחר אלמנט</option>
                {elementOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">תפקיד</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">מיקום</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">תמונת פרופיל (URL)</label>
            <input
              type="url"
              value={formData.photoURL}
              onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ביו</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
              ) : (
                <FontAwesomeIcon icon={faSave} className="ml-2" />
              )}
              שמור
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
          אישור מחיקה
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          האם אתה בטוח שברצונך למחוק את המשתמש <strong>{user.username}</strong>?
          פעולה זו לא ניתנת לביטול.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={() => onConfirm(user.id)}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
            ) : (
              <FontAwesomeIcon icon={faTrash} className="ml-2" />
            )}
            מחק
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [elementFilter, setElementFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user: currentUser } = useUser();

  const elementGradients = {
    fire: 'bg-gradient-to-r from-rose-700 via-amber-550 to-yellow-500',
    water: 'bg-gradient-to-r from-indigo-500 via-blue-400 to-teal-300',
    earth: 'bg-gradient-to-r from-lime-700 via-amber-600 to-stone-400',
    air: 'bg-gradient-to-r from-white via-sky-200 to-indigo-100',
    metal: 'bg-gradient-to-r from-zinc-300 via-slate-00 to-neutral-700',
  };

  const elementIcons = {
    fire: faFire,
    water: faWater,
    earth: faLeaf,
    air: faWind,
    metal: faHammer
  };

  const elementColors = {
    fire: 'text-red-500',
    water: 'text-blue-500',
    earth: 'text-green-500',
    air: 'text-cyan-500',
    metal: 'text-neutral-500'
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes float {
        0% { transform: translateY(0) rotate(0deg) scale(1); }
        50% { transform: translateY(-25px) rotate(8deg) scale(1.05); }
        100% { transform: translateY(0) rotate(0deg) scale(1); }
      }
      .animate-float-1 { animation: float 8s ease-in-out infinite; }
      .animate-float-2 { animation: float 9s ease-in-out 1s infinite; }
      .animate-float-3 { animation: float 10s ease-in-out 2s infinite; }
      .animate-float-4 { animation: float 11s ease-in-out 3s infinite; }
      .animate-float-5 { animation: float 12s ease-in-out 4s infinite; }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "users"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const usersData = [];
      
      // Get all user documents
      for (const doc of querySnapshot.docs) {
        const userData = { id: doc.id, ...doc.data() };
        
        // Get profile document for each user
        try {
          const profileQuery = query(
            collection(db, "profiles"),
            where("associated_id", "==", doc.id)
          );
          const profileSnapshot = await getDocs(profileQuery);
          
          if (!profileSnapshot.empty) {
            userData.profile = profileSnapshot.docs[0].data();
            userData.profileId = profileSnapshot.docs[0].id;
          }
          
          usersData.push(userData);
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      }
      
      setUsers(usersData);
      setDisplayedUsers(usersData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("אירעה שגיאה בטעינת המשתמשים");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term, element filter, and location filter
    const filtered = users.filter(user => {
      const matchesSearch = searchTerm === "" || 
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.profile?.displayName && user.profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesElement = elementFilter === "" || user.element === elementFilter;
      
      const matchesLocation = locationFilter === "" || 
        (user.location && user.location.toLowerCase().includes(locationFilter.toLowerCase()));
      
      return matchesSearch && matchesElement && matchesLocation;
    });
    
    setDisplayedUsers(filtered);
  }, [searchTerm, elementFilter, locationFilter, users]);

  const handleSaveUser = async (userId, formData) => {
    try {
      // Update user document
      await updateDoc(doc(db, "users", userId), {
        username: formData.username,
        email: formData.email,
        element: formData.element,
        location: formData.location,
        role: formData.role,
        updatedAt: new Date()
      });

      // Update profile document if it exists
      const user = users.find(u => u.id === userId);
      if (user?.profileId) {
        await updateDoc(doc(db, "profiles", user.profileId), {
          displayName: formData.displayName,
          bio: formData.bio,
          photoURL: formData.photoURL,
          updatedAt: new Date()
        });
      }

      toast.success("המשתמש עודכן בהצלחה");
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("אירעה שגיאה בעדכון המשתמש");
      throw error;
    }
  };

  const handleDeleteUser = async (userId) => {
    setIsDeleting(true);
    try {
      const user = users.find(u => u.id === userId);
      
      // Delete user document
      await deleteDoc(doc(db, "users", userId));
      
      // Delete profile document if it exists
      if (user?.profileId) {
        await deleteDoc(doc(db, "profiles", user.profileId));
      }

      toast.success("המשתמש נמחק בהצלחה");
      setUsers(users.filter(u => u.id !== userId));
      setDeletingUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("אירעה שגיאה במחיקת המשתמש");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setElementFilter("");
    setLocationFilter("");
  };

  const isAdmin = currentUser?.isAdmin || currentUser?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="w-full max-w-6xl mx-auto bg-white backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-8 z-10">
        {/* Header with Pending Users Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">קהילת משתמשי הניני</h2>
          {isAdmin && <PendingUsersButton />}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">חיפוש משתמשים</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חפש לפי שם משתמש..."
                className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סנן לפי אלמנט</label>
            <div className="relative">
              <select
                value={elementFilter}
                onChange={(e) => setElementFilter(e.target.value)}
                className={`appearance-none rounded-md w-full px-3 py-3 pr-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right ${elementGradients[elementFilter] || "bg-white"}`}
              >
                <option value="">כל האלמנטים</option>
                <option value="fire">אש</option>
                <option value="water">מים</option>
                <option value="earth">אדמה</option>
                <option value="air">אוויר</option>
                <option value="metal">מתכת</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">סנן לפי מיקום</label>
            <div className="relative">
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="הזן מיקום..."
                className="appearance-none rounded-md w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
              />
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={clearFilters}
              className="py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              נקה סינון
            </button>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : displayedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedUsers.map((user) => (
              <motion.div
                key={user.username}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative group"
              >
                <div className={`h-4 ${elementGradients[user.element] || "bg-gray-300"}`}></div>
                
                {/* Action Buttons - Only visible for admins */}
                {isAdmin && (
                  <div className="absolute top-6 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1 z-10">
                    <Link
                      to={`/profile/${user.id}`}
                      className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                      title="צפייה בפרופיל"
                    >
                      <FontAwesomeIcon icon={faEye} size="sm" />
                    </Link>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors"
                      title="עריכה"
                    >
                      <FontAwesomeIcon icon={faEdit} size="sm" />
                    </button>
                    <button
                      onClick={() => setDeletingUser(user)}
                      className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors"
                      title="מחיקה"
                    >
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </button>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                      <img 
                        src={user.profile?.photoURL || "/api/placeholder/100/100"} 
                        alt={user.username} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/100/100";
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">{user.profile?.displayName || user.username}</h3>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mt-1">
                      <User size={14} />
                      <span>{user.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <FontAwesomeIcon 
                        icon={elementIcons[user.element] || faLeaf} 
                        className={`${elementColors[user.element] || "text-gray-400"}`} 
                      />
                      <span className="text-sm capitalize">
                        {user.element === "fire" && "אש"}
                        {user.element === "water" && "מים"}
                        {user.element === "earth" && "אדמה"}
                        {user.element === "air" && "אוויר"}
                        {user.element === "metal" && "מתכת"}
                        {!user.element && "לא מוגדר"}
                      </span>
                    </div>
                    
                    {user.location && (
                      <p className="text-sm text-gray-500 mt-1">{user.location}</p>
                    )}
                    
                    {user.profile?.followersCount > 0 && (
                      <div className="flex items-center justify-center gap-1 mt-2 text-sm text-indigo-600">
                        <Star size={14} />
                        <span>{user.profile.followersCount} עוקבים</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔎</div>
            <h3 className="text-xl font-medium text-gray-700">לא נמצאו משתמשים</h3>
            <p className="text-gray-500">נסה לשנות את פרמטרי החיפוש שלך</p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={handleSaveUser}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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