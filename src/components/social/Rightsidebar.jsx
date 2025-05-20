// src/components/social/Rightsidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, Home, MessageSquare, Settings, User, LogOut, X
} from 'lucide-react';
import { collection, query, where, getDocs, doc as firestoreDoc, getDoc, onSnapshot, orderBy, limit, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firbaseConfig';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NotificationButton from './NotificationButton';

const tabs = [
  { id: 'home', icon: <Home size={20} />, label: 'דף הבית', route: '/home' },
  { id: 'messenger', icon: <MessageSquare size={20} />, label: 'הודעות', route: '/chat' },
  { id: 'settings', icon: <Settings size={20} />, label: 'הגדרות', route: '/settings' },
];

const Rightsidebar = ({ element, onExpandChange }) => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [searchResults, setSearchResults] = useState([]);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const user = auth.currentUser;

  // Add state for profile pictures
  const [profilePictures, setProfilePictures] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const profileRef = firestoreDoc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const userData = profileSnap.data();
          setUserPhotoURL(userData.photoURL);
          setUserProfile(userData);
        }
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const tab = tabs.find(t => path.startsWith(t.route));
    if (tab) {
      setActiveTab(tab.id);
    }
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchInput) {
        setSearchResults([]);
        return;
      }
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, 'profiles'),
            where('username', '>=', searchInput),
            where('username', '<=', searchInput + '\uf8ff')
          )
        );
        const results = querySnapshot.docs.map((doc) => doc.data());
        setSearchResults(results);
      } catch (err) {
        console.error('Error fetching profiles:', err);
      }
    };
    fetchSearchResults();
  }, [searchInput]);

  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(isExpanded);
    }
  }, [isExpanded, onExpandChange]);

  useEffect(() => {
    if (!user) return;

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
      try {
        const notificationList = [];
        let totalUnread = 0;

        for (const conversationDoc of snapshot.docs) {
          const conversation = conversationDoc.data();
          
          // Handle group addition notification
          if (conversation.type === 'group') {
            const groupRef = firestoreDoc(db, 'conversations', conversationDoc.id);
            const groupDoc = await getDoc(groupRef);
            const groupData = groupDoc.data();
            
            // Check if user was recently added to the group
            if (groupData && groupData.participants?.includes(user.uid) && 
                groupData.lastUpdated && 
                groupData.lastUpdated.toDate() > new Date(Date.now() - 24 * 60 * 60 * 1000)) { // Within last 24 hours
              const adminDoc = await getDoc(firestoreDoc(db, 'users', groupData.admin));
              const adminName = adminDoc.exists() ? adminDoc.data().username : 'Unknown';
              
              notificationList.push({
                id: `${conversationDoc.id}_added`,
                type: 'group_added',
                message: `הוספת אותך לקבוצה ${groupData.groupName || 'קבוצה חדשה'}`,
                timestamp: groupData.lastUpdated || groupData.createdAt,
                conversationId: conversationDoc.id,
                senderId: groupData.admin,
                senderName: adminName,
                conversationName: groupData.groupName,
                unreadCount: 1,
                conversationType: 'group'
              });
              totalUnread++;
            }
          }

          // Handle unread messages
          if (conversation.unread && conversation.unread[user.uid] > 0) {
            const unreadCount = conversation.unread[user.uid];
            totalUnread += unreadCount;

            try {
              const messagesQuery = query(
                collection(db, 'conversations', conversationDoc.id, 'messages'),
                orderBy('createdAt', 'desc')
              );
              
              const messagesSnapshot = await getDocs(messagesQuery);
              if (!messagesSnapshot.empty) {
                let conversationName = '';
                
                if (conversation.type === 'direct') {
                  const partnerUid = conversation.participants.find(p => p !== user.uid);
                  const partnerDoc = await getDoc(firestoreDoc(db, 'users', partnerUid));
                  conversationName = partnerDoc.exists() ? partnerDoc.data().username : 'Unknown';
                } else if (conversation.type === 'group') {
                  conversationName = conversation.groupName || 'קבוצה';
                } else if (conversation.type === 'community') {
                  conversationName = conversation.element || 'קהילה';
                }

                const messages = messagesSnapshot.docs
                  .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                  }))
                  .filter(msg => msg.sender !== user.uid)
                  .slice(0, unreadCount);

                const senderIds = [...new Set(messages.map(msg => msg.sender))];
                const senderDocs = await Promise.all(
                  senderIds.map(id => getDoc(firestoreDoc(db, 'users', id)))
                );
                const senderNames = Object.fromEntries(
                  senderIds.map((id, index) => [
                    id,
                    senderDocs[index].exists() ? senderDocs[index].data().username : 'Unknown'
                  ])
                );

                for (const message of messages) {
                  let displayName = senderNames[message.sender];
                  
                  if (conversation.type === 'group' || conversation.type === 'community') {
                    displayName = `${displayName} (${conversationName})`;
                  }

                  notificationList.push({
                    id: `${conversationDoc.id}_${message.id}`,
                    type: 'message',
                    message: message.text || 'Sent a message',
                    timestamp: message.createdAt,
                    conversationId: conversationDoc.id,
                    senderId: message.sender,
                    senderName: displayName,
                    conversationName: conversationName,
                    unreadCount: 1,
                    conversationType: conversation.type
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching message details:', error);
              continue;
            }
          }
        }

        notificationList.sort((a, b) => {
          const timeA = a.timestamp?.toMillis?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || 0;
          return timeB - timeA;
        });
        
        setNotifications(notificationList);
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error processing notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Add effect to fetch profile pictures
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

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleTabClick = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTab(tabId);
      navigate(tab.route);
    }
  };

  // Prevent sidebar expansion when notifications are open
  const handleMouseEnter = () => {
    if (!showNotifications) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!showNotifications) {
      setIsExpanded(false);
    }
  };

  const handleProfileClick = () => {
    if (user && userProfile?.username) {
      navigate(`/profile/${userProfile.username}`);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.type === 'message' || notification.type === 'group_added') {
      try {
        const conversationRef = firestoreDoc(db, 'conversations', notification.conversationId);
        
        if (notification.type === 'group_added') {
          // Mark group notification as seen
          await updateDoc(conversationRef, {
            [`seenNotifications.${user.uid}`]: true
          });
        } else {
          // Mark messages as read
          await updateDoc(conversationRef, {
            [`unread.${user.uid}`]: 0
          });
        }

        // Remove the notification from local state
        setNotifications(prevNotifications => 
          prevNotifications.filter(n => n.id !== notification.id)
        );

        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Close notification panel
        setShowNotifications(false);

        // Navigate to chat
        navigate(`/chat/${notification.conversationId}`);
      } catch (error) {
        console.error('Error handling notification click:', error);
      }
    }
  };

  return (
    <>
      <motion.aside
        initial={{ width: 64 }}
        animate={{ width: isExpanded ? 256 : 64 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-[56.8px] bottom-0 right-0 bg-white shadow-lg z-40 flex flex-col overflow-hidden ${
          showNotifications ? 'pointer-events-none opacity-50' : ''
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <form onSubmit={handleSearch} className={`px-2 pt-4 ${isExpanded ? 'px-4' : ''} transition-all`}>
          <div className="relative">
            <input
              type="text"
              placeholder="חפש..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`
                ${isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0'}
                rounded-full border border-${element}-accent
                bg-${element}-soft px-4 py-2 pr-10 text-${element}
                placeholder-${element}-accent focus:border-${element}
                focus:outline-none transition-all duration-300
              `}
            />
            {!isSearching ? (
              <button
                type="submit"
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-${element}-accent`}
              >
                <Search size={18} />
              </button>
            ) : (
              <div
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-${element}-accent border-t-transparent`}
              />
            )}
          </div>
        </form>

        {searchInput && searchResults.length > 0 && isExpanded && (
          <div className="px-4 overflow-x-hidden">
            <h3 className="font-semibold text-sm text-gray-600 mt-2">תוצאות חיפוש</h3>
            <ul className="list-none mt-2 divide-y divide-gray-200">
              {searchResults.map((profile, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer transition"
                  onClick={() => {
                    setSearchInput('');
                    navigate(`/profile/${profile.username}`);
                  }}
                >
                  <img
                    src={profile.photoURL || '/default-avatar.png'}
                    alt={profile.username}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200 shadow-sm"
                  />
                  <span className="text-sm text-gray-800 font-medium truncate">{profile.username}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <nav className={`flex-1 py-6 space-y-2 overflow-y-auto ${isExpanded ? 'px-4' : 'px-2'}`}>
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex items-center gap-3 rounded-md px-3 py-2 w-full
                text-${element} hover:bg-${element}-soft transition-colors duration-200
                ${activeTab === tab.id ? `bg-${element} text-white` : ''}
              `}
            >
              <span className="min-w-[24px] flex justify-between items-center relative">
                {tab.icon}
                {!isExpanded && tab.id === 'messenger' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-red-500 w-2 h-2" />
                )}
              </span>
              <span className={`flex flex-1 justify-between font-medium overflow-hidden whitespace-nowrap transition-all duration-300
                ${isExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
                <span>{tab.label}</span>
                {isExpanded && tab.id === 'messenger' && unreadCount > 0 && (
                  <span className="rounded-full bg-red-500 text-white px-2 py-1 text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
            </motion.button>
          ))}
        </nav>

        <div className={`pb-6 space-y-2 ${isExpanded ? 'px-4' : 'px-2'} relative`}>
          <NotificationButton
            element={element}
            unreadCount={unreadCount}
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            className={isExpanded ? '' : 'w-10'}
          />

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
            onClick={handleProfileClick}
            className={`flex items-center gap-3 rounded-md px-3 py-2 w-full text-${element} hover:bg-${element}-soft transition-colors duration-200 ${
              activeTab === 'profile' ? `bg-${element} text-white` : ''
            }`}
          >
            {userPhotoURL ? (
              <img
                src={userPhotoURL}
                alt="Profile"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <User size={20} />
            )}
            {isExpanded && (
              <span className="font-medium overflow-hidden whitespace-nowrap transition-all duration-300">
                פרופיל
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
            onClick={handleLogout}
            className={`flex items-center gap-3 rounded-md px-3 py-2 w-full text-${element} hover:bg-${element}-soft transition-colors duration-200`}
          >
            <LogOut size={20} />
            {isExpanded && (
              <span className="font-medium overflow-hidden whitespace-nowrap transition-all duration-300">
                התנתק
              </span>
            )}
          </motion.button>
        </div>
      </motion.aside>

      {/* Notification Modal */}
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
                      onClick={() => handleNotificationClick(notification)}
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
    </>
  );
};

export default Rightsidebar;
