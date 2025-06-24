import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, TrendingUp, Eye } from 'lucide-react';
import CTAButton from '../CTAButton';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';

// Animated Counter Component
const AnimatedCounter = ({ endValue, isVisible, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = timestamp => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * endValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, endValue, duration]);

  return <span>{count.toLocaleString()}+</span>;
};

const JoinUs = () => {
  const particlesRef = useRef(null);
  const statsRef = useRef(null);
  const [isStatsInView, setIsStatsInView] = useState(false);

  // Stats data from Firestore
  const [statsData, setStatsData] = useState({ 
    visits: 0, 
    uniqueVisits: 0,
    users: 0, 
    projects: 0 
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Combined stats config
  const combinedStatsConfig = [
    {
      value: statsData.users,
      label: 'משתמשים נרשמים',
      icon: <Users className="h-6 w-6 text-blue-500" />,
      color: 'blue',
    },
    {
      value: statsData.projects,
      label: 'פרויקטים שבוצעו',
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      color: 'green',
    },
    {
      value: statsData.visits,
      label: 'צפיות כוללות',
      icon: <Eye className="h-6 w-6 text-purple-500" />,
      color: 'purple',
    },
  ];

  // Record unique visitor and increment visit counts
  useEffect(() => {
    const UNIQUE_VISITOR_KEY = 'site_unique_visit';
    const VISIT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    const recordUniqueVisit = async () => {
      const lastVisit = localStorage.getItem(UNIQUE_VISITOR_KEY);
      const currentTime = new Date().getTime();

      // If no last visit recorded or last visit was more than 24 hours ago
      if (!lastVisit || (currentTime - parseInt(lastVisit, 10)) > VISIT_EXPIRATION_MS) {
        localStorage.setItem(UNIQUE_VISITOR_KEY, currentTime.toString());

        const statsRefDoc = doc(db, 'siteStats', 'counters');
        try {
          // Atomically increment uniqueVisits
          await updateDoc(statsRefDoc, { uniqueVisits: increment(1) });
        } catch (error) {
          // If document doesn't exist, create it with uniqueVisits: 1
          const snap = await getDoc(statsRefDoc);
          if (!snap.exists()) {
            await setDoc(statsRefDoc, { uniqueVisits: 1, visits: 0, users: 0, projects: 0 });
          } else {
            console.error("Error incrementing unique visits, but document exists:", error);
          }
        }
      }

      // Always increment total visits
      const statsRefDoc = doc(db, 'siteStats', 'counters');
      try {
        await updateDoc(statsRefDoc, { visits: increment(1) });
      } catch (error) {
        const snap = await getDoc(statsRefDoc);
        if (!snap.exists()) {
          await setDoc(statsRefDoc, { visits: 1, uniqueVisits: 0, users: 0, projects: 0 });
        } else {
          console.error("Error incrementing total visits, but document exists:", error);
        }
      }
    };

    recordUniqueVisit();
  }, []); // Run once on mount

  // Fetch stats data from Firestore
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        
        // Get visit stats
        const statsDocRef = doc(db, 'siteStats', 'counters');
        const statsSnap = await getDoc(statsDocRef);
        
        const visits = statsSnap.exists() ? statsSnap.data().visits || 0 : 0;
        const uniqueVisits = statsSnap.exists() ? statsSnap.data().uniqueVisits || 0 : 0;

        // Get project counts
        const elemSnap = await getDocs(collection(db, 'elemental_projects'));
        const persSnap = await getDocs(collection(db, 'personal_projects'));
        const projects = elemSnap.size + persSnap.size;

        // Get user count
        const usersSnap = await getDocs(collection(db, 'users'));
        const users = usersSnap.size;

        setStatsData({ visits, uniqueVisits, users, projects });
      } catch (error) {
        console.error('Error loading stats:', error);
        // Set default values if fetch fails
        setStatsData({ visits: 0, uniqueVisits: 0, users: 0, projects: 0 });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);
  // Animate counters on view using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsInView(true);
        }
      },
      { threshold: 0.3 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  // Create animated particles effect on component mount
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const canvas = particlesRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle configuration
    const particles = [];
    const particleCount = 20;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        color: [
          'rgba(255, 166, 0, 0.5)',
          'rgba(255, 111, 0, 0.4)',
          'rgba(255, 214, 0, 0.3)',
          'rgba(255, 151, 0, 0.4)',
        ][Math.floor(Math.random() * 4)],
        speedX: Math.random() * 0.3 - 0.15,
        speedY: Math.random() * 0.3 - 0.3,
        life: Math.random() * 80 + 40
      });
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Update particle position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;
        
        // Regenerate particle if it's out of bounds or lifetime ended
        if (
          particle.x < 0 ||
          particle.x > canvas.width ||
          particle.y < 0 ||
          particle.y > canvas.height ||
          particle.life <= 0
        ) {
          particles[index] = {
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            radius: Math.random() * 2 + 0.5,
            color: [
              'rgba(255, 166, 0, 0.5)',
              'rgba(255, 111, 0, 0.4)',
              'rgba(255, 214, 0, 0.3)',
              'rgba(255, 151, 0, 0.4)',
            ][Math.floor(Math.random() * 4)],
            speedX: Math.random() * 0.3 - 0.15,
            speedY: Math.random() * 0.3 - 0.3,
            life: Math.random() * 80 + 40
          };
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Get color classes for stats
  const getColorClasses = color => {
    const colorMap = {
      pink: {
        bg: 'from-pink-100 to-pink-50',
        text: 'text-pink-800',
        icon: 'text-pink-600',
        border: 'border-pink-200',
      },
      orange: {
        bg: 'from-orange-100 to-orange-50',
        text: 'text-orange-800',
        icon: 'text-orange-600',
        border: 'border-orange-200',
      },
      green: {
        bg: 'from-green-100 to-green-50',
        text: 'text-green-800',
        icon: 'text-green-600',
        border: 'border-green-200',
      },
      blue: {
        bg: 'from-blue-100 to-blue-50',
        text: 'text-blue-800',
        icon: 'text-blue-600',
        border: 'border-blue-200',
      },
      purple: {
        bg: 'from-purple-100 to-purple-50',
        text: 'text-purple-800',
        icon: 'text-purple-600',
        border: 'border-purple-200',
      },
    };
    return colorMap[color] || colorMap.orange;
  };

  return (
    <section
      id="join-us"
      className="relative py-16 md:py-20 bg-gradient-to-tr from-rose-100 to-orange-100 overflow-hidden"
      dir="rtl"
    >
      {/* Animated canvas background */}
      <canvas 
        ref={particlesRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Decorative elements */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-2xl opacity-25" />
      <div className="absolute -bottom-16 -left-12 w-32 h-32 bg-gradient-to-br from-red-300 to-orange-300 rounded-full blur-2xl opacity-15" />
      
      {/* Floating embers */}
      <div className="absolute top-8 left-1/4 w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping opacity-60" />
      <div className="absolute top-24 left-2/3 w-2 h-2 rounded-full bg-yellow-400 animate-pulse opacity-70" />
      <div className="absolute top-20 right-1/5 w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce opacity-65" />
      <div className="absolute bottom-16 right-1/4 w-2.5 h-2.5 rounded-full bg-orange-300 animate-pulse opacity-50" />
      <div className="absolute bottom-28 left-1/3 w-2 h-2 rounded-full bg-yellow-300 animate-ping opacity-60" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-8 relative">
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-orange-800 drop-shadow-sm relative z-10 font-bold">
              הצטרפו למסע
            </h2>
            <div className="absolute -bottom-2 right-1/2 transform translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
          </div>
          
          <p className="text-lg md:text-xl mb-10 text-orange-900 leading-relaxed max-w-2xl mx-auto">
            אנחנו מזמינים אתכם לקחת חלק במסע קסום של גילוי עצמי והעצמה! 
            יחד ניצור עתיד זוהר של חיבורים אמיתיים והשפעה חיובית 
            <span className="text-orange-600 font-semibold"> שתאיר את העולם</span>.
          </p>

          {/* Enhanced info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Why Join */}
            <div className="bg-gradient-to-br from-white/80 to-orange-50/90 backdrop-blur-md border border-orange-200 rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] group">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-orange-800 mb-4">למה להצטרף?</h3>
              <ul className="space-y-3 text-orange-700 text-base text-right">
                <li className="flex items-center">
                  <span className="ml-2 text-orange-500 text-lg">✦</span>
                  <span className="group-hover:text-orange-700 transition-colors">פיתוח מיומנויות יצירה וביטוי עצמי מעמיק</span>
                </li>
                <li className="flex items-center">
                  <span className="ml-2 text-orange-500 text-lg">✦</span>
                  <span className="group-hover:text-orange-700 transition-colors">חיבור לקהילה יוצרת, תומכת ומעצימה</span>
                </li>
                <li className="flex items-center">
                  <span className="ml-2 text-orange-500 text-lg">✦</span>
                  <span className="group-hover:text-orange-700 transition-colors">השתתפות באירועים ותערוכות מיוחדות</span>
                </li>
                <li className="flex items-center">
                  <span className="ml-2 text-orange-500 text-lg">✦</span>
                  <span className="group-hover:text-orange-700 transition-colors">הזדמנויות להתפתחות אישית ומקצועית</span>
                </li>
              </ul>
            </div>

            {/* How to Join */}
            <div className="bg-gradient-to-br from-emerald-50/90 to-emerald-100/80 backdrop-blur-md border border-emerald-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] group">
              <div className="bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-emerald-800 mb-4">איך מצטרפים?</h3>
              <div className="space-y-4">
                <p className="text-emerald-700 text-base">
                  מלאו את הטופס המקוון שלנו והתחילו את המסע המופלא של גילוי עצמי, 
                  התפתחות אישית וחיבור לקהילה מעצימה.
                </p>
                <div className="bg-white/50 p-3 rounded-lg mb-4 border border-emerald-100">
                  <p className="text-emerald-800 font-medium text-sm">״הצטרפתי לארגון לפני שנה וחיי השתנו. מצאתי את הקול היצירתי שלי וקהילה שתומכת בי״</p>
                  <p className="text-emerald-600 text-xs mt-1">— מיכל, חברת קהילה</p>
                </div>
                <CTAButton
                  href="https://forms.monday.com/forms/af28672efe2a47320cd729b1d01f6841?r=euc1"
                  variant="earth"
                  size="md"
                  className="bg-emerald-600 text-white hover:bg-emerald-500 transition-colors w-full md:w-auto text-sm"
                >
                  <span>הצטרפו לעמותה</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </CTAButton>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-gradient-to-br from-orange-600 via-red-500 to-orange-600 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] overflow-hidden relative mb-12">
            {/* Decorative circle overlays */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-orange-400 rounded-full opacity-15"></div>
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-yellow-400 rounded-full opacity-15"></div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-6">תמכו במיזם והאירו עתיד</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
                  <div className="text-xl mb-2">🌱</div>
                  <h4 className="text-lg font-semibold mb-2">יוצרים שינוי</h4>
                  <p className="text-orange-50 text-sm">
                    כל תרומה מסייעת להרחיב את מעגל ההשפעה שלנו ברחבי הארץ
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
                  <div className="text-xl mb-2">✨</div>
                  <h4 className="text-lg font-semibold mb-2">מעצימים קהילה</h4>
                  <p className="text-orange-50 text-sm">
                    תמיכתכם מאפשרת לנו לפתח תכניות חדשות עבור בני נוער
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
                  <div className="text-xl mb-2">🔥</div>
                  <h4 className="text-lg font-semibold mb-2">מדליקים אור</h4>
                  <p className="text-orange-50 text-sm">
                    יחד נוכל ליצור עתיד מואר יותר לדור הבא של היוצרים
                  </p>
                </div>
              </div>
              
              <p className="mb-6 text-base text-orange-50 max-w-xl mx-auto">
                עזרו לנו להרחיב את ההשפעה החיובית שלנו ולהגיע לעוד בני נוער ברחבי הארץ. 
                <span className="block font-medium mt-2">כל תרומה יוצרת שינוי אמיתי!</span>
              </p>
              
              <CTAButton
                href="https://mrng.to/pFaSV3RKqT"
                variant="inverse-air"
                size="md"
                className="bg-white text-orange-600 hover:bg-orange-50 transition-colors px-8 py-3"
              >
                <span className="text-base font-medium">תרמו עכשיו</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </CTAButton>
            </div>
          </div>

          {/* Animated Statistics */}
          <div ref={statsRef} className="mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-orange-800 mb-8 text-center">
              ההשפעה שלנו – במספרים
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoadingStats ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="relative">
                    <div className="bg-white/90 rounded-xl shadow-lg border border-gray-200 p-6 text-center mt-8">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 shadow-sm animate-pulse">
                        </div>
                      </div>
                      <div className="text-4xl md:text-5xl font-bold text-gray-300 mt-2 mb-2 animate-pulse">
                        ---
                      </div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : (
                combinedStatsConfig.map((stat, index) => {
                  const colors = getColorClasses(stat.color);
                  return (
                    <div key={index} className="relative">
                      <div className={`bg-white/90 rounded-xl shadow-lg border ${colors.border} p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1 backdrop-blur-sm mt-8`}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/80 ${colors.icon} shadow-sm border ${colors.border}`}>
                            {stat.icon}
                          </div>
                        </div>
                        <div className={`text-4xl md:text-5xl font-bold ${colors.text} mt-2 mb-2`}>
                          <AnimatedCounter
                            endValue={stat.value}
                            isVisible={isStatsInView}
                            duration={2000 + index * 500}
                          />
                        </div>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUs;