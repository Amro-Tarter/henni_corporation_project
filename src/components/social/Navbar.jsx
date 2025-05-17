import React, { useState, useEffect, useRef } from 'react';
import { Home, MessageSquare, Settings, Search, Bell, User, LogOut } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firbaseConfig';
import { signOut } from 'firebase/auth';
import { AnimatePresence, motion } from 'framer-motion';

const navTabs = [
  { id: 'home', icon: <Home size={20} />, label: 'דף הבית', href: '/Home' },
  { id: 'messenger', icon: <MessageSquare size={20} />, label: 'הודעות', href: '/chat' },
  { id: 'settings', icon: <Settings size={20} />, label: 'הגדרות', href: '/settings' },
];

const Navbar = ({ element }) => {
  const getInitialTab = () => {
    const path = window.location.pathname;
    if (path.startsWith('/Home')) return 'home';
    if (path.startsWith('/messenger')) return 'messenger';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/chat')) return 'chat';
    return 'home';
  };

  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchPopUp, setShowSearchPopUp] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const searchRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setUserProfile(profileSnap.data());
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        try {
          const profileDocRef = doc(db, 'profiles', user.uid);
          const profileDoc = await getDoc(profileDocRef);
          if (profileDoc.exists()) {
            setSearchHistory(profileDoc.data().searchHistory || []);
          }
        } catch (err) {
          console.error('Error fetching search history:', err);
        }
      };
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchInput) return setSearchResults([]);

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

    if (searchInput) {
      fetchSuggestions();
      setShowHistory(false);
    } else {
      setSearchResults([]);
      setShowHistory(true);
    }
  }, [searchInput]);

  const handleSearch = async (e) => {
    e.preventDefault();
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

  const triggerSearch = async () => {
    if (searchInput && !searchHistory.includes(searchInput)) {
      const updatedHistory = [searchInput, ...searchHistory].slice(0, 5);
      setSearchHistory(updatedHistory);

      if (user) {
        try {
          const profileDocRef = doc(db, 'profiles', user.uid);
          await updateDoc(profileDocRef, { searchHistory: updatedHistory });
        } catch (err) {
          console.error('Error updating search history:', err);
        }
      }
    }
    handleSearch(new Event('submit'));
  };

  const handleTabClick = (tabId, href) => {
    setActiveTab(tabId);
    window.location.href = href;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/login'; // Redirect to login page after logout
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchPopUp(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSearchPopUp = () => {
    setShowSearchPopUp((prev) => !prev);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
  };

  const handleProfileClick = () => {
    if (userProfile?.username) {
      handleTabClick('profile', `/profile/${userProfile.username}`);
    }
  };

  return (
    <header dir="rtl" className={`fixed top-0 left-0 w-full bg-${element} backdrop-blur-md shadow-md border-b border-${element}-accent z-50`}>
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <nav className="flex flex-row-reverse items-center gap-6">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.href)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-md text-white text-base transition-all duration-200 transform ${
                activeTab === tab.id
                  ? `bg-${element}-accent font-semibold`
                  : `hover:bg-${element}-accent`
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {tab.icon}
              </motion.div>
              <span>{tab.label}</span>
            </button>

          ))}
        </nav>

        <form onSubmit={handleSearch} className="flex-1 mx-6 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="חפש פרופילים..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={toggleSearchPopUp}
              onKeyDown={(e) => {
                if (e.key === 'Enter') triggerSearch();
              }}
              className={`w-full border border-${element}-soft rounded-full py-2 pl-12 pr-4 text-gray-800 placeholder-gray-600 focus:border-${element}-accent focus:outline-none focus:ring-1 focus:ring-${element}-accent transition`}
            />
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-${element}-accent`}>
              <Search size={20} />
            </span>

            <AnimatePresence>
            {showSearchPopUp && (
              <motion.div
                ref={searchRef}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-white mt-1 border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
              >
                {showHistory && searchHistory.length > 0 && (
                  <div className="p-3">
                    <h3 className="font-semibold">חיפושים אחרונים</h3>
                    <ul className="list-none mt-2">
                      {searchHistory.map((term, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span>{term}</span>
                          <button
                            onClick={() => {
                              setSearchInput(term);
                              triggerSearch();
                            }}
                            className="text-blue-600"
                          >
                            <Search size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {searchInput && searchResults.length > 0 && (
                  <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto overflow-x-hidden">
                    {searchResults.map((profile, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSearchInput(profile.username);
                          triggerSearch();
                        }}
                      >
                        <img
                          src={profile.photoURL || '/default-avatar.png'}
                          alt={profile.username}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {profile.username}
                          </span>
                          {profile.name && (
                            <span className="text-xs text-gray-500 truncate">{profile.name}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

          </div>
        </form>

        <div className="flex flex-row-reverse items-center space-x-4 space-x-reverse">
          <button
            onClick={() => handleTabClick('notifications', '/notifications')}
            className={`relative p-2 rounded-full transition group ${
              activeTab === 'notifications' ? `bg-${element}-accent` : `hover:bg-${element}-accent`
            }`}
            aria-label="התראות"
          >
            <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Bell size={20} className="text-white" />
            </motion.div>
            <motion.span
              className={`absolute -top-1 -left-1 bg-${element}-accent text-white rounded-full w-5 h-5 text-xs flex items-center justify-center`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              3
            </motion.span>
          </button>


          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={toggleProfileDropdown}
              className={`p-2 rounded-full transition ${
                activeTab === 'profile' ? `bg-${element}-accent` : `hover:bg-${element}-soft`
              }`}
              aria-label="פרופיל"
            >
              <User size={20} className="text-white" />
            </button>
            
            <AnimatePresence>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-12 w-60 bg-white rounded-md shadow-lg border border-gray-200 z-50"
              >
                {user && (
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-gray-800 font-medium text-center">{user.email}</p>
                  </div>
                )}
                <div className="py-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-right px-4 py-2 hover:bg-gray-100 transition"
                  >
                    הפרופיל שלי
                  </button>
                  <button
                    onClick={() => handleTabClick('settings', '/settings')}
                    className="w-full text-right px-4 py-2 hover:bg-gray-100 transition"
                  >
                    הגדרות
                  </button>
                  <div className="border-t border-gray-200 mt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 text-red-600 hover:bg-gray-100 transition flex items-center"
                    >
                      <span className="ml-2">התנתקות</span>
                      <LogOut size={16} className="mr-auto" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;