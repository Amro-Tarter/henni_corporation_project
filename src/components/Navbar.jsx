import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchInput);
    // Add your search logic here
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000); // Simulate search completion
  };

  return (
    <div className="navbar">
      {/* Logo section */}
      <div className="nav-logo">
        <svg viewBox="0 0 36 36">
          {/*<path fill="currentColor" d="M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 24h-3v-6h3v-2.5c0-3.75 2.232-5.5 5.5-5.5 1.516 0 2.5.5 2.5.5v3h-2c-1.56 0-2 .943-2 2v2h4l-1 6h-3l.181 11.87z"></path>*/}
        </svg>
      </div>

      {/* Navigation buttons/tabs */}
      <div className="nav-buttons">
        <button 
          className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="button-icon">🏠</span>
          <span className="button-text">Home</span>
        </button>

        <button 
          className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="button-icon">👤</span>
          <span className="button-text">Profile</span>
        </button>

        <button 
          className={`nav-button ${activeTab === 'messenger' ? 'active' : ''}`}
          onClick={() => setActiveTab('messenger')}
        >
          <span className="button-icon">💬</span>
          <span className="button-text">Messenger</span>
        </button>

        <button 
          className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span className="button-icon">⚙️</span>
          <span className="button-text">Settings</span>
        </button>
      </div>

      {/* Right side controls */}
      <div className="nav-controls">
        {/* Search form */}
        <form className="search-container" onSubmit={handleSearch}>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="search-icon-wrapper">
              <span className="search-icon">🔍</span>
            </div>
          </div>
          {/* Search button */}
          <button type="submit" className="search-button" disabled={isSearching}>
            <span className="button-icon">🔍</span>
            {isSearching && <div className="search-loader"></div>}
          </button>
        </form>

        {/* Notification button */}
        <button className="notification-button">
          <span className="button-icon">🔔</span>
          <span className="notification-badge">3</span>
        </button>

        {/* Profile button */}
        <button className="profile-button">
          <span className="button-icon">👤</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;