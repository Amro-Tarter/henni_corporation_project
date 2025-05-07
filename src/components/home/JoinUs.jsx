import React, { useEffect, useRef } from 'react';
import CTAButton from '../CTAButton';

const JoinUs = () => {
  const particlesRef = useRef(null);
  
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
    const particleCount = 30;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        color: [
          'rgba(255, 166, 0, 0.6)',
          'rgba(255, 111, 0, 0.5)',
          'rgba(255, 214, 0, 0.4)',
          'rgba(255, 151, 0, 0.5)',
        ][Math.floor(Math.random() * 4)],
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.5,
        life: Math.random() * 100 + 50
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
            radius: Math.random() * 3 + 1,
            color: [
              'rgba(255, 166, 0, 0.6)',
              'rgba(255, 111, 0, 0.5)',
              'rgba(255, 214, 0, 0.4)',
              'rgba(255, 151, 0, 0.5)',
            ][Math.floor(Math.random() * 4)],
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.5,
            life: Math.random() * 100 + 50
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

  return (
    <section
      id="join-us"
      className="relative py-24 md:py-32 bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 overflow-hidden"
      dir="rtl"
    >
      {/* Animated canvas background */}
      <canvas 
        ref={particlesRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Decorative elements */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-3xl opacity-30" />
      <div className="absolute -bottom-24 -left-16 w-48 h-48 bg-gradient-to-br from-red-300 to-orange-300 rounded-full blur-3xl opacity-20" />
      
      {/* Floating embers with different animations */}
      <div className="absolute top-10 left-1/4 w-2 h-2 rounded-full bg-orange-500 animate-ping opacity-70" />
      <div className="absolute top-36 left-2/3 w-3 h-3 rounded-full bg-yellow-400 animate-pulse opacity-80" />
      <div className="absolute top-32 right-1/5 w-2 h-2 rounded-full bg-red-400 animate-bounce opacity-75" />
      <div className="absolute bottom-24 right-1/4 w-4 h-4 rounded-full bg-orange-300 animate-pulse opacity-60" />
      <div className="absolute bottom-40 left-1/3 w-3 h-3 rounded-full bg-yellow-300 animate-ping opacity-70" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Heading with enhanced styling */}
          <div className="mb-10 relative">
            <h2 className="font-gveret-levin text-5xl md:text-6xl lg:text-7xl text-orange-800 drop-shadow-sm relative z-10">
              הצטרפו למסע
            </h2>
            <div className="absolute -bottom-3 right-1/2 transform translate-x-1/2 w-32 h-2 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
          </div>
          
          <p className="text-xl md:text-2xl mb-14 text-orange-900 leading-relaxed max-w-3xl mx-auto">
            אנחנו מזמינים אתכם לקחת חלק במסע קסום של גילוי עצמי והעצמה! 
            יחד ניצור עתיד זוהר של חיבורים אמיתיים והשפעה חיובית 
            <span className="text-orange-600 font-semibold"> שתאיר את העולם</span>.
          </p>

          {/* Enhanced info grid with interactive elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Why Join - with enhanced visual effects */}
            <div className="bg-gradient-to-br from-white/80 to-orange-50/90 backdrop-blur-md border border-orange-200 rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-8px] group">
              <div className="bg-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-orange-800 mb-6">למה להצטרף?</h3>
              <ul className="space-y-4 text-orange-700 text-lg text-right">
                <li className="flex items-center">
                  <span className="ml-3 text-orange-500 text-xl">✦</span>
                  <span className="group-hover:text-orange-700 transition-colors">פיתוח מיומנויות יצירה וביטוי עצמי מעמיק</span>
                </li>
                <li className="flex items-center">
                  <span className="ml-3 text-orange-500 text-xl">✦</span>
                  <span className="group-hover:text-orange-700 transition-colors">חיבור לקהילה יוצרת, תומכת ומעצימה</span>
                </li>
                <li className="flex items-center">
                  <span className="ml-3 text-orange-500 text-xl">✦</span>
                  <span className="group-hover:text-orange-700 transition-colors">השתתפות באירועים ותערוכות מיוחדות</span>
                </li>
                <li className="flex items-center">
                  <span className="ml-3 text-orange-500 text-xl">✦</span>
                  <span className="group-hover:text-orange-700 transition-colors">הזדמנויות להתפתחות אישית ומקצועית</span>
                </li>
              </ul>
            </div>

            {/* How to Join - with enhanced styling */}
            <div className="bg-gradient-to-br from-emerald-50/90 to-emerald-100/80 backdrop-blur-md border border-emerald-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] group">
              <div className="bg-emerald-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-emerald-800 mb-6">איך מצטרפים?</h3>
              <div className="space-y-6">
                <p className="text-emerald-700 text-lg">
                  מלאו את הטופס המקוון שלנו והתחילו את המסע המופלא של גילוי עצמי, 
                  התפתחות אישית וחיבור לקהילה מעצימה.
                </p>
                <div className="bg-white/50 p-4 rounded-lg mb-6 border border-emerald-100">
                  <p className="text-emerald-800 font-medium">״הצטרפתי לארגון לפני שנה וחיי השתנו. מצאתי את הקול היצירתי שלי וקהילה שתומכת בי״</p>
                  <p className="text-emerald-600 text-sm mt-2">— מיכל, חברת קהילה</p>
                </div>
                <CTAButton
                  href="https://forms.monday.com/forms/af28672efe2a47320cd729b1d01f6841?r=euc1"
                  variant="earth"
                  size="lg"
                  className="bg-emerald-600 text-white hover:bg-emerald-500 transition-colors w-full md:w-auto"
                >
                  <span>הצטרפו לארגון</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </CTAButton>
              </div>
            </div>
          </div>

          {/* Support Section with enhanced visuals */}
          <div className="bg-gradient-to-br from-orange-600 via-red-500 to-orange-600 text-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden relative">
            {/* Decorative circle overlays */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-yellow-400 rounded-full opacity-20"></div>
            
            <div className="relative z-10">
              <h3 className="text-4xl font-gveret-levin mb-8">תמכו במיזם והאירו עתיד</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-colors">
                  <div className="text-2xl mb-2">🌱</div>
                  <h4 className="text-xl font-semibold mb-2">יוצרים שינוי</h4>
                  <p className="text-orange-50 text-sm">
                    כל תרומה מסייעת להרחיב את מעגל ההשפעה שלנו ברחבי הארץ
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-colors">
                  <div className="text-2xl mb-2">✨</div>
                  <h4 className="text-xl font-semibold mb-2">מעצימים קהילה</h4>
                  <p className="text-orange-50 text-sm">
                    תמיכתכם מאפשרת לנו לפתח תכניות חדשות עבור בני נוער
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-colors">
                  <div className="text-2xl mb-2">🔥</div>
                  <h4 className="text-xl font-semibold mb-2">מדליקים אור</h4>
                  <p className="text-orange-50 text-sm">
                    יחד נוכל ליצור עתיד מואר יותר לדור הבא של היוצרים
                  </p>
                </div>
              </div>
              
              <p className="mb-8 text-lg text-orange-50 max-w-2xl mx-auto">
                עזרו לנו להרחיב את ההשפעה החיובית שלנו ולהגיע לעוד בני נוער ברחבי הארץ. 
                <span className="block font-medium mt-2">כל תרומה יוצרת שינוי אמיתי!</span>
              </p>
              
              <CTAButton
                href="https://mrng.to/pFaSV3RKqT"
                variant="inverse-air"
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 transition-colors px-10 py-4"
              >
                <span className="text-lg font-medium">תרמו עכשיו</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUs;