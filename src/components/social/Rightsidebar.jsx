import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  ChevronRight,
  ChevronLeft,
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

const RightSidebar = ({ isOpen, toggle, element }) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  const handleSearch = e => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={toggle}
        className={`
          fixed top-16 right-4 z-50 h-12 w-12 rounded-full
          bg-${element}-soft text-${element}
          hover:bg-${element}-accent
          shadow-md transition-transform duration-300
          ${isOpen ? 'rotate-180' : 'rotate-0'}
        `}
      >
        {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-[56.8px] bottom-0 right-0 w-64
          bg-white border-l border-${element}-accent
          shadow-xl transition-transform duration-500 ease-in-out z-40
          flex flex-col overflow-hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Search */}
        <form onSubmit={handleSearch} className="px-4 pt-16">
          <div className="relative">
            <input
              type="text"
              placeholder="חפש..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className={`
                w-full rounded-full border border-${element}-accent
                bg-${element}-soft px-4 py-2 pr-10 text-${element}
                placeholder-${element}-accent focus:border-${element}
                focus:outline-none transition
              `}
            />
            {!isSearching ? (
              <button
                type="submit"
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-${element}-accent hover:text-${element}`}
              >
                <Search size={18} />
              </button>
            ) : (
              <div
                className={`
                  absolute left-3 top-1/2 -translate-y-1/2
                  h-4 w-4 animate-spin rounded-full
                  border-2 border-${element}-accent border-t-transparent
                `}
              />
            )}
          </div>
        </form>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex w-full items-center gap-3 rounded-md px-3 py-2
                text-${element} transition-colors duration-200
                hover:bg-${element}-soft
                ${activeTab === tab.id ? `bg-${element} text-white` : ''}
              `}
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
            className={`
              flex w-full items-center gap-3 rounded-md px-3 py-2
              text-${element} transition-colors duration-200
              hover:bg-${element}-soft
              ${activeTab === 'notifications' ? `bg-${element}-soft text-white` : ''}
            `}
          >
            <Bell size={20} />
            <span className="flex-1 text-right">התראות</span>
            <span className={`rounded-full bg-${element}-accent text-white px-2 py-1 text-xs`}>
              3
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('profile');
              navigate('/profile');
            }}
            className={`
              flex w-full items-center gap-3 rounded-md px-3 py-2
              text-${element} transition-colors duration-200
              hover:bg-${element}-soft
              ${activeTab === 'profile' ? `bg-${element}-soft text-white` : ''}
            `}
          >
            <User size={20} />
            <span className="font-medium">פרופיל</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default RightSidebar;
