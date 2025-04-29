
import React, { useState } from 'react';
import './Navbar.css';

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
    <div className="navbar" dir="rtl">
      {/* Right: Navigation buttons */}
      <div className="nav-buttons">
        <button
          className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="button-icon">🏠</span>
          <span className="button-text">דף הבית</span>
        </button>

        <button
          className={`nav-button ${activeTab === 'messenger' ? 'active' : ''}`}
          onClick={() => setActiveTab('messenger')}
        >
          <span className="button-icon">💬</span>
          <span className="button-text">הודעות</span>
        </button>

        <button
          className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span className="button-icon">⚙️</span>
          <span className="button-text">הגדרות</span>
        </button>
      </div>

      {/* Center: Search bar */}
      <div className="search-bar-wrapper">
        <form className="search-container" onSubmit={handleSearch}>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="חפש..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="search-icon-wrapper">
              <span className="search-icon">🔍</span>
            </div>
          </div>
          <button type="submit" className="search-button" disabled={isSearching}>
            <span className="button-icon">🔍</span>
            {isSearching && <div className="search-loader"></div>}
          </button>
        </form>
      </div>

      {/* Left: Notification & Profile */}
      <div className="nav-controls">
        <button className="notification-button" aria-label="התראות">
          <span className="button-icon">🔔</span>
          <span className="notification-badge">3</span>
        </button>

        <button className="profile-button" aria-label="פרופיל">
          <span className="button-icon">👤</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
