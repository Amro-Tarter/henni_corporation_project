import React, { useState } from 'react';
import {
  Search,
  Bell,
  Home,
  MessageSquare,
  Settings,
  User,
} from 'lucide-react';

const tabs = [
  { id: 'home', icon: <Home size={20} />, label: 'דף הבית' },
  { id: 'messenger', icon: <MessageSquare size={20} />, label: 'הודעות' },
  { id: 'settings', icon: <Settings size={20} />, label: 'הגדרות' },
];

const RightSidebar = ({ isOpen }) => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };

  return (
    <aside
      className={`fixed top-[56.8px] bottom-0 right-0 w-64 bg-white shadow-xl transition-transform duration-500 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } flex flex-col overflow-hidden`}
    >
      {/* Search */}
      <form onSubmit={handleSearch} className="px-4 pt-16">
        <div className="relative">
          <input
            type="text"
            placeholder="חפש..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:border-indigo-300 focus:outline-none"
          />
          {!isSearching ? (
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Search size={18} />
            </button>
          ) : (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          )}
        </div>
      </form>

      {/* Navigation Tabs */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-gray-900 transition-colors duration-200 hover:bg-orange-50 ${
              activeTab === tab.id ? 'bg-orange-100' : ''
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 pb-6 space-y-2">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-gray-900 transition-colors duration-200 hover:bg-orange-50 ${
            activeTab === 'notifications' ? 'bg-orange-100' : ''
          }`}
        >
          <Bell size={20} />
          <span className="flex-1 text-right">התראות</span>
          <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">
            3
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-gray-900 transition-colors duration-200 hover:bg-orange-50 ${
            activeTab === 'profile' ? 'bg-orange-100' : ''
          }`}
        >
          <User size={20} />
          <span className="font-medium">פרופיל</span>
        </button>
      </div>
    </aside>
  );
};

export default RightSidebar;
