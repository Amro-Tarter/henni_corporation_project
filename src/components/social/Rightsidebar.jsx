// src/components/social/Rightsidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, Home, MessageSquare, Settings, User, LogOut,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/config/firbaseConfig';

const tabs = [
  { id: 'home', icon: <Home size={20} />, label: 'דף הבית' },
  { id: 'messenger', icon: <MessageSquare size={20} />, label: 'הודעות' },
  { id: 'settings', icon: <Settings size={20} />, label: 'הגדרות' },
];

const Rightsidebar = ({ element, onExpandChange }) => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [searchResults, setSearchResults] = useState([]);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'profiles'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserPhotoURL(userData.photoURL);
        }
      }
    };
    fetchUserProfile();
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

  // Notify parent component when expanded state changes
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
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle hover to toggle expanded state
  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  return (
    <aside
      className={`
        fixed top-[56.8px] bottom-0 right-0 
        ${isExpanded ? 'w-64' : 'w-16'} 
        transition-all duration-300 ease-in-out
        bg-white border-l border-${element}-accent
        shadow-xl z-40 flex flex-col overflow-hidden
      `}
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
        <div className="px-4">
          <h3 className="font-semibold">תוצאות חיפוש</h3>
          <ul className="list-none mt-2">
            {searchResults.map((profile, index) => (
              <li
                key={index}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => setSearchInput(profile.username)}
              >
                <img
                  src={profile.photoURL}
                  alt={profile.username}
                  className="w-10 h-10 rounded-full"
                />
                <span className={isExpanded ? 'block' : 'hidden'}>{profile.username}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <nav className={`flex-1 px-2 py-6 space-y-2 overflow-y-auto ${isExpanded ? 'px-4' : ''}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-3 rounded-md px-3 py-2
              text-${element} transition-colors duration-200
              hover:bg-${element}-soft w-full
              ${activeTab === tab.id ? `bg-${element} text-white` : ''}
            `}
          >
            {tab.icon}
            <span className={`${isExpanded ? 'inline' : 'hidden'} font-medium`}>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className={`px-2 pb-6 space-y-2 ${isExpanded ? 'px-4' : ''}`}>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-3 rounded-md px-3 py-2 w-full text-${element} hover:bg-${element}-soft transition-colors duration-200 ${
            activeTab === 'notifications' ? `bg-${element}-soft text-white` : ''
          }`}
        >
          <Bell size={20} />
          {isExpanded && (
            <span className="flex flex-1 justify-between">
              <span>התראות</span>
              <span className={`rounded-full bg-${element}-accent text-white px-2 py-1 text-xs`}>
                3
              </span>
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 rounded-md px-3 py-2 w-full text-${element} hover:bg-${element}-soft transition-colors duration-200 ${
            activeTab === 'profile' ? `bg-${element}-soft text-white` : ''
          }`}
        >
          {userPhotoURL ? (
            <img src={userPhotoURL} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <User size={20} />
          )}
          {isExpanded && (
            <span className="font-medium">פרופיל</span>
          )}
        </button>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 rounded-md px-3 py-2 w-full text-${element} hover:bg-${element}-soft transition-colors duration-200`}
        >
          <LogOut size={20} />
          {isExpanded && (
            <span className="font-medium">התנתק</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Rightsidebar;