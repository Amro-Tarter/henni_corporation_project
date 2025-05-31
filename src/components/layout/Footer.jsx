import React, { useState, useEffect, useCallback } from 'react';
import { Flame, Mail, Phone, MessageSquare, ExternalLink, Heart, Star, Sparkles } from 'lucide-react';

const Footer = () => {
  // State for animated particles
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate random particles on mount
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

  // Mouse tracking for interactive effects
  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  }, []);

  return (
    <footer 
      className="bg-red-900 text-white pt-20 pb-8 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced animated background with multiple layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-950 to-black opacity-95" />
      
      {/* Dynamic gradient overlay that follows mouse */}
      <div 
        className="absolute inset-0 opacity-20 transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(251, 146, 60, 0.3), transparent 50%)`
        }}
      />
      
      {/* Animated embers/particles with enhanced variety */}
      {particles.map(particle => (
        <div 
          key={particle.id}
          className={`absolute bottom-0 ${particle.type === 'star' ? 'star' : 'ember'} ${
            particle.type === 'star' ? 'bg-yellow-300' : 'bg-orange-300'
          }`}
          style={{
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
      
      {/* Floating light orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-400/10 rounded-full blur-xl animate-pulse-slow" />
      <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-red-400/10 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      {/* Enhanced decorative flame icon with glow */}
      <div className="absolute top-8 right-8 opacity-8">
        <div className="relative">
          <Flame size={240} className="text-orange-300/20" />
          <div className="absolute inset-0 blur-sm">
            <Flame size={240} className="text-orange-400/10" />
          </div>
        </div>
      </div>
      
      {/* Animated border elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-300/0 via-orange-300 to-orange-300/0 shadow-lg shadow-orange-300/20" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Enhanced Brand Column */}
          <div className="md:col-span-1">
            <div className="group relative">
              <div className="flex items-center mb-6 p-4 rounded-lg bg-gradient-to-r from-red-800/40 to-red-900/40 backdrop-blur-sm border border-red-700/30 hover:border-orange-300/50 transition-all duration-300">
                <div className="relative">
                  <Flame className="mr-3 text-orange-300 group-hover:text-yellow-300 transition-colors duration-300" size={32} />
                  <div className="absolute inset-0 blur-sm opacity-50">
                    <Flame className="mr-3 text-orange-400" size={32} />
                  </div>
                </div>
                <h3 className="font-gveret-levin text-2xl bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                  עמותת לגלות את האור – הנני 
                </h3>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-800/30 to-red-950/30 p-6 rounded-xl backdrop-blur-sm border border-red-700/30 hover:border-orange-300/40 transition-all duration-300 shadow-xl">
              <p className="text-white/90 mb-6 leading-relaxed text-lg">
                מיזם העצמה לנוער באמצעות יצירה, התפתחות רגשית ומנהיגות אמנותית בקהילה
              </p>
              <div className="flex items-center text-white/90 p-3 rounded-lg bg-red-800/40">
                <Heart size={20} className="text-red-300 mr-3 animate-pulse" />
                <div>
                  <p className="font-bold">מייסדת: ענת זיגרון</p>
                  <p className="text-sm text-white/70 mt-1">עם אהבה וייעוד לקהילה</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Legal Links Column */}
          <div className="md:col-span-1">
            <h3 className="font-gveret-levin text-xl mb-6">
              <span className="relative inline-block p-2">
                קישורים מהירים
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-300 to-transparent"></span>
                <span className="absolute -bottom-2 left-2 right-2 h-px bg-gradient-to-r from-transparent via-orange-300/30 to-transparent"></span>
              </span>
            </h3>
            <div className="space-y-2">
              {[
                { path: '/accessibility', label: 'הצהרת נגישות' },
                { path: '/privacy', label: 'הצהרת פרטיות' },
                { path: '/terms', label: 'תנאי שימוש' },
                { path: '/contact', label: 'צור קשר' }
              ].map((link, index) => (
                <div
                  key={link.path}
                  className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-800/20 to-transparent hover:from-orange-800/30 hover:to-red-800/20 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <a
                    href={link.path}
                    className="flex items-center p-3 text-orange-300 hover:text-orange-200 transition-all duration-300 group-hover:translate-x-1"
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-300 to-yellow-300 mr-3 group-hover:scale-125 transition-transform duration-200" />
                    <span className="font-bold">{link.label}</span>
                    <ExternalLink size={14} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </a>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/5 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Enhanced Contact Column */}
          <div className="md:col-span-2">
            <h3 className="font-gveret-levin text-xl mb-6">
              <span className="relative inline-block p-2">
                צרו קשר
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-300 to-transparent"></span>
                <span className="absolute -bottom-2 left-2 right-2 h-px bg-gradient-to-r from-transparent via-orange-300/30 to-transparent"></span>
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CTA Button */}
              <div className="md:col-span-2">
                <button className="group relative w-full px-8 py-4 overflow-hidden font-bold text-white rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:via-orange-400 hover:to-red-500 transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] shadow-2xl hover:shadow-amber-500/25">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
                  <span className="relative flex items-center justify-center">
                    <Sparkles className="ml-2" size={20} />
                    צרו קשר עכשיו
                    <Sparkles className="mr-2" size={20} />
                  </span>
                </button>
              </div>
              
              {/* Contact Info Card */}
              <div className="md:col-span-2">
                <div className="bg-gradient-to-br from-red-800/50 via-red-900/40 to-red-950/50 p-8 rounded-2xl backdrop-blur-sm border border-red-700/40 shadow-2xl hover:shadow-red-500/10 transition-all duration-300 hover:border-orange-300/50">
                  <div className="flex items-center mb-6">
                    <Star className="text-yellow-300 mr-3" size={24} />
                    <div>
                      <p className="font-bold text-orange-300 text-lg">מייסדת ומנכ"לית העמותה</p>
                      <p className="text-white text-xl font-gveret-levin">ענת זגרון בוג'יו</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a 
                      href="mailto:Boggio3@gmail.com" 
                      className="flex flex-col items-center p-4 rounded-xl bg-red-800/40 hover:bg-red-700/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-700/70 group-hover:bg-red-600 transition-all duration-300 mb-3 group-hover:scale-110">
                        <Mail size={20} className="text-white" />
                      </div>
                      <span className="text-sm text-center font-medium group-hover:text-orange-300 transition-colors">
                        Boggio3@gmail.com
                      </span>
                    </a>
                    
                    <a 
                      href="tel:+972502470857" 
                      className="flex flex-col items-center p-4 rounded-xl bg-red-800/40 hover:bg-red-700/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-700/70 group-hover:bg-red-600 transition-all duration-300 mb-3 group-hover:scale-110">
                        <Phone size={20} className="text-white" />
                      </div>
                      <span className="text-sm text-center font-medium group-hover:text-orange-300 transition-colors">
                        050-247-0857
                      </span>
                    </a>
                    
                    <a 
                      href="https://chat.whatsapp.com/EdpRKYWJk6NCRXynXKS091" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 rounded-xl bg-green-800/40 hover:bg-green-700/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg"
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-700/70 group-hover:bg-green-600 transition-all duration-300 mb-3 group-hover:scale-110">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                          <path d="M17.5 12C17.5 14.98 15.04 17.44 12.06 17.44C10.58 17.44 9.24 16.78 8.35 15.73L5.31 16.59L6.16 13.63C5.22 12.78 4.62 11.5 4.62 10.06C4.62 7.08 7.08 4.62 10.06 4.62C13.04 4.62 15.5 7.08 15.5 10.06C15.5 10.97 15.28 11.83 14.89 12.6" />
                        </svg>
                      </div>
                      <span className="text-sm text-center font-medium group-hover:text-green-300 transition-colors">
                        WhatsApp
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Copyright Section */}
        <div className="border-t border-red-800/50 mt-20 pt-8">
          <div className="text-center">
              <p className="text-white/90 text-lg mb-4">
                © {new Date().getFullYear()} עמותת לגלות את האור – הנני. כל הזכויות שמורות. 
              </p>
            </div>
        </div>
      </div>
      
      <style>{`
        .ember {
          position: absolute;
          border-radius: 50%;
          animation: float-up linear infinite;
          box-shadow: 0 0 6px rgba(251, 146, 60, 0.8);
        }

        .star {
          position: absolute;
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
          animation: float-up-star linear infinite;
          box-shadow: 0 0 8px rgba(254, 240, 138, 0.8);
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) scale(0) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes float-up-star {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.9;
            transform: translateY(-50vh) scale(1.2) rotate(180deg);
          }
          100% {
            transform: translateY(-100vh) scale(0) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;