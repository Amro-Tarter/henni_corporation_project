import { useState, useEffect } from 'react';
import AirIcon from '@mui/icons-material/Air';

const ELEMENTS = [
  { key: 'earth', emoji: '🌱', color: 'from-green-600 to-emerald-500', bgColor: 'bg-green-100' },
  { key: 'metal', emoji: '⚒️', color: 'from-gray-600 to-slate-500', bgColor: 'bg-gray-100' },
  { key: 'air',   emoji: <AirIcon style={{color: '#87ceeb'}} />, color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-100' },
  { key: 'water', emoji: '💧', color: 'from-indigo-500 to-purple-400', bgColor: 'bg-indigo-100' },
  { key: 'fire',  emoji: '🔥', color: 'from-red-600 to-orange-500', bgColor: 'bg-red-100' },
];

export default function CleanElementalOrbitLoader() {
  const [activeElement, setActiveElement] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Fade in on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Cycle through elements
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveElement(a => (a + 1) % ELEMENTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = ELEMENTS[activeElement];
  const orbitDuration = 12; // seconds for full orbit rotation
  
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-4"
      role="status"
      aria-label="Loading elements"
    >

      {/* Loader container */}
      <div 
        className={`relative w-64 h-64 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Orbit track */}
        <div className="absolute inset-0 rounded-full border border-gray-200 opacity-30"></div>
        
        {/* Central element display */}
        <div 
          className={`absolute inset-0 m-auto w-24 h-24 rounded-full flex items-center justify-center shadow transition-all duration-700 ${current.bgColor}`}
        >
          <span className="text-4xl">{current.emoji}</span>
        </div>
        
        {/* Orbiting elements */}
        {ELEMENTS.map((el, i) => {
          // Distribute elements evenly around the orbit
          const isActive = activeElement === i;
          
          return (
            <div
              key={el.key}
              className={`absolute top-1/2 left-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow transition-all duration-500 bg-white ${isActive ? 'z-20' : 'z-10'}`}
              style={{
                transform: isActive ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%) scale(1)',
                animation: `orbitAnimation ${orbitDuration}s linear infinite`,
                animationDelay: `-${(i * orbitDuration) / ELEMENTS.length}s`,
              }}
            >
              <span className="text-lg">{el.emoji}</span>
            </div>
          );
        })}

        {/* Trailing orbit particles (decorative) */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div 
              key={`particle-${i}`} 
              className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-300 opacity-40"
              style={{
                animation: `orbitAnimation ${orbitDuration}s linear infinite`,
                animationDelay: `-${(i * orbitDuration) / 20}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Keyframes for orbit animation */}
        <style>{`
          @keyframes orbitAnimation {
            0% {
              transform: translate(-50%, -50%) rotate(0deg) translateX(112px) rotate(0deg);
            }
            100% {
              transform: translate(-50%, -50%) rotate(360deg) translateX(112px) rotate(-360deg);
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