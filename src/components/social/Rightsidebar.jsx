// src/components/social/Rightsidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, Home, MessageSquare, Settings, User, LogOut, X
} from 'lucide-react';
import { collection, query, where, getDocs, doc as firestoreDoc, getDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '@/config/firbaseConfig';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

    // Query for conversations with unread messages
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
          if (conversation.unread && conversation.unread[user.uid]) {
            const unreadCount = conversation.unread[user.uid];
            totalUnread += unreadCount;

            try {
              // Get the last message
              const messagesQuery = query(
                collection(db, 'conversations', conversationDoc.id, 'messages'),
                orderBy('createdAt', 'desc'),
                limit(1)
              );
              
              const messagesSnapshot = await getDocs(messagesQuery);
              if (!messagesSnapshot.empty) {
                const lastMessage = messagesSnapshot.docs[0].data();
                
                // Get the sender's profile
                const senderId = lastMessage.sender;
                const senderProfileRef = firestoreDoc(db, 'profiles', senderId);
                const senderProfile = await getDoc(senderProfileRef);
                const senderData = senderProfile.exists() ? senderProfile.data() : null;

                // Get conversation name/type
                let conversationName = '';
                if (conversation.type === 'direct') {
                  conversationName = senderData?.username || 'Unknown User';
                } else if (conversation.type === 'group') {
                  conversationName = conversation.groupName || 'Group Chat';
                } else if (conversation.type === 'community') {
                  conversationName = conversation.element || 'Community';
                }

                notificationList.push({
                  id: conversationDoc.id,
                  type: 'message',
                  message: `${conversationName}: ${lastMessage.text || 'Sent a message'}`,
                  timestamp: lastMessage.createdAt,
                  conversationId: conversationDoc.id,
                  unreadCount: unreadCount,
                  conversationType: conversation.type
                });
              }
            } catch (error) {
              console.error('Error fetching message details:', error);
              // Continue with other conversations even if one fails
              continue;
            }
          }
        }

        // Sort notifications by timestamp
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
    }, (error) => {
      console.error('Error in notifications listener:', error);
      setNotifications([]);
      setUnreadCount(0);
    });

    return () => unsubscribe();
  }, [user]);

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

  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => setIsExpanded(false);

  const handleProfileClick = () => {
    if (user && userProfile?.username) {
      navigate(`/profile/${userProfile.username}`);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'message') {
      setShowNotifications(false);
      navigate(`/chat/${notification.conversationId}`);
    }
  };

  return (
    <motion.aside
      initial={{ width: 64 }}
      animate={{ width: isExpanded ? 256 : 64 }}
      transition={{ duration: 0.4 }}
      className="fixed top-[56.8px] bottom-0 right-0 bg-white shadow-lg z-40 flex flex-col overflow-hidden"
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
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15 }}
          onClick={() => setShowNotifications(!showNotifications)}
          className={`flex items-center gap-3 rounded-md px-3 py-2 w-full text-${element} hover:bg-${element}-soft transition-colors duration-200 ${
            showNotifications ? `bg-${element} text-white` : ''
          }`}
        >
          <span className="relative">
            <Bell size={20} />
            {!isExpanded && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-red-500 w-2 h-2" />
            )}
          </span>
          {isExpanded && (
            <span className="flex flex-1 justify-between font-medium overflow-hidden whitespace-nowrap transition-all duration-300">
              <span>התראות</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 text-white px-2 py-1 text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </span>
          )}
        </motion.button>

        {/* Notification Popup */}
        {showNotifications && (
          <div
            ref={notificationRef}
            className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto"
          >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-800">התראות</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {notification.timestamp?.toDate().toLocaleString('he-IL')}
                        </span>
                      </div>
                      {notification.unreadCount > 0 && (
                        <span className="ml-2 rounded-full bg-red-500 text-white px-2 py-0.5 text-xs">
                          {notification.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  אין התראות חדשות
                </div>
              )}
            </div>
          </div>
        )}

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
  );
};

export default Rightsidebar;
