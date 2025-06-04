// src/components/social/Rightsidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, Home, MessageSquare, Settings, User, LogOut, X
} from 'lucide-react';
import { collection, query, where, getDocs, doc as firestoreDoc, getDoc, onSnapshot, orderBy, limit, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firbaseConfig';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotifications } from './NotificationsComponent';

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
  const [userElement, setUserElement] = useState('fire'); // Default to fire
  const navigate = useNavigate();
  const user = auth.currentUser;

  // Add state for profile pictures
  const [profilePictures, setProfilePictures] = useState({});

  // Use shared notifications context
  const { showNotifications, setShowNotifications, unreadCount, messageUnreadCount, loading } = useNotifications();

  // Normalize text for better Hebrew searching
  const normalizeText = (text) => {
    if (!text) return '';
    // Convert to lowercase for case-insensitive matching
    // and normalize Unicode characters for better Hebrew matching
    return text.toLowerCase().normalize('NFKD');
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        // Fetch profile data
        const profileRef = firestoreDoc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const userData = profileSnap.data();
          setUserPhotoURL(userData.photoURL);
          setUserProfile(userData);
        }

        // Fetch element from 'users' collection (like in profile page)
        const userRef = firestoreDoc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.element) {
            // Handle both string and array formats
            const elementValue = Array.isArray(userData.element) ? userData.element[0] : userData.element;
            setUserElement(elementValue || 'fire');
          }
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
    } else if (path.startsWith('/profile')) {
      setActiveTab('profile');
    }
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchInput) {
        setSearchResults([]);
        return;
      }
      try {
        const querySnapshot = await getDocs(collection(db, 'profiles'));
        const searchTerm = searchInput.trim();
        const normalizedSearchTerm = normalizeText(searchTerm);

        const filteredResults = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((profile) => {
            // Enhanced Hebrew search with normalization
            const normalizedUsername = normalizeText(profile.username || '');
            const normalizedName = normalizeText(profile.name || '');
            const normalizedBio = normalizeText(profile.bio || '');

            // Check if the normalized search term appears in username, name, or bio
            return normalizedUsername.includes(normalizedSearchTerm) ||
              normalizedName.includes(normalizedSearchTerm) ||
              normalizedBio.includes(normalizedSearchTerm);
          });

        setSearchResults(filteredResults);
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
      {/* Desktop Sidebar - only show on large screens */}
      <div className="hidden lg:block">
        <motion.aside
          initial={{ width: 64 }}
          animate={{ width: isExpanded ? 256 : 64 }}
          transition={{ duration: 0.4 }}
          className={`fixed top-6 bottom-0 right-0 bg-white shadow-lg z-20 flex flex-col h-[calc(100vh-1.5rem)] max-h-[calc(100vh-1.5rem)] overflow-hidden ${showNotifications ? 'pointer-events-none opacity-50' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Search */}
          {isExpanded ? (
            <form onSubmit={handleSearch} className="px-2 pt-16 px-4 transition-all flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="חפש..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-10 rounded-full border border-gray-300 bg-gray-50 px-4 pr-10 text-sm placeholder-gray-500 focus:outline-none focus:bg-white transition-all duration-300 ease-in-out opacity-100 scale-100"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 opacity-100">
                  {!isSearching ? (
                    <Search size={16} className="text-gray-500" />
                  ) : (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-400" />
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center pt-16 pb-4">
              <Search size={24} className="text-gray-400" />
            </div>
          )}

          {/* Search Results */}
          {searchInput && searchResults.length > 0 && isExpanded && (
            <div className="max-h-32 overflow-y-auto border-b border-gray-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="px-3 py-2">
                <h3 className="font-semibold text-xs text-gray-600 mb-2">תוצאות חיפוש</h3>
                <div className="space-y-1">
                  {searchResults.map((profile, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-all duration-150`}
                      onClick={() => {
                        setSearchInput('');
                        navigate(`/profile/${profile.username}`);
                      }}
                    >
                      <img
                        src={profile.photoURL || '/images/default-avatar.png'}
                        alt={profile.username}
                        className="w-6 h-6 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default-avatar.png';
                        }}
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs text-gray-800 font-medium truncate">{profile.username}</span>
                        {profile.name && (
                          <span className="text-xs text-gray-500 truncate">{profile.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {searchInput && searchResults.length === 0 && isExpanded && (
            <div className="px-3 py-2 text-center text-gray-500 text-xs border-b border-gray-100">
              לא נמצאו תוצאות עבור "{searchInput}"
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="space-y-1 px-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                  relative w-full h-12 rounded-lg
                  flex items-center justify-start ${!isExpanded ? 'pl-3 pr-3.5' : 'px-3'} gap-3
                  transition-all duration-200 ease-in-out group
                  ${activeTab === tab.id
                      ? `text-white bg-${element} shadow-sm`
                      : `text-gray-700 hover:bg-${element}-soft`
                    }
                `}
                >
                  <div className="relative flex-shrink-0">
                    {tab.icon}
                    {!isExpanded && tab.id === 'messenger' && messageUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </div>
                  <span className={`
                  font-medium text-sm whitespace-nowrap
                  transition-all duration-300 ease-in-out
                  ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
                `}>
                    {tab.label}
                    {isExpanded && tab.id === 'messenger' && messageUnreadCount > 0 && (
                      <span className="mr-20 px-1.5 rounded-full bg-red-500 text-white text-xs">
                        {messageUnreadCount > 99 ? '99+' : messageUnreadCount}
                      </span>
                    )}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-gray-100 p-2 space-y-1">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`
              relative w-full h-12 rounded-lg
              flex items-center justify-start ${!isExpanded ? 'pl-3 pr-3.5' : 'px-3'} gap-3
              transition-all duration-200 ease-in-out
              ${showNotifications
                  ? `text-white bg-${element}-accent shadow-sm`
                  : `text-gray-700 hover:bg-${element}-soft`
                }
            `}
            >
              <div className="relative flex-shrink-0">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>
              <span className={`
              font-medium text-sm whitespace-nowrap
              transition-all duration-300 ease-in-out
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
            `}>
                התראות
                {isExpanded && unreadCount > 0 && (
                  <span className="mr-20 px-1.5  rounded-full bg-red-500 text-white text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
            </motion.button>

            {/* Profile */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={handleProfileClick}
              className={`
              relative w-full h-12 rounded-lg
              flex items-center justify-start ${!isExpanded ? 'pl-3 pr-3.5' : 'px-3'} gap-3
              transition-all duration-200 ease-in-out
              ${activeTab === 'profile'
                  ? `text-white bg-${element} shadow-sm`
                  : `text-gray-700 hover:bg-${element}-soft`
                }
            `}
            >
              <div className="flex-shrink-0">
                {userPhotoURL ? (
                  <img
                    src={userPhotoURL}
                    alt="Profile"
                    className="w-5 h-5 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-avatar.png';
                    }}
                  />
                ) : (
                  <User size={20} />
                )}
              </div>
              <span className={`
              font-medium text-sm whitespace-nowrap
              transition-all duration-300 ease-in-out
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
            `}>
                פרופיל
              </span>
            </motion.button>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={handleLogout}
              className={`
              relative w-full h-12 rounded-lg
              flex items-center justify-start ${!isExpanded ? 'pl-3 pr-3.5' : 'px-3'} gap-3
              transition-all duration-200 ease-in-out
              text-gray-700 hover:bg-${element}-soft
            `}
            >
              <div className="flex-shrink-0">
                <LogOut size={20} />
              </div>
              <span className={`
              font-medium text-sm whitespace-nowrap
              transition-all duration-300 ease-in-out
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
            `}>
                התנתק
              </span>
            </motion.button>
          </div>
        </motion.aside>
      </div>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 right-0 left-0 z-30 bg-white border-t border-gray-200 flex justify-around items-center py-2 lg:hidden shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`relative flex flex-col items-center text-xs ${activeTab === tab.id ? `text-${element}-accent` : 'text-gray-500'
              }`}
          >
            <span className="relative">
              {tab.icon}
              {tab.id === 'messenger' && messageUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative flex flex-col items-center text-xs text-gray-500"
        >
          <span className="relative">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-red-500 w-2 h-2" />
            )}
          </span>
          <span>התראות</span>
        </button>
        <button
          onClick={user ? handleProfileClick : () => navigate('/login')}
          className="flex flex-col items-center text-xs text-gray-500"
        >
          {userPhotoURL ? (
            <img src={userPhotoURL} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <User size={20} />
          )}
          <span>{user ? 'פרופיל' : 'התחברות'}</span>
        </button>
      </nav>
    </>
  );

};

export default Rightsidebar;
