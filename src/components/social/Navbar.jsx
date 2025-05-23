import React, { useState, useEffect, useRef } from 'react';
import { Home, MessageSquare, Settings, Search, Bell, User, LogOut } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/config/firbaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import NotificationsComponent from './NotificationsComponent';

const navTabs = [
  { id: 'home', icon: <Home size={20} />, label: 'דף הבית', href: '/Home' },
  { id: 'chat', icon: <MessageSquare size={20} />, label: 'הודעות', href: '/chat' },
  { id: 'settings', icon: <Settings size={20} />, label: 'הגדרות', href: '/settings' },
];

const Navbar = ({ element }) => {
  const navigate = useNavigate();
  const { showNotifications, setShowNotifications, unreadCount, NotificationsModal } = NotificationsComponent();

  const getInitialTab = () => {
    const path = window.location.pathname;
    if (path.startsWith('/Home')) return 'home';
    if (path.startsWith('/chat')) return 'chat';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchPopUp, setShowSearchPopUp] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const searchRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const user = auth.currentUser;

  // Normalize text for better Hebrew searching
  const normalizeText = (text) => {
    if (!text) return '';
    // Convert to lowercase for case-insensitive matching
    // and normalize Unicode characters for better Hebrew matching
    return text.toLowerCase().normalize('NFKD');
  };

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
        const querySnapshot = await getDocs(collection(db, 'profiles'));
        const searchTerm = searchInput.trim();
        const normalizedSearchTerm = normalizeText(searchTerm);

        const filteredResults = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((profile) => {
            // Enhanced Hebrew search with normalization
            const normalizedUsername = normalizeText(profile.username || '');
            const normalizedName = normalizeText(profile.name || '');
            
            // Check if the normalized search term appears in username or name
            return normalizedUsername.includes(normalizedSearchTerm) || 
                   normalizedName.includes(normalizedSearchTerm);
          });

        setSearchResults(filteredResults);
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
      const querySnapshot = await getDocs(collection(db, 'profiles'));
      const normalizedInput = normalizeText(searchInput);

      const results = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((profile) => {
          const normalizedUsername = normalizeText(profile.username || '');
          const normalizedName = normalizeText(profile.name || '');
          const normalizedBio = normalizeText(profile.bio || '');
          
          // Enhanced search with multiple profile fields
          return normalizedUsername.includes(normalizedInput) || 
                 normalizedName.includes(normalizedInput) || 
                 normalizedBio.includes(normalizedInput);
        });

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
    navigate(href);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
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

  return (
    <header dir="rtl" className={`fixed top-0 left-0 w-full bg-red-900 backdrop-blur-md shadow-md border-b border-${element}-accent z-50`}>
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* ORG NAME - RIGHT SIDE */}
         <a href="/" className="flex flex-col items-end min-w-[200px] no-underline hover:opacity-80 transition">
          <span className="text-white font-bold text-xl md:text-2xl">לגלות את האור – הנני</span>
          <span className="text-white/80 text-xs md:text-sm">מנהיגות. יצירה. שייכות.</span>
        </a>
       
       
        <nav className="flex flex-row-reverse items-center gap-6">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.href)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-md text-white text-base transition-all duration-300 ease-in-out transform hover:scale-105 ${
                activeTab === tab.id
                  ? `bg-gradient-to-br from-red-950 via-red-900 to-red-800 font-bold shadow-xl border-2 border-red-800/50 ring-2 ring-red-800/30`
                  : `hover:bg-red-700/80 hover:shadow-md`
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`transition-transform duration-200 ${activeTab === tab.id ? 'text-red-50' : ''}`}
              >
                {tab.icon}
              </motion.div>
              <span className={`transition-colors duration-200 ${activeTab === tab.id ? 'text-red-50' : ''}`}>{tab.label}</span>
            </button>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="flex-1 mx-6 max-w-md" dir="rtl">
          <div className="relative">
            <input
              type="text"
              placeholder="חפש פרופילים..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSearchPopUp(true);
              }}
              onFocus={() => setShowSearchPopUp(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') triggerSearch();
              }}
              className={`w-full border border-${element}-soft rounded-full py-2 pr-4 pl-12 text-gray-800 placeholder-gray-600 focus:border-${element}-accent focus:outline-none focus:ring-1 focus:ring-${element}-accent transition`}
              dir="rtl"
              lang="he"
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
                          <li key={index} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                            <span className="flex-grow text-right">{term}</span>
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
                            setShowSearchPopUp(false);
                            setSearchInput('');
                            navigate(`/profile/${profile.username}`);
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

                  {searchInput && searchResults.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      לא נמצאו תוצאות עבור "{searchInput}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifications(true)}
            className={`relative p-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 group ${
              activeTab === 'notifications' 
                ? `bg-gradient-to-br from-red-950 via-red-900 to-red-800 shadow-xl border-2 border-red-800/50 ring-2 ring-red-800/30` 
                : `hover:bg-red-700/80 hover:shadow-md`
            }`}
            aria-label="התראות"
          >
            <motion.div 
              whileHover={{ scale: 1.1 }} 
              transition={{ type: 'spring', stiffness: 300 }}
              className={`transition-transform duration-200 ${activeTab === 'notifications' ? 'text-red-50' : ''}`}
            >
              <Bell size={20} className="text-white" />
            </motion.div>
            {unreadCount > 0 && (
              <motion.span
                className={`absolute -top-1 -left-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </button>

          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              className={`p-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 ${
                activeTab === 'profile' 
                  ? `bg-gradient-to-br from-red-950 via-red-900 to-red-800 shadow-xl border-2 border-red-800/50 ring-2 ring-red-800/30` 
                  : `hover:bg-red-700/80 hover:shadow-md`
              }`}
              aria-label="פרופיל"
            >
              <User size={20} className={`text-white transition-transform duration-200 group-hover:scale-110 ${activeTab === 'profile' ? 'text-red-50' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-12 w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  {user && (
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-gray-800 font-medium text-center">{user.email}</p>
                    </div>
                  )}
                  <div className="py-2">
                    <button
                      onClick={async () => {
                        try {
                          const docSnap = await getDoc(doc(db, 'profiles', user.uid));
                          if (docSnap.exists()) {
                            const username = docSnap.data().username;
                            navigate(`/profile/${username}`);
                          }
                        } catch (err) {
                          console.error('Failed to fetch username for profile redirection:', err);
                        }
                      }}
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

      <NotificationsModal />
    </header>
  );
};

export default Navbar;