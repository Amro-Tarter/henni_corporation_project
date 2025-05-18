import React, { useState, useEffect, useRef } from 'react';
import { Home, MessageSquare, Settings, Search, Bell, User, LogOut } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/config/firbaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const navTabs = [
  { id: 'home', icon: <Home size={20} />, label: 'דף הבית', href: '/Home' },
  { id: 'messenger', icon: <MessageSquare size={20} />, label: 'הודעות', href: '/chat' },
  { id: 'settings', icon: <Settings size={20} />, label: 'הגדרות', href: '/settings' },
];

const Navbar = ({ element }) => {
  const navigate = useNavigate();

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
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const user = auth.currentUser;

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
        const inputLower = searchInput.toLowerCase();

        const filteredResults = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((profile) => profile.username.toLowerCase().includes(inputLower));

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
      const inputLower = searchInput.toLowerCase();

      const results = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((profile) => profile.username.toLowerCase().includes(inputLower));

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
      window.location.href = '/login';
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

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
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

  return (
    <header dir="rtl" className={`fixed top-0 left-0 w-full bg-${element} border-b border-${element}-accent z-50`}>
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <nav className="flex flex-row-reverse items-center gap-6">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.href)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-white text-base transition-colors duration-200 ${
                activeTab === tab.id ? `bg-${element}-accent font-semibold` : `hover:bg-${element}-soft`
              }`}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="flex-1 mx-6 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="חפש פרופילים..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSearchPopUp(true); // show immediately when typing
              }}
              onFocus={() => setShowSearchPopUp(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') triggerSearch();
              }}
              className={`w-full border border-${element}-soft rounded-full py-2 pl-12 pr-4 text-gray-800 placeholder-gray-600 focus:border-${element}-accent focus:outline-none focus:ring-1 focus:ring-${element}-accent transition`}
            />
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-${element}-accent`}>
              <Search size={20} />
            </span>

            {showSearchPopUp && (
              <div
                ref={searchRef}
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
                  <div>
                    {searchResults.map((profile, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setShowSearchPopUp(false);
                          setSearchInput('');
                          navigate(`/profile/${profile.username}`);
                        }}
                      >
                        <img
                          src={profile.photoURL}
                          alt={profile.username}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <span>{profile.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        <div className="flex flex-row-reverse items-center space-x-4 space-x-reverse">
          <button
            onClick={() => navigate('/notifications')}
            className={`relative p-2 rounded-full transition ${
              activeTab === 'notifications' ? `bg-${element}-accent` : `hover:bg-${element}-soft`
            }`}
            aria-label="התראות"
          >
            <Bell size={20} className="text-white" />
            {unreadCount > 0 && (
              <span
                className={`absolute -top-1 -left-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              className={`p-2 rounded-full transition ${
                activeTab === 'profile' ? `bg-${element}-accent` : `hover:bg-${element}-soft`
              }`}
              aria-label="פרופיל"
            >
              <User size={20} className="text-white" />
            </button>

            {showProfileDropdown && (
              <div className="absolute left-0 top-12 w-60 bg-white rounded-md shadow-lg border border-gray-200 z-50">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
