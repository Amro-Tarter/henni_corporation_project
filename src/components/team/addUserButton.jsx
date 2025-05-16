import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaTimes } from 'react-icons/fa';

const AddUserForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    region: '',
    expertise: '',
    role: 'עובד',
    imageURL: '',
    social: {
      linkedin: '',
      twitter: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        social: { ...prev.social, [socialField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
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
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">הוספת איש צוות חדש</h2>
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
              ['first_name', 'שם פרטי'],
              ['last_name', 'שם משפחה']
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ['region', 'אזור'],
              ['expertise', 'תחום מומחיות']
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">תפקיד</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white dark:bg-slate-800 dark:text-white"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundPosition: "left 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingLeft: "2.5rem"
              }}
            >
              <option value="מנכ&quot;ל">מנכ"ל</option>
              <option value="עובד">עובד</option>
              <option value="מתנדב">מתנדב</option>
              <option value="מנטור">מנטור</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">קישור לתמונה</label>
            <input
              type="url"
              name="imageURL"
              value={formData.imageURL}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ['social.linkedin', 'LinkedIn'],
              ['social.twitter', 'Twitter']
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                <input
                  type="url"
                  name={field}
                  value={field === 'social.linkedin' ? formData.social.linkedin : formData.social.twitter}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                />
              </div>
            ))}
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
              הוסף איש צוות
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default function AddUserButton() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddUser = (userData) => {
    console.log('Adding new user:', userData);
    alert(`איש צוות חדש נוסף: ${userData.first_name} ${userData.last_name}`);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsFormOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow"
      >
        <FaUserPlus className="ml-2" />
        הוסף איש צוות
      </motion.button>

      <AnimatePresence>
        {isFormOpen && (
          <AddUserForm onClose={() => setIsFormOpen(false)} onSubmit={handleAddUser} />
        )}
      </AnimatePresence>
    </>
  );
}
