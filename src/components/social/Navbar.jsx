import React, { useState, useEffect, useRef } from 'react';
import { Home, MessageSquare, Settings, Search, Bell, User, LogOut, BarChart2, LogIn, FileText } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/config/firbaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotifications } from './NotificationsComponent';
import { cn } from '@/lib/utils';

const navTabs = [
  { id: 'home', icon: <Home size={20} />, label: 'דף הבית', href: '/Home' },
  { id: 'chat', icon: <MessageSquare size={20} />, label: 'הודעות', href: '/chat' },
  { id: 'settings', icon: <Settings size={20} />, label: 'הגדרות', href: '/settings' },
];

const Navbar = ({ element }) => {
  const navigate = useNavigate();
  const { showNotifications, setShowNotifications, unreadCount, messageUnreadCount, postUnreadCount, commentUnreadCount, loading } = useNotifications();

  const getInitialTab = () => {
    const path = window.location.pathname;
    if (path.startsWith('/Home')) return 'home';
    if (path.startsWith('/chat')) return 'chat';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/admin')) return 'dashboard';
    if (path.startsWith('/report')) return 'report';
    return 'home';
  };

  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchPopUp, setShowSearchPopUp] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [role, setRole] = useState(null);

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
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setRole(userDoc.data().role || null);
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

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
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

  const saveProfileToHistory = async (profile) => {
    if (user) {
      try {
        // Filter out any existing instance of this profile
        const filteredHistory = searchHistory.filter(p => p.username !== profile.username);
        // Add the new profile at the beginning and limit to 5
        const updatedHistory = [profile, ...filteredHistory].slice(0, 5);
        
        setSearchHistory(updatedHistory);
        
        const profileDocRef = doc(db, 'profiles', user.uid);
        await updateDoc(profileDocRef, {
          searchHistory: updatedHistory
        });
      } catch (err) {
        console.error('Error updating profile history:', err);
      }
    }
  };

  return (
    <>
      {/* Mobile Menu Backdrop and Menu - Outside header for full page coverage */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[99] bg-black bg-opacity-40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-72 z-[100] transform transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{
          backgroundColor: '#7f1d1d', // Solid red-900 background
          opacity: 1 // Ensure full opacity
        }}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-white font-semibold text-lg">תפריט</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-white text-2xl focus:outline-none"
            aria-label="סגור תפריט"
          >
            &times;
          </button>
        </div>

        {/* Mobile Search */}
        <div className="p-4">
          <form onSubmit={handleSearch} className="w-full" dir="rtl">
            <div className="relative">
              <input
                type="text"
                placeholder="חפש פרופילים..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 300)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') triggerSearch();
                }}
                className="w-full border border-white/30 rounded-full py-2 pr-4 pl-9 text-sm md:text-base text-white placeholder-white/70 bg-white/10 focus:bg-white/20 focus:border-white focus:outline-none transition backdrop-blur-sm"
                dir="rtl"
                lang="he"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">
                <Search size={18} />
              </span>
            </div>
          </form>

          {/* Mobile Search Results */}
          {showSearchDropdown && (searchResults.length > 0 || (showHistory && searchHistory.length > 0 && !searchInput)) && (
            <div className="mt-2 bg-white rounded-lg shadow-lg max-h-40 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {showHistory && searchHistory.length > 0 && !searchInput && (
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-800 mb-2">פרופילים אחרונים</h3>
                  <div className="space-y-2">
                    {searchHistory.map((profile, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
                        onMouseDown={() => {
                          setShowSearchDropdown(false);
                          setIsMenuOpen(false);
                          navigate(`/profile/${profile.username}`);
                        }}
                      >
                        <img
                          src={profile.photoURL || '/default-avatar.png'}
                          alt={profile.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {profile.username}
                          </span>
                          {profile.name && (
                            <span className="text-xs text-gray-500 truncate">{profile.name}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchInput && searchResults.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((profile, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onMouseDown={() => {
                        setSearchInput('');
                        setShowSearchDropdown(false);
                        setIsMenuOpen(false);
                        navigate(`/profile/${profile.username}`);
                        // Save visited profile to history
                        saveProfileToHistory(profile);
                      }}
                    >
                      <img
                        src={profile.photoURL || '/default-avatar.png'}
                        alt={profile.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {profile.username}
                        </span>
                        {profile.name && (
                          <span className="text-xs text-gray-500 truncate">{profile.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchInput && searchResults.length === 0 && (
                <div className="p-3 text-center text-gray-500 text-sm">
                  לא נמצאו תוצאות עבור "{searchInput}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <ul className="flex-1 flex flex-col p-4 space-y-4 text-white text-lg">
          {navTabs.map(item => (
            <li key={item.id}>
              <button
                onClick={() => {
                  handleTabClick(item.id, item.href);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-right"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
          {(role === 'admin' || role === 'staff') && (
            <li>
              <button
                onClick={() => {
                  handleTabClick('dashboard', '/admin');
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-right"
              >
                <BarChart2 size={20} />
                <span>לוח בקרה</span>

              </button>
            </li>
          )}
          {role === 'mentor' && (
            <li>
              <button
                onClick={() => {
                  handleTabClick('report', '/report');
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-right"
              >
                <FileText size={20} />
                <span>דוחות</span>
              </button>
            </li>
          )}


          {/* Notifications */}
          <li className="pt-4 border-t border-white/10">
            <button
              onClick={() => {
                console.log('Notification bell clicked (Navbar)');
                setShowNotifications(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-right"
            >
              <Bell size={20} />
              <span>התראות</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </li>

          {/* Mobile Auth */}
          <li className="pt-4 border-t border-white/10">
            {user ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                  <span>{user.displayName || user.email}</span>
                </div>
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
                    setIsMenuOpen(false);
                  }}
                  className="block py-2 pr-10 hover:bg-white/10 rounded-lg"
                >
                  הפרופיל שלי
                </button>
                <button
                  onClick={() => {
                    handleTabClick('settings', '/settings');
                    setIsMenuOpen(false);
                  }}
                  className="block py-2 pr-10 hover:bg-white/10 rounded-lg"
                >
                  הגדרות
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 py-2 text-red-300 hover:bg-white/10 rounded-lg"
                >
                  <LogOut size={18} />
                  <span>התנתקות</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
                className="w-full flex justify-center items-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                <LogIn size={18} />
                <span>התחברות</span>
              </button>
            )}
          </li>
        </ul>

        {/* Footer Section - Like in public page */}
        <div className="border-t border-white/10 p-4 text-white flex flex-col gap-3 text-center mt-auto">
          <a href="tel:0500000000" className="hover:text-green-400">
            📞 התקשרו אלינו
          </a>
          <p className="text-xs text-white/70">כל הזכויות שמורות © 2025</p>
        </div>
      </div>

      <header dir="rtl" className={`fixed top-0 left-0 w-full bg-red-900 backdrop-blur-md shadow-md border-b border-red-800 z-50`}>
        <nav className="relative z-50 container mx-auto flex items-center justify-between px-6 py-2">
          <a href="/" className="flex flex-col items-start">
            <span className="text-white font-semibold text-base sm:text-lg md:text-xl">עמותת לגלות את האור – הנני</span>
            <span className="text-white/80 text-xs hidden md:block">יצירה. מנהיגות. שייכות.</span>
          </a>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full" dir="rtl">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="חפש פרופילים..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setShowSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 300)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') triggerSearch();
                  }}
                  className="w-full border border-white/30 rounded-full py-2 pr-4 pl-10 text-white placeholder-white/70 bg-white/10 focus:bg-white/20 focus:border-white focus:outline-none transition backdrop-blur-sm"
                  dir="rtl"
                  lang="he"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">
                  <Search size={18} />
                </span>

                {/* Search Results Dropdown */}
                {showSearchDropdown && (searchResults.length > 0 || (showHistory && searchHistory.length > 0)) && (
                  <div className="absolute top-full left-0 right-0 bg-white mt-1 border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-50">
                    {showHistory && searchHistory.length > 0 && !searchInput && (
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-gray-800 mb-2">פרופילים אחרונים</h3>
                        <div className="space-y-2">
                          {searchHistory.map((profile, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
                              onMouseDown={() => {
                                setShowSearchDropdown(false);
                                navigate(`/profile/${profile.username}`);
                              }}
                            >
                              <img
                                src={profile.photoURL || '/default-avatar.png'}
                                alt={profile.username}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
                              />
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium text-gray-800 truncate">
                                  {profile.username}
                                </span>
                                {profile.name && (
                                  <span className="text-xs text-gray-500 truncate">{profile.name}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchInput && searchResults.length > 0 && (
                      <div className="divide-y divide-gray-100">
                        {searchResults.map((profile, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onMouseDown={() => {
                              setSearchInput('');
                              setShowSearchDropdown(false);
                              navigate(`/profile/${profile.username}`);
                              // Save visited profile to history
                              saveProfileToHistory(profile);
                            }}
                          >
                            <img
                              src={profile.photoURL || '/default-avatar.png'}
                              alt={profile.username}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
                            />
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {profile.username}
                              </span>
                              {profile.name && (
                                <span className="text-xs text-gray-500 truncate">{profile.name}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchInput && searchResults.length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        לא נמצאו תוצאות עבור "{searchInput}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="hidden lg:flex items-center space-x-4 space-x-reverse">
            {/* Navigation Tabs */}
            <ul className="flex items-center space-x-1 space-x-reverse text-white">
              {navTabs.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabClick(item.id, item.href)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10',
                      activeTab === item.id && 'bg-white/20'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
              {(role === 'admin' || role === 'staff') && (
                <li>
                  <button
                    onClick={() => handleTabClick('dashboard', '/admin')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10',
                      activeTab === 'dashboard' && 'bg-white/20'
                    )}
                  >
                    <BarChart2 size={20} />
                    <span>לוח בקרה</span>
                  </button>
                </li>
              )}
              {role === 'mentor' && (
                <li>
                  <button
                    onClick={() => handleTabClick('report', '/report')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10',
                      activeTab === 'report' && 'bg-white/20'
                    )}
                  >
                    <FileText size={20} />
                    <span>דוחות</span>
                  </button>
                </li>
              )}
            </ul>

            {/* Notifications & Profile */}
            <div className="flex items-center space-x-3 space-x-reverse border-r border-white/20 pr-4 mr-4">
              <button
                onClick={() => {
                  console.log('Notification bell clicked (Navbar)');
                  setShowNotifications(true);
                }}
                className="relative text-white hover:text-yellow-300 transition-colors"
                aria-label="התראות"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Auth */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className={cn(
                    'flex items-center gap-2 text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all',
                    showProfileDropdown && 'bg-white/20'
                  )}
                >
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">
                    {user ? (user.displayName || 'החשבון שלי') : 'החשבון שלי'}
                  </span>
                </button>

                {/* Auth Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {user && (
                      <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200 truncate">
                        {user.email}
                      </div>
                    )}
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
                        setShowProfileDropdown(false);
                      }}
                      className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      הפרופיל שלי
                    </button>
                    <button
                      onClick={() => {
                        handleTabClick('settings', '/settings');
                        setShowProfileDropdown(false);
                      }}
                      className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      הגדרות
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="ml-2" />
                      <span>התנתקות</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-white focus:outline-none"
              aria-label="פתח תפריט"
            >
              <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-6 h-6">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;