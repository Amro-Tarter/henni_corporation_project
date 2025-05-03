import React from 'react';
import { Flame, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
      <footer className="bg-red-900 text-white pt-16 pb-8 relative overflow-hidden">
        {/* Animated background elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-theme-heading-accent to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-2 h-2 ember bg-theme-bg-secondary" />
      <div 
        className="absolute bottom-0 left-2/4 w-3 h-3 ember bg-theme-bg-secondary" 
        style={{ animationDelay: '1.2s' }} 
      />
      <div 
        className="absolute bottom-0 left-3/4 w-2 h-2 ember bg-theme-bg-secondary" 
        style={{ animationDelay: '0.7s' }} 
      />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-6">
              <Flame className="mr-3 text-theme-heading-accent" size={24} />
              <h3 className="font-gveret-levin text-2xl">לגלות את האור – הנני</h3>
            </div>
            <p className="text-white/80 mb-4 leading-relaxed">
              מיזם העצמה לנוער באמצעות יצירה, התפתחות רגשית ומנהיגות אמנותית בקהילה
            </p>
            <p className="text-white/80">מייסדת: ענת זיגרון</p>
          </div>

          {/* Links Column */}
          <div className="md:col-span-1">
            <h3 className="font-gveret-levin text-xl mb-6">קישורים</h3>
            <ul className="space-y-3 text-white/80">
              <li>
                <a href="#what-we-do" className="hover:text-theme-bg-secondary transition-colors duration-200">
                  מיזמים חינוכיים
                </a>
              </li>
              <li>
                <a href="#our-vision" className="hover:text-theme-bg-secondary transition-colors duration-200">
                  החזון שלנו
                </a>
              </li>
              <li>
                <a href="#join-us" className="hover:text-theme-bg-secondary transition-colors duration-200">
                  הצטרפו אלינו
                </a>
              </li>
              <li>
                <a 
                  href="https://mrng.to/pFaSV3RKqT" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-theme-bg-secondary transition-colors duration-200"
                >
                  תרמו
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal Links Column */}
          <div className="md:col-span-1">
            <h3 className="font-gveret-levin text-xl mb-6">קישורים מהירים</h3>
            <ul className="space-y-3 text-white/80">
              <li>
                <Link to="/accessibility" className="hover:text-theme-bg-secondary transition-colors duration-200">
                  הצהרת נגישות
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-theme-bg-secondary transition-colors duration-200">
                  הצהרת פרטיות
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-theme-bg-secondary transition-colors duration-200">
                  תנאי שימוש
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Column */}
          <div className="md:col-span-1">
            <h3 className="font-gveret-levin text-xl mb-6">צרו קשר</h3>
            <div className="space-y-4">
              <div className="bg-theme-bg-secondary/10 p-6 rounded-lg backdrop-blur-sm">
                <p className="font-bold text-theme-heading-accent mb-3">מייסדת ומנכ"לית העמותה</p>
                <p className="text-white/90 mb-4">ענת זגרון בוג'יו</p>
                <div className="space-y-3">
                  <a 
                    href="mailto:Boggio3@gmail.com" 
                    className="flex items-center gap-3 hover:text-theme-heading-accent transition-colors duration-200"
                  >
                    <Mail size={20} />
                    <span>Boggio3@gmail.com</span>
                  </a>
                  <a 
                    href="tel:+972502470857" 
                    className="flex items-center gap-3 hover:text-theme-heading-accent transition-colors duration-200"
                  >
                    <Phone size={20} />
                    <span>050-247-0857</span>
                  </a>
                  <a 
                    href="https://chat.whatsapp.com/EdpRKYWJk6NCRXynXKS091" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-green-500 hover:text-green-400 transition-colors duration-200"
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        fillRule="evenodd" 
                        clipRule="evenodd" 
                        d="M20.5823 3.38C19.0873 1.86 16.9123 0.75 14.6473 0.75H9.3523C7.0873 0.75 4.9123 1.86 3.4173 3.38C1.9123 4.88 0.7923 7.06 0.7923 9.34V14.66C0.7923 16.94 1.9023 19.12 3.4173 20.62C4.9123 22.14 7.0873 23.25 9.3523 23.25H14.6473C16.9123 23.25 19.0873 22.14 20.5823 20.62C22.0973 19.12 23.2073 16.94 23.2073 14.66V9.34C23.2073 7.06 22.0973 4.88 20.5823 3.38Z" 
                        fill="currentColor" 
                        fillOpacity="0.5"
                      />
                      <path 
                        fillRule="evenodd" 
                        clipRule="evenodd" 
                        d="M17.5 12C17.5 14.98 15.04 17.44 12.06 17.44C10.58 17.44 9.24 16.78 8.35 15.73L5.31 16.59L6.16 13.63C5.22 12.78 4.62 11.5 4.62 10.06C4.62 7.08 7.08 4.62 10.06 4.62C13.04 4.62 15.5 7.08 15.5 10.06C15.5 10.97 15.28 11.83 14.89 12.6" 
                        fill="currentColor"
                      />
                    </svg>
                    <span>הצטרפו לקבוצת הווצאפ</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-theme-text-secondary/20 mt-16 pt-8 text-center text-white/80 text-sm">
          <p>© {new Date().getFullYear()} לגלות את האור – הנני. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
