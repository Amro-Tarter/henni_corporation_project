// src/components/social/Rightsidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, Home, MessageSquare, Settings, User, LogOut, X
} from 'lucide-react';
import { collection, query, where, getDocs, doc as firestoreDoc, getDoc, onSnapshot, orderBy, limit, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firbaseConfig';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NotificationsComponent from './NotificationsComponent';

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
  const navigate = useNavigate();
  const user = auth.currentUser;

  // Add state for profile pictures
  const [profilePictures, setProfilePictures] = useState({});
  
  // Use NotificationsComponent directly
  const { showNotifications, setShowNotifications, unreadCount, NotificationsModal } = NotificationsComponent();

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
                    src={profile.photoURL || '/images/default-avatar.png'}
                    alt={profile.username}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200 shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-avatar.png';
                    }}
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
                ${isExpanded ? "justify-start" : "justify-center"}
              `}
            >
              <span className="min-w-[24px] flex justify-center items-center relative">
                {tab.icon}
                {!isExpanded && tab.id === 'messenger' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-red-500 w-2 h-2" />
                )}
              </span>
              <span className={`
                font-medium overflow-hidden whitespace-nowrap transition-all duration-300
                ${isExpanded ? 'block opacity-100 max-w-[200px]' : 'hidden opacity-0 max-w-0'}
              `}>
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
          {/* Use Bell component directly instead of NotificationButton */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className={`flex items-center gap-3 rounded-md px-3 py-2 w-full text-${element} hover:bg-${element}-soft transition-colors duration-200 ${
              showNotifications ? `bg-${element} text-white` : ''
            } ${isExpanded ? '' : 'w-10'}`}
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/default-avatar.png';
                }}
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

      {/* Render the notifications modal from the component */}
      <NotificationsModal />
    </>
  );
};

export default Rightsidebar;
