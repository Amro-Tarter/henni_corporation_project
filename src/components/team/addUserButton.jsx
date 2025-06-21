import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserClock } from 'react-icons/fa';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../config/firbaseConfig';
import PendingUsersModal from './PendingUsersModal';

const PendingUsersButton = ({ onUserProcessed }) => {
  const [showModal, setShowModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for users who are not active but have verified email
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('is_active', '==', false),
      where('is_email_verified', '==', true) // ✅ only verified users
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPendingCount(snapshot.docs.length);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error listening to pending users:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    if (onUserProcessed) {
      onUserProcessed(); // Refresh user list on modal close
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="relative px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 flex items-center gap-2 font-medium shadow-lg transition-all duration-200"
      >
        <FaUserClock className="text-lg" />
        <span>בקשות הצטרפות</span>
        {pendingCount > 0 && !isLoading && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {pendingCount > 99 ? '99+' : pendingCount}
          </motion.span>
        )}
      </motion.button>

      <PendingUsersModal
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </>
  );
};

export { PendingUsersButton };
