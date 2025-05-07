import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire,
} from '@fortawesome/free-solid-svg-icons';

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
  const cn = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <header
    className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled 
        ? 'bg-red-900 shadow-lg py-2' 
        : 'bg-gradient-to-b from-red-900/90 to-red-900/70 backdrop-blur-sm py-3'
    )}
    dir="rtl"
    >
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center">
          <span className="font-title text-xl md:text-2xl lg:text-3xl text-white block">
            לגלות את האור – הנני
          </span>
        </a>

        <div className="hidden lg:flex items-center">
        <ul className="flex items-center space-x-1 space-x-reverse text-white">
            {[
              { href: '#about-us', label: 'אדמאודות העמותה', icon: faLeaf },
              { href: '#leadership-program', label: 'תכנית המנהיגות', icon: faHammer },
              { href: '#projects', label: 'יצירות ופרויקטים', icon: faWind },
              { href: '#community', label: 'קהילת העמותה', icon: faWater },
              { href: '#events', label: 'הצטרפו אלינו', icon: faFire },
            ].map((item, i) => (
              <li key={i}>
                <a
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium gap-2 hover:bg-white/10"

                >
                  <FontAwesomeIcon icon={item.icon} className="text-xl" />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href="https://mrng.to/pFaSV3RKqT"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-orange-500 px-4 py-2 rounded-md hover:bg-white/90 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              >
                תרמו
              </a>
            </li>
          </ul>

          <div className="flex items-center space-x-4 space-x-reverse border-r border-white/20 pr-6">
            <a
              href="https://wa.me/972500000000"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-white hover:text-green-400 bg-green-600 hover:bg-green-700 transition-colors duration-200 p-1 w-7 h-7 rounded-full flex items-center justify-center"
            >
              <MessageCircle size={16} />
            </a>
            <a
              href="https://www.instagram.com/anatzigron"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white hover:text-pink-300 transition-colors duration-200"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.facebook.com/share/19ap5ErBo5/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white hover:text-blue-300 transition-colors duration-200"
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
          {isMenuOpen ? (
            <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-6 h-6">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-6 h-6">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      <div
        className={cn(
          'md:hidden bg-red-900 overflow-hidden transition-all duration-300',
          isMenuOpen ? 'max-h-screen' : 'max-h-0'
        )}
      >
        <ul className="flex flex-col space-y-3 p-4 text-white text-lg">
          {[
            { href: '#what-we-do', label: 'מיזמים חינוכיים' },
            { href: '#our-vision', label: 'החזון שלנו' },
            { href: '#join-us', label: 'הצטרפו אלינו' },
            { href: '/Contact', label: 'צרו קשר' },
          ].map((item, i) => (
            <li key={i}>
              <a href={item.href} onClick={toggleMenu} className="block py-2">
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://mrng.to/pFaSV3RKqT"
              target="_blank"
              rel="noopener noreferrer"
              onClick={toggleMenu}
              className="block py-2 bg-white text-orange-500 text-center rounded-md font-medium shadow"
            >
              תרמו
            </a>
          </li>
          <li className="pt-4 border-t border-white/20">
            <div className="flex justify-center items-center space-x-4 space-x-reverse">
              <a
                href="https://wa.me/972500000000"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-white bg-green-600 hover:bg-green-700 p-1 w-8 h-8 rounded-full flex items-center justify-center"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="https://www.instagram.com/anatzigron"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white hover:text-pink-300"
              >
                <Instagram size={22} />
              </a>
              <a
                href="https://www.facebook.com/share/19ap5ErBo5/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-white hover:text-blue-300"
              >
                <Facebook size={22} />
              </a>
            </div>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navigation;
