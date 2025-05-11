import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firbaseConfig';

const ELEMENTS = [
  { key: 'earth', emoji: '🌱', color: 'from-green-600 to-emerald-500', bgColor: 'bg-green-100', borderColor: 'border-green-500' },
  { key: 'metal', emoji: '⚒️', color: 'from-gray-600 to-slate-500', bgColor: 'bg-gray-100', borderColor: 'border-gray-500' },
  { key: 'air',   emoji: '💨', color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-100', borderColor: 'border-blue-500' },
  { key: 'water', emoji: '💧', color: 'from-indigo-500 to-purple-400', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-500' },
  { key: 'fire',  emoji: '🔥', color: 'from-red-600 to-orange-500', bgColor: 'bg-red-100', borderColor: 'border-red-500' },
];

export default function UserElementOrbitLoader({ userId }) {
  const [userElement, setUserElement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Fetch user element from Firestore
  useEffect(() => {
    const fetchUserElement = async () => {
      if (!userId) return;
      
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const elementObj = ELEMENTS.find(el => el.key === userData.element) || ELEMENTS[0];
          setUserElement(elementObj);
        } else {
          // Default to first element if user not found
          setUserElement(ELEMENTS[0]);
        }
      } catch (error) {
        console.error("Error fetching user element:", error);
        // Fallback to first element
        setUserElement(ELEMENTS[0]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserElement();
  }, [userId]);
  
  // Fade in on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 0.5;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // SVG properties for circular progress
  const circleRadius = 128;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const orbitDuration = 12; // seconds for full orbit rotation
  
  // If we're still loading user data or don't have element info yet
  if (loading || !userElement) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-gray-50 p-4"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin="0" 
      aria-valuemax="100"
      aria-label={`Loading ${progress.toFixed(0)} percent complete`}
    >
      {/* Loader container */}
      <div 
        className={`relative w-64 h-64 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          {/* Background circle */}
          <circle 
            cx="128" 
            cy="128" 
            r={circleRadius} 
            fill="none" 
            stroke="#e5e7eb" 
            strokeWidth="4"
            className="opacity-30"
          />
          
          {/* Progress circle */}
          <circle 
            cx="128" 
            cy="128" 
            r={circleRadius} 
            fill="none" 
            stroke={`url(#gradient-${userElement.key})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-out"
          />
          
          {/* Gradient definitions */}
          <defs>
            {ELEMENTS.map((el) => (
              <linearGradient key={`gradient-${el.key}`} id={`gradient-${el.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={el.color.split(' ')[0].replace('from-', 'text-')} style={{stopColor: 'currentColor'}} />
                <stop offset="100%" className={el.color.split(' ')[1].replace('to-', 'text-')} style={{stopColor: 'currentColor'}} />
              </linearGradient>
            ))}
          </defs>
        </svg>
        
        {/* Central user element display */}
        <div 
          className={`absolute inset-0 m-auto w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-700 ${userElement.bgColor}`}
        >
          <span className="text-4xl">{userElement.emoji}</span>
        </div>
        
        {/* Orbiting elements */}
        {ELEMENTS.map((el, i) => {
          const isUserElement = el.key === userElement.key;
          
          return (
            <div
              key={el.key}
              className={`absolute top-1/2 left-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-500 bg-white ${isUserElement ? 'border-2 ' + el.borderColor : ''}`}
              style={{
                transform: isUserElement ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%) scale(1)',
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
          {[...Array(12)].map((_, i) => (
            <div 
              key={`particle-${i}`} 
              className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-300 opacity-40"
              style={{
                animation: `orbitAnimation ${orbitDuration}s linear infinite`,
                animationDelay: `-${(i * orbitDuration) / 12}s`,
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
        `}</style>
      </div>
    </div>
  );
}