// src/components/social/Rightsidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, Home, MessageSquare, Settings, User, LogOut,
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
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
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const profileRef = doc(db, 'profiles', user.uid);
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

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.unread && data.unread[user.uid]) {
          totalUnread += data.unread[user.uid];
        }
      });
      setUnreadCount(totalUnread);
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
            {!isExpanded && (<span className="min-w-[24px] flex justify-between items-center relative">
              {tab.icon}
              {tab.id === 'messenger' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </span>
            )}
              <span className={`flex font-medium overflow-hidden whitespace-nowrap transition-all duration-300
              ${isExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
              {tab.label}
              {tab.id === 'messenger' && unreadCount > 0 && (
                <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </span>
          </motion.button>
        ))}
      </nav>

      <div className={`pb-6 space-y-2 ${isExpanded ? 'px-4' : 'px-2'}`}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15 }}
          onClick={() => navigate('/notifications')}
          className={`flex items-center gap-3 rounded-md px-3 py-2 w-full text-${element} hover:bg-${element}-soft transition-colors duration-200 ${
            activeTab === 'notifications' ? `bg-${element} text-white` : ''
          }`}
        >
          <Bell size={20} />
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
