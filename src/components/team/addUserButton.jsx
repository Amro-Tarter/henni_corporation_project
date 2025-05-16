import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaTimes } from 'react-icons/fa';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firbaseConfig';
import { useUser } from '../../hooks/useUser';

const AddUserForm = ({ onClose, onSubmit }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    // User fields
    associated_id: '',
    role: '',
    email: '',
    username: '',
    element: '',
    is_active: true,
    phone: '',
    location: '',
    // Profile fields
    displayName: '',
    bio: '',
    expertise: '',
    region: '',
    photoURL: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create user document
      const userRef = doc(db, 'users', formData.email);
      const userData = {
        associated_id: formData.associated_id,
        role: formData.role,
        email: formData.email,
        username: formData.username,
        element: formData.element,
        is_active: true,
        phone: formData.phone,
        location: formData.location,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        last_login: serverTimestamp(),
      };
      await setDoc(userRef, userData);

      // Create profile document
      const profileRef = doc(db, 'profiles', formData.email);
      const profileData = {
        associated_id: formData.associated_id,
        displayName: formData.displayName || formData.username,
        username: formData.username,
        element: formData.element,
        bio: formData.bio,
        location: formData.location,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: serverTimestamp(),
        photoURL: formData.photoURL,
        expertise: formData.expertise,
        region: formData.region,
      };
      await setDoc(profileRef, profileData);

      onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('שגיאה בהוספת משתמש. אנא נסה שוב.');
    }
  };

  // Only show the form if user is admin
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
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">הוספת משתמש חדש</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="סגור טופס"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ['email', 'אימייל'],
              ['username', 'שם משתמש'],
              ['displayName', 'שם תצוגה'],
              ['associated_id', 'מזהה מקושר'],
              ['phone', 'טלפון'],
              ['location', 'מיקום'],
              ['element', 'יסוד'],
              ['role', 'תפקיד'],
              ['expertise', 'תחום מומחיות'],
              ['region', 'אזור']
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                {field === 'role' ? (
                  <select
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="admin">מנהל</option>
                    <option value="user">משתמש</option>
                    <option value="editor">עורך</option>
                  </select>
                ) : (
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required={field !== 'associated_id' && field !== 'displayName'}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                  />
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ביוגרפיה</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">קישור לתמונה</label>
            <input
              type="url"
              name="photoURL"
              value={formData.photoURL}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg"
            >
              ביטול
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 shadow"
            >
              הוסף משתמש
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default function AddUserButton() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useUser();

  const handleAddUser = (userData) => {
    console.log('Adding new user:', userData);
    alert(`משתמש חדש נוסף: ${userData.username}`);
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
        onClick={() => setIsFormOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow"
      >
        <FaUserPlus className="ml-2" />
        הוסף משתמש
      </motion.button>

      <AnimatePresence>
        {isFormOpen && (
          <AddUserForm onClose={() => setIsFormOpen(false)} onSubmit={handleAddUser} />
        )}
      </AnimatePresence>
    </>
  );
}
