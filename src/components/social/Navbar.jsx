import React, { useState } from 'react';
import { Button } from '../ui/button';

const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };

  return (
    <div className="w-full bg-red-900 px-4 py-2 flex flex-wrap items-center justify-between shadow-md border-b border-black/10 z-50 fixed top-0 right-0 transition-all duration-300">
      <div className="flex items-center gap-2 flex-1 justify-start">
        {[
          { tab: 'home', icon: '🏠', text: 'דף הבית' },
          { tab: 'messenger', icon: '💬', text: 'הודעות' },
          { tab: 'settings', icon: '⚙️', text: 'הגדרות' },
        ].map(({ tab, icon, text }) => (
          <Button
            key={tab}
            variant="ghost"
            size="sm"
            className={`gap-1 text-white border border-transparent rounded-md hover:bg-red-800 ${
              activeTab === tab ? 'bg-red-800' : ''
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="text-lg">{icon}</span>
            <span className="hidden sm:inline">{text}</span>
          </Button>
        ))}
      </div>

      <div className="flex-1 flex justify-center mt-2 sm:mt-0">
        <form className="flex items-center w-full sm:w-auto px-2" onSubmit={handleSearch}>
          <div className="relative flex items-center w-full sm:w-[350px]">
            <input
              type="text"
              placeholder="חפש..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-white/20 text-white h-9 pl-10 pr-4 rounded-full text-sm w-full focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder:text-white/70"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-sm pointer-events-none">
              🔍
            </div>
          </div>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="ml-2 text-white border border-transparent rounded-md hover:bg-red-800"
            disabled={isSearching}
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-lg">🔍</span>
            )}
          </Button>
        </form>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end mt-2 sm:mt-0">
        <Button variant="ghost" size="icon" className="relative text-white border border-transparent rounded-md hover:bg-red-800" aria-label="התראות">
          <span className="text-lg">🔔</span>
          <span className="absolute -top-1 -right-1 bg-white text-red-900 rounded-full w-4 h-4 text-[11px] flex items-center justify-center font-bold">3</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-white border border-transparent rounded-md hover:bg-red-800" aria-label="פרופיל">
          <span className="text-lg">👤</span>
        </Button>
      </div>
    </div>
  );
};

export default Navbar;