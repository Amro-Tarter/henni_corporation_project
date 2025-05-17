import React, { useState, useEffect } from 'react';
import { Flame, Mail, Phone, MessageSquare, ExternalLink, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // State for animated particles
  const [particles, setParticles] = useState([]);
  
  // Generate random particles on mount
  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 6
    }));
    setParticles(newParticles);
  }, []);

  return (
    <footer className="bg-red-900 text-white pt-16 pb-8 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-red-950 opacity-90" />
      
      {/* Animated embers/particles */}
      {particles.map(particle => (
        <div 
          key={particle.id}
          className="absolute bottom-0 ember bg-orange-300"
          style={{
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
      
      {/* Decorative flame icon */}
      <div className="absolute top-8 right-8 opacity-5">
        <Flame size={240} />
      </div>
      
      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-300/0 via-orange-300 to-orange-300/0" />

      <div className="container mx-auto px-6 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-6">
              <Flame className="mr-3 text-orange-300" size={28} />
              <h3 className="font-gveret-levin text-2xl">לגלות את האור – הנני</h3>
            </div>
            <p className="text-white/80 mb-4 leading-relaxed">
              מיזם העצמה לנוער באמצעות יצירה, התפתחות רגשית ומנהיגות אמנותית בקהילה
            </p>
            <div className="flex items-center text-white/90">
              <Heart size={16} className="text-red-300 mr-2" />
              <p>מייסדת: ענת זיגרון</p>
            </div>
          </div>

          {/* Links Column */}
          <div className="md:col-span-1">
            <h3 className="font-gveret-levin text-xl mb-6">
              <span className="relative">
                קישורים
                <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent"></span>
              </span>
            </h3>
            <ul className="space-y-3 text-white/80">
              <li>
                <a href="#what-we-do" className="text-orange-300 hover:text-orange-200 transition-colors duration-200 flex items-center font-bold">
                  <span className="inline-block w-1 h-1 rounded-full bg-orange-300 mr-2"></span>
                  מיזמים חינוכיים
                </a>
              </li>
              <li>
                <a href="#our-vision" className="text-orange-300 hover:text-orange-200 transition-colors duration-200 flex items-center font-bold">
                  <span className="inline-block w-1 h-1 rounded-full bg-orange-300 mr-2"></span>
                  החזון שלנו
                </a>
              </li>
              <li>
                <a href="#join-us" className="text-orange-300 hover:text-orange-200 transition-colors duration-200 flex items-center font-bold">
                  <span className="inline-block w-1 h-1 rounded-full bg-orange-300 mr-2"></span>
                  הצטרפו אלינו
                </a>
              </li>
              <li>
                <a 
                  href="https://mrng.to/pFaSV3RKqT" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-orange-300 hover:text-orange-200 transition-colors duration-200 flex items-center font-bold"
                >
                  <span className="inline-block w-1 h-1 rounded-full bg-orange-300 mr-2"></span>
                  תרמו
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal Links Column */}
          <div className="md:col-span-1">
            <h3 className="font-gveret-levin text-xl mb-6">
              <span className="relative">
                קישורים מהירים
                <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent"></span>
              </span>
            </h3>
            <ul className="space-y-3 text-white/80">
              <li>
                <Link to="/accessibility" className="text-orange-300 hover:text-orange-200 transition-colors duration-200 flex items-center font-bold">
                  <span className="inline-block w-1 h-1 rounded-full bg-orange-300 mr-2"></span>
                  הצהרת נגישות
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-orange-300 hover:text-orange-200 transition-colors duration-200 flex items-center font-bold">
                  <span className="inline-block w-1 h-1 rounded-full bg-orange-300 mr-2"></span>
                  הצהרת פרטיות
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-orange-300 hover:text-orange-200 transition-colors duration-200 flex items-center font-bold">
                  <span className="inline-block w-1 h-1 rounded-full bg-orange-300 mr-2"></span>
                  תנאי שימוש
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-orange-300 hover:text-orange-200 transition-colors duration-200 flex items-center font-bold">
                  <span className="inline-block w-1 h-1 rounded-full bg-orange-300 mr-2"></span>
                  צור קשר
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Column */}
          <div className="md:col-span-1">
            <h3 className="font-gveret-levin text-xl mb-6">
              <span className="relative">
                צרו קשר
                <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent"></span>
              </span>
            </h3>
            <div className="space-y-4">
              {/* Contact Us CTA Button moved here under the צרו קשר heading */}
              <Link 
                to="/contact" 
                className="group relative inline-flex items-center justify-center px-6 py-3 mb-4 overflow-hidden font-bold text-white rounded-lg bg-gradient-to-br from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl w-full"
              >
                <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                <span className="relative">צרו קשר עכשיו</span>
              </Link>
              
              <div className="bg-gradient-to-br from-red-800/50 to-red-950/50 p-6 rounded-lg backdrop-blur-sm border border-red-700/30 shadow-lg">
                <p className="font-bold text-orange-300 mb-3">מייסדת ומנכ"לית העמותה</p>
                <p className="text-white/90 mb-4">ענת זגרון בוג'יו</p>
                <div className="space-y-3">
                  <a 
                    href="mailto:Boggio3@gmail.com" 
                    className="flex items-center gap-3 hover:text-orange-300 transition-colors duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-800/70 group-hover:bg-red-700 transition-colors">
                      <Mail size={16} />
                    </div>
                    <span>Boggio3@gmail.com</span>
                  </a>
                  <a 
                    href="tel:+972502470857" 
                    className="flex items-center gap-3 hover:text-orange-300 transition-colors duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-800/70 group-hover:bg-red-700 transition-colors">
                      <Phone size={16} />
                    </div>
                    <span>050-247-0857</span>
                  </a>
                  <a 
                    href="https://chat.whatsapp.com/EdpRKYWJk6NCRXynXKS091" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-green-500 hover:text-green-400 transition-colors duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-700/30 group-hover:bg-green-700/50 transition-colors">
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M17.5 12C17.5 14.98 15.04 17.44 12.06 17.44C10.58 17.44 9.24 16.78 8.35 15.73L5.31 16.59L6.16 13.63C5.22 12.78 4.62 11.5 4.62 10.06C4.62 7.08 7.08 4.62 10.06 4.62C13.04 4.62 15.5 7.08 15.5 10.06C15.5 10.97 15.28 11.83 14.89 12.6"
                        />
                      </svg>
                    </div>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-red-800/50 mt-16 pt-8 text-center text-white/80 text-sm">
          <p>© {new Date().getFullYear()} לגלות את האור – הנני. כל הזכויות שמורות.</p>
          <p className="mt-2 text-white/60 text-xs">
            מאמינים בעוצמה שבכל אחד ואחת מאיתנו 
            <Flame className="inline mx-1" size={12} />
            מדליקים את האור בעולם יחד
          </p>
        </div>
      </div>
      
      <style>{`
        .ember {
          position: absolute;
          border-radius: 50%;
          animation: float-up linear infinite;
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;