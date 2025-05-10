import { useState, useEffect } from 'react';

const ELEMENTS = [
  { key: 'earth', emoji: '🌱', color: 'from-green-600 to-emerald-500', lightColor: 'bg-green-100' },
  { key: 'metal', emoji: '⚒️', color: 'from-gray-600 to-slate-500', lightColor: 'bg-gray-100' },
  { key: 'air',   emoji: '💨', color: 'from-blue-500 to-cyan-400', lightColor: 'bg-blue-100' },
  { key: 'water', emoji: '💧', color: 'from-indigo-500 to-purple-400', lightColor: 'bg-indigo-100' },
  { key: 'fire',  emoji: '🔥', color: 'from-red-600 to-orange-500', lightColor: 'bg-red-100' },
];

export default function ElementalLoader() {
  const [activeElement, setActiveElement] = useState(0);
  const [progress, setProgress]         = useState(0);

  // progress + activeElement cycling
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
  const orbitDuration = 8; // seconds

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {/* loader header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Elements Loader</h2>
        <p className="text-gray-600">The five elements orbit as loading indicators</p>
      </div>

      <div className="relative w-40 h-40">
        {/* central loader */}
        <div
          className={`w-40 h-40 rounded-full flex items-center justify-center ${current.lightColor} shadow-lg transition-all duration-300`}
        >
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${current.color} opacity-90 transition-all duration-300`}
            style={{
              clipPath: `polygon(0 0,100% 0,100% ${progress}%,0 ${progress}%)`,
              transform: `rotate(${progress * 3.6}deg)`,
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-4xl">{current.emoji}</span>
            <span className="font-medium text-lg capitalize mt-2">{current.key}</span>
            <span className="text-sm">{progress}%</span>
          </div>
        </div>

        {/* orbiting elements */}
        {ELEMENTS.map((el, i) => {
          const angle = (360 / ELEMENTS.length) * i;
          return (
            <div
              key={el.key}
              className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-md"
              style={{
                background: '#fff',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(80px)`,
                animation: `orbit ${orbitDuration}s linear infinite`,
                animationDelay: `-${(i * orbitDuration) / ELEMENTS.length}s`,
              }}
            >
              <span className="text-lg">{el.emoji}</span>
            </div>
          );
        })}

        {/* keyframes injected locally */}
        <style>{`
          @keyframes orbit {
            from {
              transform: rotate(0deg) translateX(80px) rotate(0deg);
            }
            to {
              transform: rotate(360deg) translateX(80px) rotate(-360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
// EXAMPLPE USAGE src/App.jsx
// import React from 'react';
// import ElementalLoader from '@/components/ElementalLoader'; 

// function App() {
//   return (
//     <div className="App">
//       {/* ...maybe conditionally show while data’s loading */}
//       <ElementalLoader />
//     </div>
//   );
// }

// export default App;
