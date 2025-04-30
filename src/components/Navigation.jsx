import React, { useState, useEffect } from 'react';
import { Facebook, Instagram } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Helper function to conditionally join classnames (similar to cn from @/lib/utils)
  const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-red-900 shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <div className="flex items-center">
            <span className="font-title text-2xl md:text-3xl text-white">
              לגלות את האור – הנני
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <ul className="flex space-x-6 items-center text-white">
            <li>
              <a href="#what-we-do" className="hover:text-white/80 transition-colors px-3 py-2 text-lg">
                מיזמים חינוכיים
              </a>
            </li>
            <li>
              <a href="#our-vision" className="hover:text-white/80 transition-colors px-3 py-2 text-lg">
                החזון שלנו
              </a>
            </li>
            <li>
              <a href="#join-us" className="hover:text-white/80 transition-colors px-3 py-2 text-lg">
                הצטרפו אלינו
              </a>
            </li>
            <li>
              <a 
                href="https://mrng.to/pFaSV3RKqT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-orange-500 px-4 py-2 rounded-md hover:bg-white/90 transition-all duration-300 shadow-md hover:shadow-lg text-lg font-medium"
              >
                תרמו
              </a>
            </li>
          </ul>

          {/* Social Media Links */}
          <div className="flex items-center space-x-6 border-r border-white/20 pr-6">
            <a 
              href="https://www.instagram.com/anatzigron" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://www.facebook.com/share/19ap5ErBo5/"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition-colors duration-200"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a 
              href="https://chat.whatsapp.com/EdpRKYWJk6NCRXynXKS091" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition-colors duration-200"
              aria-label="WhatsApp"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                  d="M20.5823 3.38C19.0873 1.86 16.9123 0.75 14.6473 0.75H9.3523C7.0873 0.75 4.9123 1.86 3.4173 3.38C1.9123 4.88 0.7923 7.06 0.7923 9.34V14.66C0.7923 16.94 1.9023 19.12 3.4173 20.62C4.9123 22.14 7.0873 23.25 9.3523 23.25H14.6473C16.9123 23.25 19.0873 22.14 20.5823 20.62C22.0973 19.12 23.2073 16.94 23.2073 14.66V9.34C23.2073 7.06 22.0973 4.88 20.5823 3.38Z" 
                  fill="currentColor" 
                  fillOpacity="0.5"
                />
                <path 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                  d="M17.5 12C17.5 14.98 15.04 17.44 12.06 17.44C10.58 17.44 9.24 16.78 8.35 15.73L5.31 16.59L6.16 13.63C5.22 12.78 4.62 11.5 4.62 10.06C4.62 7.08 7.08 4.62 10.06 4.62C13.04 4.62 15.5 7.08 15.5 10.06C15.5 10.97 15.28 11.83 14.89 12.6" 
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={isMenuOpen ? "hidden" : "block"}
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={isMenuOpen ? "block" : "hidden"}
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Mobile Navigation */}
        <div 
          className={cn(
            "md:hidden absolute top-full left-0 right-0 bg-red-900 shadow-sm transition-all duration-300 overflow-hidden",
            isMenuOpen ? "max-h-96" : "max-h-0"
          )}
        >
          <ul className="flex flex-col space-y-3 p-4 text-white">
            <li>
              <a href="#what-we-do" className="block py-2 text-lg" onClick={toggleMenu}>
                מיזמים חינוכיים
              </a>
            </li>
            <li>
              <a href="#our-vision" className="block py-2 text-lg" onClick={toggleMenu}>
                החזון שלנו
              </a>
            </li>
            <li>
              <a href="#join-us" className="block py-2 text-lg" onClick={toggleMenu}>
                הצטרפו אלינו
              </a>
            </li>
            <li>
              <a 
                href="https://mrng.to/pFaSV3RKqT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block py-2 bg-white text-orange-500 rounded-md text-center shadow-lg text-lg font-medium"
                onClick={toggleMenu}
              >
                תרמו
              </a>
            </li>
            <li className="flex justify-center space-x-6 pt-3 border-t border-white/20">
              <a 
                href="https://www.instagram.com/anatzigron" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-orange-300 transition-colors duration-200"
                onClick={toggleMenu}
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://www.facebook.com/share/19ap5ErBo5/"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-orange-300 transition-colors duration-200"
                onClick={toggleMenu}
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://chat.whatsapp.com/EdpRKYWJk6NCRXynXKS091" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-orange-300 transition-colors duration-200"
                onClick={toggleMenu}
                aria-label="WhatsApp"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M20.5823 3.38C19.0873 1.86 16.9123 0.75 14.6473 0.75H9.3523C7.0873 0.75 4.9123 1.86 3.4173 3.38C1.9123 4.88 0.7923 7.06 0.7923 9.34V14.66C0.7923 16.94 1.9023 19.12 3.4173 20.62C4.9123 22.14 7.0873 23.25 9.3523 23.25H14.6473C16.9123 23.25 19.0873 22.14 20.5823 20.62C22.0973 19.12 23.2073 16.94 23.2073 14.66V9.34C23.2073 7.06 22.0973 4.88 20.5823 3.38Z" 
                    fill="currentColor" 
                    fillOpacity="0.5"
                  />
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M17.5 12C17.5 14.98 15.04 17.44 12.06 17.44C10.58 17.44 9.24 16.78 8.35 15.73L5.31 16.59L6.16 13.63C5.22 12.78 4.62 11.5 4.62 10.06C4.62 7.08 7.08 4.62 10.06 4.62C13.04 4.62 15.5 7.08 15.5 10.06C15.5 10.97 15.28 11.83 14.89 12.6" 
                    fill="currentColor"
                  />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
