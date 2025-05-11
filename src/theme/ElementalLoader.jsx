import { useState, useEffect } from 'react';

const ELEMENTS = [
  { key: 'earth', emoji: '🌱', color: 'from-green-600 to-emerald-500', lightColor: 'bg-green-100', accentColor: 'bg-green-400' },
  { key: 'metal', emoji: '⚒️', color: 'from-gray-600 to-slate-500', lightColor: 'bg-gray-100', accentColor: 'bg-gray-400' },
  { key: 'air',   emoji: '💨', color: 'from-blue-500 to-cyan-400', lightColor: 'bg-blue-100', accentColor: 'bg-blue-400' },
  { key: 'water', emoji: '💧', color: 'from-indigo-500 to-purple-400', lightColor: 'bg-indigo-100', accentColor: 'bg-indigo-400' },
  { key: 'fire',  emoji: '🔥', color: 'from-red-600 to-orange-500', lightColor: 'bg-red-100', accentColor: 'bg-red-400' },
];

export default function EnhancedElementalLoader() {
  const [activeElement, setActiveElement] = useState(0);
  const [progress, setProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth progress tracking with separate display value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayedProgress(progress);
    }, 20);
    return () => clearTimeout(timer);
  }, [progress]);

  // Fade in on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Progress + activeElement cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setTimeout(() => {
            setActiveElement(a => (a + 1) % ELEMENTS.length);
          }, 200);
          return 0;
        }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const current = ELEMENTS[activeElement];
  const circleRadius = 36; // SVG circle radius
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const orbitDuration = 8; // seconds
  const containerSize = 160; // Size of the entire container
  const orbitRadius = containerSize * 0.5; // Responsive orbit radius

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin="0" 
      aria-valuemax="100"
      aria-label={`Loading ${current.key} element, ${displayedProgress} percent complete`}
    >
      {/* Loader header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Elements Loader</h2>
        <p className="text-gray-600">The five elements orbit as loading indicators</p>
      </div>

      {/* Loader container */}
      <div 
        className={`relative w-40 h-40 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Background spinning ring */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="46" 
              fill="none" 
              stroke="#f3f4f6" 
              strokeWidth="3"
              className="opacity-70" 
            />
            <circle 
              cx="50" 
              cy="50" 
              r="46" 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="3"
              strokeDasharray="12 4" 
              className="animate-spin opacity-50" 
              style={{ animationDuration: '15s' }}
            />
          </svg>
        </div>

        {/* Central loader with SVG circular progress */}
        <div className={`w-40 h-40 rounded-full flex items-center justify-center ${current.lightColor} shadow-lg transition-all duration-300`}>
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle 
              cx="80" 
              cy="80" 
              r={circleRadius}  
              fill="none" 
              stroke={`url(#gradient-${activeElement})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-out"
            />
            <defs>
              {ELEMENTS.map((el, i) => (
                <linearGradient key={i} id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={el.color.split(' ')[0].replace('from-', 'text-')} style={{stopColor: 'currentColor'}} />
                  <stop offset="100%" className={el.color.split(' ')[1].replace('to-', 'text-')} style={{stopColor: 'currentColor'}} />
                </linearGradient>
              ))}
            </defs>
          </svg>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>{current.emoji}</span>
            <span className="font-medium text-lg capitalize mt-2">{current.key}</span>
            <span className="text-sm font-mono transition-all duration-200">{displayedProgress}%</span>
          </div>
        </div>

        {/* Orbiting elements */}
        {ELEMENTS.map((el, i) => {
          const angle = (360 / ELEMENTS.length) * i;
          const isActive = activeElement === i;
          
          return (
            <div
              key={el.key}
              className={`absolute top-1/2 left-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${isActive ? 'z-20' : 'z-10'}`}
              style={{
                background: '#fff',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${orbitRadius}px) scale(${isActive ? 1.15 : 1})`,
                boxShadow: isActive ? `0 0 16px ${el.accentColor.replace('bg-', 'rgba(').split('-')[1]})` : 'none',
              }}
            >
              <span className="text-lg">{el.emoji}</span>
              {isActive && (
                <div className={`absolute inset-0 rounded-full ${el.accentColor} opacity-20 animate-ping`}></div>
              )}
            </div>
          );
        })}

        {/* Responsive orbit path visualization */}
        <div className="absolute inset-0 rounded-full border border-gray-200 opacity-30"></div>

        {/* Keyframes injected locally */}
        <style>{`
          @keyframes orbit {
            from {
              transform: rotate(0deg) translateX(${orbitRadius}px) rotate(0deg);
            }
            to {
              transform: rotate(360deg) translateX(${orbitRadius}px) rotate(-360deg);
            }
          }
          
          @media (max-width: 640px) {
            .text-4xl {
              font-size: 1.5rem;
            }
            .text-2xl {
              font-size: 1.25rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
}