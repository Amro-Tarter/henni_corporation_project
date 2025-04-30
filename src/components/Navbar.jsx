import React, { useState } from 'react';

const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('מחפש:', searchInput);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-[#F5F0E8] px-4 py-2 flex items-center justify-between shadow-md border-b border-black/10 z-50" dir="rtl">
      {/* Right: Navigation buttons */}
      <div className="flex items-center gap-2 flex-1 justify-start">
        {[
          { tab: 'home', icon: '🏠', text: 'דף הבית' },
          { tab: 'messenger', icon: '💬', text: 'הודעות' },
          { tab: 'settings', icon: '⚙️', text: 'הגדרות' },
        ].map(({ tab, icon, text }) => (
          <button
            key={tab}
            className={`flex items-center gap-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === tab
                ? 'text-[#D94C1A] border-b-2 border-[#D94C1A] bg-transparent rounded-none'
                : 'bg-[#F5F0E8] text-black hover:bg-black/10 hover:-translate-y-[1px]'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="text-lg">{icon}</span>
            <span className="hidden sm:inline">{text}</span>
          </button>
        ))}
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 flex justify-center">
        <form className="flex items-center" onSubmit={handleSearch}>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="חפש..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-black/5 text-black h-9 pl-10 pr-4 rounded-full text-sm w-[350px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D94C1A]/30 transition-all max-w-full"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
              🔍
            </div>
          </div>
          <button
            type="submit"
            className="ml-2 w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center hover:bg-black/10 transition disabled:opacity-70 disabled:cursor-not-allowed relative"
            disabled={isSearching}
          >
            <span className="text-lg">🔍</span>
            {isSearching && (
              <div className="absolute w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        </form>
      </div>

      {/* Left: Notification & Profile */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <button
          className="relative w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center hover:bg-black/10"
          aria-label="התראות"
        >
          <span className="text-lg">🔔</span>
          <span className="absolute -top-1 -right-1 bg-[#D94C1A] text-white rounded-full w-4 h-4 text-[11px] flex items-center justify-center font-bold">
            3
          </span>
        </button>
        <button
          className="w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center hover:bg-black/10"
          aria-label="פרופיל"
        >
          <span className="text-lg">👤</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
