import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firbaseConfig';

const navTabs = [
  { id: 'home', icon: '🏠', label: 'דף הבית', href: '/Home' },
  { id: 'messenger', icon: '💬', label: 'הודעות', href: '/chat' },
  { id: 'settings', icon: '⚙️', label: 'הגדרות', href: '/settings' },
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
  const searchRef = useRef(null);

  const user = auth.currentUser;

  // ✅ Fetch search history from profiles collection
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

  // ✅ Save search history in profiles collection
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchPopUp(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSearchPopUp = () => {
    setShowSearchPopUp((prev) => !prev);
  };

  return (
    <header dir="rtl" className={`fixed top-0 left-0 w-full bg-${element} border-b border-${element}-accent z-50`}>
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <nav className="flex flex-row-reverse items-center space-x-6 space-x-reverse">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.href)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-white text-base transition-colors duration-200 ${
                activeTab === tab.id ? `bg-${element}-accent font-semibold` : `hover:bg-${element}-soft`
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 mx-6 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="חפש פרופילים..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={toggleSearchPopUp}
              onBlur={() => setTimeout(() => setShowSearchPopUp(false), 100)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') triggerSearch();
              }}
              className={`w-full border border-${element}-soft rounded-full py-2 pl-12 pr-4 text-gray-800 placeholder-gray-600 focus:border-${element}-accent focus:outline-none focus:ring-1 focus:ring-${element}-accent transition`}
            />
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl text-${element}-accent`}>🔍</span>

            {/* Search Pop-up */}
            {showSearchPopUp && (
              <div
                ref={searchRef}
                className="absolute top-full left-0 right-0 bg-white mt-1 border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
              >
                {/* Search History */}
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
                            🔍
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {searchInput && searchResults.length > 0 && (
                  <div>
                    {searchResults.map((profile, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSearchInput(profile.username);
                          triggerSearch();
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

        {/* Actions */}
        <div className="flex flex-row-reverse items-center space-x-4 space-x-reverse">
          {/* Notifications */}
          <button
            onClick={() => handleTabClick('notifications', '/notifications')}
            className={`relative p-2 rounded-full transition ${
              activeTab === 'notifications' ? `bg-${element}-accent` : `hover:bg-${element}-soft`
            }`}
            aria-label="התראות"
          >
            <span className="text-xl">🔔</span>
            <span
              className={`absolute -top-1 -left-1 bg-${element}-accent text-white rounded-full w-5 h-5 text-xs flex items-center justify-center`}
            >
              3
            </span>
          </button>

          {/* Profile Icon */}
          <button
            onClick={() => handleTabClick('profile', '/profile')}
            className={`p-2 rounded-full transition ${
              activeTab === 'profile' ? `bg-${element}-accent` : `hover:bg-${element}-soft`
            }`}
            aria-label="פרופיל"
          >
            <span className="text-xl">👤</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
