import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const navTabs = [
  { id: 'home', icon: '🏠', label: 'דף הבית', href: '/Home' },
  { id: 'messenger', icon: '💬', label: 'הודעות', href: '/chat' },
  { id: 'settings', icon: '⚙️', label: 'הגדרות', href: '/settings' },
];

const Navbar = () => {
  // Determine which tab is active based on current path
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
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState(getInitialTab);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handleTabClick = (tabId, href) => {
    setActiveTab(tabId);
    window.location.href = href;
  };

  return (
    <header
      dir="rtl"
      className="fixed top-0 left-0 w-full bg-orange-500 border-b border-orange-600 z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">

        {/* Navigation Tabs */}
        <nav className="flex flex-row-reverse items-center space-x-6 space-x-reverse">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.href)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-white text-base transition-colors duration-200 hover:bg-orange-400 ${
                activeTab === tab.id ? 'bg-orange-700 font-semibold' : ''
              }`}
            >
              {/* Larger icons for visibility */}
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
              placeholder="חפש..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full border border-orange-300 rounded-full py-2 pl-12 pr-4 text-gray-800 placeholder-gray-600 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 transition"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xl">🔍</span>
            {isSearching && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
            )}
          </div>
        </form>

        {/* Actions */}
        <div className="flex flex-row-reverse items-center space-x-4 space-x-reverse">
          {/* Bell Notifications */}
          <button
            onClick={() => handleTabClick('notifications', '/notifications')}
            className={`relative p-2 rounded-full transition ${
              activeTab === 'notifications' ? 'bg-orange-700' : 'hover:bg-orange-400'
            }`}
            aria-label="התראות"
          >
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -left-1 bg-orange-700 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile Icon */}
          <button
            onClick={() => handleTabClick('profile', '/profile')}
            className={`p-2 rounded-full transition ${
              activeTab === 'profile' ? 'bg-orange-700' : 'hover:bg-orange-400'
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
