import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchInput);
    // Add your search logic here
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000); // Simulate search completion
  };

  return (
    <div className="navbar">
      <div className="nav-buttons">
        <button className="nav-button">
          <span className="button-icon">👤</span>
          <span className="button-text">Profile</span>
        </button>

        <form className="search-container" onSubmit={handleSearch}>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Explore the universe..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="search-icon-wrapper">
              <span className="search-icon">🚀</span>
            </div>
            <button
              type="submit"
              className={`search-button ${isSearching ? 'searching' : ''}`}
              disabled={isSearching}
            >
              <div className="search-loader"></div>
              <span className="search-icon">🚀</span>
            </button>
            <div className="search-border"></div>
          </div>
        </form>

        <button className="nav-button">
          <span className="button-icon">⚙️</span>
          <span className="button-text">Settings</span>
        </button>

        <button className="nav-button messenger">
          <span className="button-icon">💬</span>
          <span className="button-text">Messenger</span>
          
        </button>
      </div>
    </div>
  );
};

export default Navbar;
