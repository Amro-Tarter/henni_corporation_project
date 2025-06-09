import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Facebook,
  Instagram,
  Phone,
  LogIn,
  LogOut,
  User,
  BarChart2,
  Flame
} from 'lucide-react';
import { auth } from '@/config/firbaseConfig';
import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import Cookies from "js-cookie";
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import AirIcon from '@mui/icons-material/Air';

const sections = [
  { id: 'about-section',      label: 'אודות העמותה',      icon: '🌱' },
  { id: 'leadership-program', label: 'תכנית המנהיגות',      icon: '⚒️' },
  { id: 'gallery',            label: 'גלריה',              icon: <AirIcon style={{ color: '#87ceeb' }} /> },
  { id: 'projects',           label: 'פרויקטים',           icon: '💧' },
  { id: 'join-us',            label: 'הצטרפו אלינו',       icon: '🔥' },
];

export default function Navigation() {
  // --- Animated background state ---
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 8,
      duration: Math.random() * 6 + 8,
      type: Math.random() > 0.7 ? 'star' : 'ember'
    }));
    setParticles(newParticles);
  }, []);

  const handleMouseMoveBG = useCallback(e => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  }, []);

  // --- Navigation state & effects ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState(null);
  const authDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch username/profile & role
  useEffect(() => {
    if (!currentUser) return setUsername('');
    (async () => {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      setUsername(snap.exists() ? snap.data().username : '');
    })();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return setRole(null);
    (async () => {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      setRole(snap.exists() ? snap.data().role : null);
    })();
  }, [currentUser]);

  // Scroll handling
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((winScroll / height) * 100);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auth listener
  useEffect(() => onAuthStateChanged(auth, setCurrentUser), []);

  // Close dropdown on outside click
  useEffect(() => {
    const onClickOutside = e => {
      if (showAuthDropdown && authDropdownRef.current && !authDropdownRef.current.contains(e.target)) {
        setShowAuthDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showAuthDropdown]);

  const handleSignIn = () => window.location.href = '/login';
  const handleSignOut = async () => {
    await signOut(auth);
    Cookies.remove("authToken");
    setShowAuthDropdown(false);
    setRole(null);
    navigate("/", { replace: true });
  };
  const toggleAuthDropdown = e => { e.stopPropagation(); setShowAuthDropdown(prev => !prev); };

  const handleSectionClick = (e, id) => {
    e.preventDefault();
    isMenuOpen && setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToSection: id } });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTabClick = (tab, path) => {
    navigate(path);
  };

  useEffect(() => {
    if (location.state?.scrollToSection) {
      const id = location.state.scrollToSection;
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        navigate('/', { replace: true, state: {} });
      }, 100);
    }
  }, [location.state, navigate]);

  const cn = (...classes) => classes.filter(Boolean).join(' ');

  return (
    <>
     <header
        onMouseMove={handleMouseMoveBG}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
            'fixed top-0 left-0 right-0 w-full overflow-visible z-50 transition-all duration-300 bg-red-900 py-3 shadow-md',
          isScrolled && 'backdrop-blur-sm bg-red-900/90'
        )}
        dir="rtl"
      >
        {/* 1) Base gradient */}
        <div className="absolute inset-0 bg-red-900 opacity-95" />

        {/* 2) Mouse-follow spotlight */}
        <div
          className="absolute inset-0 opacity-20 transition-all duration-700 ease-out"
          style={{
            background: `radial-gradient(
              600px circle at ${mousePosition.x}% ${mousePosition.y}%,
              rgba(251,146,60,0.3),
              transparent 50%
            )`
          }}
        />

        {/* 3) Floating embers & stars */}
        {particles.map(p => (
          <div
            key={p.id}
            className={`absolute bottom-0 ${p.type==='star'?'star':'ember'} ${
              p.type==='star'?'bg-yellow-300':'bg-orange-300'
            }`}
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}

        {/* 4) Soft glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-400/10 rounded-full blur-xl animate-pulse-slow" />
        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-red-400/10 rounded-full blur-xl animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        />

        {/* 6) Animated borders */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-300/0 via-orange-300 to-orange-300/0 shadow-lg shadow-orange-300/20" />

        {/* --- Navigation Bar --- */}
        <nav className="relative z-50 container mx-auto flex items-end justify-between px-3">
          <a href="/" className="flex items-center gap-2">
            <img src="/logoo.svg" alt="לגלות את האור - הנני" className="h-10 md:h-12 w-auto" />
          </a>

          <div className="hidden lg:flex items-center">
            <ul className="flex items-center gap-3 text-white whitespace-nowrap">
              {sections.map(item => (
                <li key={item.id}>
                  <span
                    onClick={e => handleSectionClick(e, item.id)}
                    className={cn(
                      'flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium hover:bg-white/10 cursor-pointer whitespace-nowrap',
                      activeSection === item.id && 'bg-white/10'
                    )}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                </li>
              ))}
              <a
                href="https://mrng.to/pFaSV3RKqT"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-2 flex items-center bg-white text-orange-600 px-3 py-1 rounded-lg shadow-md hover:bg-orange-50 transition-all duration-200"
              >
                תרמו לנו
              </a>
            </ul>

            <div className="flex items-center space-x-4 space-x-reverse pr-6">
              <div className="h-6 border-r border-white/30"></div>
              <a href="tel:+972502470857" className="text-white hover:text-green-400">
                <Phone size={20} />
              </a>
              <a href="https://www.instagram.com/anatzigron" target="_blank" className="text-white hover:text-pink-300">
                <Instagram size={20} />
              </a>
              <a href="https://www.facebook.com/share/19ap5ErBo5/" target="_blank" className="text-white hover:text-blue-300">
                <Facebook size={20} />
              </a>
            </div>

            <div className="relative" ref={authDropdownRef}>
              <button
                onClick={toggleAuthDropdown}
                className={cn(
                  'flex items-center gap-2 text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all',
                  showAuthDropdown && 'bg-white/20'
                )}
              >
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  {currentUser ? <User size={18} /> : <LogIn size={18} />}
                </div>
               <span className="text-sm font-medium whitespace-nowrap truncate">
                  {currentUser ? (username || 'החשבון שלי') : 'התחברות'}
                </span>
              </button>
              {showAuthDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200 truncate">
                        {currentUser.email}
                      </div>
                      <button
                        onClick={async () => {
                          const snap = await getDoc(doc(db, 'profiles', currentUser.uid));
                          if (snap.exists()) navigate(`/profile/${snap.data().username}`);
                        }}
                        className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        הפרופיל שלי
                      </button>
                      <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        הגדרות
                      </a>
                      {(role === 'admin' || role === 'staff') && (
                        <button
                          onClick={() => { handleTabClick('dashboard', '/admin'); setShowAuthDropdown(false); }}
                          className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          לוח בקרה
                        </button>
                      )}
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="ml-2" />
                        התנתקות
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSignIn}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogIn size={16} className="ml-2" />
                        התחבר
                      </button>
                      <a href="/signUp" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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

        <div
          className="blog_progress_bar absolute bottom-0 left-0 h-2 bg-orange-400 transition-all duration-200"
          style={{ width: `${scrollProgress}%`, opacity: scrollProgress > 0 ? 1 : 0 }}
          aria-hidden="true"
        />

        <div
          className={cn(
            'fixed top-0 right-0 h-full w-72 z-50 bg-red-900 transform transition-transform duration-300 ease-in-out flex flex-col',
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* ... mobile menu content ... */}
        </div>
      </header>

      {/* CSS for animated background */}
      <style>{`
        .ember {
          position: absolute;
          border-radius: 50%;
          animation: float-up linear infinite;
          box-shadow: 0 0 6px rgba(251,146,60,0.8);
        }
        .star {
          position: absolute;
          clip-path: polygon(
            50% 0%, 61% 35%, 98% 35%, 68% 57%,
            79% 91%, 50% 70%, 21% 91%, 32% 57%,
            2% 35%, 39% 35%
          );
          animation: float-up-star linear infinite;
          box-shadow: 0 0 8px rgba(254,240,138,0.8);
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity:1; }
          50% { opacity:0.8; }
          100% { transform: translateY(-100vh) scale(0) rotate(360deg); opacity:0; }
        }
        @keyframes float-up-star {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity:1; }
          50% { transform: translateY(-50vh) scale(1.2) rotate(180deg); opacity:0.9; }
          100% { transform: translateY(-100vh) scale(0) rotate(360deg); opacity:0; }
        }
        @keyframes pulse-slow {
          0%,100% { opacity:0.3; transform:scale(1); }
          50% { opacity:0.6; transform:scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
