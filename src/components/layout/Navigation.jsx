
import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, MessageCircle, Phone } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire,
} from '@fortawesome/free-solid-svg-icons';

const sections = [
  { id: 'about-us', label: 'אדמאודות העמותה', icon: faLeaf },
  { id: 'leadership-program', label: 'תכנית המנהיגות', icon: faHammer },
  { id: 'projects', label: 'יצירות ופרויקטים', icon: faWind },
  { id: 'community', label: 'קהילת העמותה', icon: faWater },
  { id: 'events', label: 'הצטרפו אלינו', icon: faFire },
];

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      let found = '';
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= window.scrollY + 100) {
          found = section.id;
        }
      }
      setActiveSection(found);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cn = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-red-900 py-2 shadow-md'
          : 'bg-gradient-to-b from-red-900/90 to-red-900/60 backdrop-blur-sm py-3'
      )}
      dir="rtl"
    >
      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Main nav */}
      <nav className="relative z-50 container mx-auto flex items-center justify-between px-6 py-2">
        <a href="/" className="flex flex-col items-start">
          <span className="text-white font-bold text-xl md:text-2xl">לגלות את האור – הנני</span>
          <span className="text-white/80 text-sm hidden md:block">מנהיגות. יצירה. שייכות.</span>
        </a>

        <div className="hidden lg:flex items-center">
          <ul className="flex items-center space-x-1 space-x-reverse text-white">
            {sections.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10',
                    activeSection === item.id ? 'bg-white/20' : ''
                  )}
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
                className="ml-4 bg-white text-orange-500 px-4 py-2 rounded-md hover:bg-white/90 shadow-md font-medium transition-all"
              >
                תרמו
              </a>
            </li>
          </ul>

          <div className="flex items-center space-x-4 space-x-reverse border-r border-white/20 pr-6">
            <a href="tel:0500000000" className="text-white hover:text-green-400">
              <Phone size={20} />
            </a>
            <a
              href="https://wa.me/972500000000"
              target="_blank"
              className="text-white hover:text-green-400 bg-green-600 hover:bg-green-700 p-1 w-7 h-7 rounded-full flex items-center justify-center"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
            <a href="https://www.instagram.com/anatzigron" target="_blank" className="text-white hover:text-pink-300">
              <Instagram size={20} />
            </a>
            <a href="https://www.facebook.com/share/19ap5ErBo5/" target="_blank" className="text-white hover:text-blue-300">
              <Facebook size={20} />
            </a>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="lg:hidden text-white focus:outline-none"
          aria-label="פתח תפריט"
        >
          <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" className="w-6 h-6">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      {/* Slide-In Mobile Menu */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-72 z-50 bg-red-900 transform transition-transform duration-300 ease-in-out flex flex-col',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-white font-semibold text-lg">תפריט</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-white text-2xl focus:outline-none"
            aria-label="סגור תפריט"
          >
            &times;
          </button>
        </div>

        <ul className="flex-1 flex flex-col p-4 space-y-4 text-white text-lg">
          {sections.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
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
              className="block py-2 bg-white text-orange-500 text-center rounded-md font-medium shadow"
            >
              תרמו
            </a>
          </li>
        </ul>

        <div className="border-t border-white/10 p-4 text-white flex flex-col gap-3 text-center">
          <a href="tel:0500000000" className="hover:text-green-400">
            📞 התקשרו אלינו
          </a>
          <p className="text-xs text-white/70">כל הזכויות שמורות © 2025</p>
        </div>
      </div>
    </header>
  );
};

export default Navigation;