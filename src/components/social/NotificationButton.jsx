import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';

const NotificationButton = ({ element, unreadCount, notifications, onNotificationClick, className = '' }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [profilePictures, setProfilePictures] = useState({});
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchProfilePictures = async () => {
      const pictures = {};
      for (const notification of notifications) {
        if (notification.type === 'message') {
          try {
            const senderProfileRef = firestoreDoc(db, 'profiles', notification.senderId);
            const senderProfile = await getDoc(senderProfileRef);
            if (senderProfile.exists()) {
              pictures[notification.senderId] = senderProfile.data().photoURL;
            }
          } catch (error) {
            console.error('Error fetching profile picture:', error);
          }
        }
      }
      setProfilePictures(pictures);
    };

    if (notifications.length > 0) {
      fetchProfilePictures();
    }
  }, [notifications]);

  // Add effect to handle body scroll lock
  useEffect(() => {
    if (showNotifications) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Add styles to body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Cleanup function
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showNotifications]);

  // Handle click outside
  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      setShowNotifications(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showNotifications) {
        setShowNotifications(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showNotifications]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.15 }}
        onClick={() => setShowNotifications(!showNotifications)}
        className={`flex items-center gap-3 rounded-md px-3 py-2 w-full text-${element} hover:bg-${element}-soft transition-colors duration-200 ${
          showNotifications ? `bg-${element} text-white` : ''
        } ${className}`}
      >
        <span className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 rounded-full bg-red-500 w-2 h-2" />
          )}
        </span>
        <span className="flex flex-1 justify-between font-medium overflow-hidden whitespace-nowrap transition-all duration-300">
          <span>התראות</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 text-white px-2 py-1 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
      </motion.button>

      {/* Notification Modal */}
      <AnimatePresence>
        {showNotifications && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={handleBackdropClick}
            role="presentation"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              ref={notificationRef}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col relative"
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-xl">
                <h3 className="text-xl font-semibold text-gray-800">התראות</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="סגור התראות"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto" dir="rtl">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          onNotificationClick(notification);
                          setShowNotifications(false);
                        }}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-4"
                      >
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                          <img
                            src={profilePictures[notification.senderId] || '/default-avatar.png'}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-base text-gray-800 font-medium mb-1">
                                {notification.senderName}
                              </p>
                              <p className="text-sm text-gray-700 mb-1">
                                {notification.message}
                              </p>
                              <span className="text-sm text-gray-500">
                                {notification.timestamp?.toDate().toLocaleString('he-IL', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {notification.unreadCount > 0 && (
                              <span className="flex-shrink-0 rounded-full bg-red-500 text-white px-3 py-1 text-sm font-medium">
                                {notification.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-4">🔔</div>
                    <p className="text-lg">אין התראות חדשות</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  סגור
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationButton; 