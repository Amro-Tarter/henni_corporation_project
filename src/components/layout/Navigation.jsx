import React, { useState, useEffect, useRef } from 'react';
import { Facebook, Instagram, MessageCircle, Phone, LogIn, LogOut, User } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf,
  faHammer,
  faWind,
  faWater,
  faFire,
} from '@fortawesome/free-solid-svg-icons';
import { auth } from '@/config/firbaseConfig';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';

const sections = [
  { id: 'about-us', label: 'אודות העמותה', icon: faLeaf },
  { id: 'leadership-program', label: 'תכנית המנהיגות', icon: faHammer },
  { id: 'projects', label: 'יצירות ופרויקטים', icon: faWind },
  { id: 'community', label: 'קהילת העמותה', icon: faWater },
  { id: 'events', label: 'הצטרפו אלינו', icon: faFire },
];

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const authDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Scroll & active section tracking + progress bar
  useEffect(() => {
    const onScroll = () => {
      // Handle nav transparency
      setIsScrolled(window.scrollY > 50);
      
      // Handle active section
      let found = '';
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= window.scrollY + 100) {
          found = section.id;
        }
      }
      setActiveSection(found);
      
      // Calculate scroll progress
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };
    
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Listen for Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Close auth dropdown on outside click
  useEffect(() => {
    const onClickOutside = e => {
      if (showAuthDropdown && authDropdownRef.current && !authDropdownRef.current.contains(e.target)) {
        setShowAuthDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showAuthDropdown]);

  const handleSignIn = async () => {
  // redirect to sign in page
    window.location.href = '/login';
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // remove our persisted cookie
      Cookies.remove("authToken");
      // close the dropdown
      setShowAuthDropdown(false);
      // kick them back to login
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleAuthDropdown = e => {
    e.stopPropagation();
    setShowAuthDropdown(prev => !prev);
  };

  const cn = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-red-900 py-2 shadow-md'
        )}
        dir="rtl"
      >
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <nav className="relative z-50 container mx-auto flex items-center justify-between px-6">
          <a href="/" className="flex flex-col items-start">
            <span className="text-white font-bold text-xl md:text-2xl">לגלות את האור – הנני</span>
            <span className="text-white/80 text-sm hidden md:block">מנהיגות. יצירה. שייכות.</span>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center">
            <ul className="flex items-center space-x-1 space-x-reverse text-white">
              {sections.map(item => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10',
                      activeSection === item.id && 'bg-white/20'
                    )}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-xl" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            
            </ul>

            <div className="flex items-center space-x-4 space-x-reverse border-r border-white/20 mr-4 pr-6">
              <a href="tel:0500000000" className="text-white hover:text-green-400">
                <Phone size={20} />
              </a>
              <a href="https://www.instagram.com/anatzigron" target="_blank" className="text-white hover:text-pink-300">
                <Instagram size={20} />
              </a>
              <a href="https://www.facebook.com/share/19ap5ErBo5/" target="_blank" className="text-white hover:text-blue-300">
                <Facebook size={20} />
              </a>
            </div>

            {/* Auth */}
            <div className="relative" ref={authDropdownRef}>
              <button
                onClick={toggleAuthDropdown}
                className={cn(
                  'flex items-center gap-2 text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all',
                  showAuthDropdown && 'bg-white/20'
                )}
              >
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  {currentUser ? <User size={18} className="text-white" /> : <LogIn size={18} className="text-white" />}
                </div>
                <span className="text-sm font-medium">
                  {currentUser ? (currentUser.displayName || 'החשבון שלי') : 'התחברות'}
                </span>
              </button>
                  {/* Auth Dropdown */}
              {showAuthDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200 truncate">
                        {currentUser.email}
                      </div>
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        הפרופיל שלי
                      </a>
                      <a href="/publicSettings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        הגדרות
                      </a>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="ml-2" />
                        <span>התנתקות</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSignIn}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogIn size={16} className="ml-2" />
                        <span>התחבר</span>
                      </button>
                      <a href="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        הרשמה
                      </a>
                      <a href="/forgot-password" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        שכחתי סיסמה
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
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

        {/* Progress Bar */}
        <div 
          className="blog_progress_bar absolute bottom-0 left-0 h-1 bg-orange-400 transition-all duration-200"
          style={{ width: `${scrollProgress}%`, opacity: scrollProgress > 0 ? 1 : 0, willChange: 'width, height, opacity' }}
          aria-hidden="true"
        />

        {/* Mobile Menu */}
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
            {sections.map(item => (
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

            {/* Mobile Auth */}
            <li className="pt-4 border-t border-white/10">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    <span>{currentUser.displayName || currentUser.email}</span>
                  </div>
                  <a href="/profile" className="block py-2 pr-10 hover:bg-white/10 rounded-lg">
                    הפרופיל שלי
                  </a>
                  <a href="/publicSettings" className="block py-2 pr-10 hover:bg-white/10 rounded-lg">
                    הגדרות
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 py-2 text-red-300 hover:bg-white/10 rounded-lg"
                  >
                    <LogOut size={18} />
                    <span>התנתקות</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="w-full flex justify-center items-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  <LogIn size={18} />
                  <span> התחבר</span>
                </button>
              )}
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
    </>
  );
};

export default Navigation;