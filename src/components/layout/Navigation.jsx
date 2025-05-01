import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

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

  const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-red-900 shadow-md" : "bg-red-900 shadow-sm"
    )}>
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center">
          <div className="flex items-center">
            <span className="font-title text-2xl md:text-3xl text-white">
              לגלות את האור – הנני
            </span>
          </div>
        </a>

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
              <a href="/Contact" className="hover:text-white/80 transition-colors px-3 py-2 text-lg">
                צרו קשר
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

          <div className="flex items-center space-x-4 border-r border-white/20 pr-6">
            <a 
              href="https://wa.me/972500000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-green-400 transition-colors duration-200 flex items-center justify-center bg-green-600 rounded-full p-1 w-7 h-7 hover:bg-green-700"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
            <a 
              href="https://www.instagram.com/anatzigron" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition-colors duration-200 flex items-center justify-center"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://www.facebook.com/share/19ap5ErBo5/"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition-colors duration-200 flex items-center justify-center"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
          </div>
        </div>

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

        <div 
          className={cn(
            "md:hidden absolute top-full left-0 right-0 bg-red-900 shadow-sm transition-all duration-300 overflow-hidden",
            isMenuOpen ? "max-h-screen" : "max-h-0"
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
              <a href="/Contact" className="block py-2 text-lg" onClick={toggleMenu}>
                צרו קשר
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
            <li className="pt-4 border-t border-white/20">
              <div className="flex items-center space-x-4 justify-center">
                <a 
                  href="https://wa.me/972500000000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-green-400 transition-colors duration-200 flex items-center justify-center bg-green-600 rounded-full p-1 w-8 h-8 hover:bg-green-700"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={18} />
                </a>
           
                <a 
                  href="https://www.instagram.com/anatzigron" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-300 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram size={22} />
                </a>
                <a 
                  href="https://www.facebook.com/share/19ap5ErBo5/"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-300 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook size={22} />
                </a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;