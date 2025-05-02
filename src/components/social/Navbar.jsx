import React, { useState } from 'react';
import { Button } from '../ui/button';

const navTabs = [
  { id: 'home', icon: '🏠', label: 'דף הבית' },
  { id: 'messenger', icon: '💬', label: 'הודעות' },
  { id: 'settings', icon: '⚙️', label: 'הגדרות' },
];

const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };

  return (
    <header
      dir="rtl"
      className="fixed top-0 left-0 w-full bg-orange-500 border-b border-orange-600 z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">

        {/* Navigation Tabs */}
        <nav className="flex flex-row-reverse items-center space-x-4 space-x-reverse">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-white text-sm transition-colors duration-200 hover:bg-orange-400 ${
                activeTab === tab.id ? 'bg-orange-700 font-semibold' : ''
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
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
              className="w-full border border-orange-300 rounded-full py-2 pl-10 pr-4 text-gray-800 placeholder-gray-600 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 transition"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">🔍</span>
          </div>
        </form>

        {/* Actions */}
        <div className="flex flex-row-reverse items-center space-x-4 space-x-reverse">
          <Button
            variant="ghost"
            className="relative text-white hover:bg-orange-400 p-2 rounded-full transition"
            aria-label="התראות"
            onClick={() => setActiveTab('notifications')}
          >
            <span className="text-lg">🔔</span>
            <span className="absolute -top-1 -left-1 bg-orange-700 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
              3
            </span>
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-orange-400 p-2 rounded-full transition"
            aria-label="פרופיל"
            onClick={() => setActiveTab('profile')}
          >
            <span className="text-lg">👤</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;