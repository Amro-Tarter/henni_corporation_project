import React, { useState } from 'react';
import { Button } from './ui/button';
import { ChevronRight, ChevronLeft, Search, Bell, Home, MessageSquare, Settings, User } from 'lucide-react';

const RightSidebar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('מחפש:', searchInput);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };

  return (
    <>
      {/* Toggle Button with improved animation */}
      <Button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed right-4 top-16 z-50 h-12 w-12 rounded-full bg-red-900 p-2 text-white shadow-lg hover:bg-red-800 transition-all duration-300 ${
          isSidebarOpen ? 'rotate-180' : 'rotate-0'
        }`}
      >
        {isSidebarOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </Button>

      {/* Sidebar with improved animations - using absolute positioning to avoid shifting content */}
      <div
        className={`fixed right-0 top-[56.8px] bottom-0 bg-red-900 shadow-xl transition-all duration-500 ease-in-out ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 translate-x-full'
        } z-40 overflow-hidden`}
        dir="rtl"
      >
        <div className={`h-full flex flex-col transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Search bar with fade-in effect */}
          <form className="mt-16 px-4" onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="חפש..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-full bg-white/20 px-4 py-2 pr-10 text-white placeholder:text-white/70 focus:bg-white/30 focus:outline-none transition-all duration-300"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent text-white hover:bg-transparent"
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Search size={18} />
                )}
              </Button>
            </div>
          </form>

          <div className="flex h-full flex-col overflow-y-auto p-4">
            {/* Navigation buttons with staggered animation effect */}
            <div className="flex flex-col gap-2">
              {[
                { tab: 'home', icon: <Home size={20} />, text: 'דף הבית' },
                { tab: 'messenger', icon: <MessageSquare size={20} />, text: 'הודעות' },
                { tab: 'settings', icon: <Settings size={20} />, text: 'הגדרות' },
              ].map(({ tab, icon, text }, index) => (
                <Button
                  key={tab}
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start gap-3 text-white transition-all duration-300 hover:scale-105 ${
                    activeTab === tab ? 'bg-red-800' : 'hover:bg-red-800/70'
                  }`}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    transitionDelay: `${index * 0.05}s`,
                  }}
                >
                  <span className="text-lg">{icon}</span>
                  <span>{text}</span>
                </Button>
              ))}
            </div>

            {/* Profile & Notifications */}
            <div className="mt-auto space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-white hover:bg-red-800/70 transition-all hover:scale-105 duration-300"
              >
                <Bell size={20} />
                <span>התראות</span>
                <span className="ml-auto rounded-full bg-white px-2 py-1 text-xs text-red-900 animate-pulse">
                  3
                </span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-white hover:bg-red-800/70 transition-all hover:scale-105 duration-300"
              >
                <User size={20} />
                <span>פרופיל</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RightSidebar;