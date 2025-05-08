import React, { useState } from 'react';
import { MapPin, Users, Waves, Calendar, Heart, Star, ChevronRight, ChevronLeft, MessageCircle } from 'lucide-react';

const CommunitySection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeStory, setActiveStory] = useState(0);
  
  const testimonials = [
    { quote: "הבן שלי מצא בית אמיתי, מקום שמקשיב לו באמת.", author: "אורית, אמא מתל אביב", image: "./parent1.png" },
    { quote: "זו לא רק יצירה – זה חיבור עמוק לעצמי.", author: "נוי, בוגרת התכנית", image: "./parent2.png" },
    { quote: "המפגש עם הנוער כאן החזיר לי תקווה לדור הבא.", author: "דני, מנטור מקצועי", image: "./parent1.png" },
    { quote: "לראות את הילדים פורחים באמנות זה פשוט קסום.", author: "מיכל, מורה לאמנות", image: "./parent2.png" },
    { quote: "הקהילה הזו היא כמו משפחה שנייה עבורי.", author: "עידו, חניך בתכנית", image: "./parent1.png" }
  ];
  
  const successStories = [
    {
      name: "רוני לוי",
      age: 19,
      story: "הגעתי לתכנית לפני 3 שנים, היום אני מציגה בגלריות ומלמדת אמנות.",
      image: "./girl1.png"
    },
    {
      name: "אמיר כהן",
      age: 15,
      story: "התחלתי כנער ביישן, היום אני מוביל פרויקטים חברתיים בכל הארץ.",
      image: "./boy1.png"
    },
    {
      name: "שירה גולן",
      age: 18,
      story: "דרך האמנות מצאתי את הקול שלי והביטחון להשמיע אותו.",
      image: "./girl2.png"
    }
  ];
  
  const impactAreas = [
    { title: "חוסן נפשי", icon: <Heart className="text-cyan-600" size={24} />, count: "70%" },
    { title: "שיפור אקדמי", icon: <Star className="text-cyan-600" size={24} />, count: "85%" },
    { title: "מעורבות קהילתית", icon: <Users className="text-cyan-600" size={24} />, count: "90%" },
    { title: "אירועים שנתיים", icon: <Calendar className="text-cyan-600" size={24} />, count: "24+" }
  ];
  
  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  const nextStory = () => {
    setActiveStory((prev) => (prev + 1) % successStories.length);
  };
  
  const prevStory = () => {
    setActiveStory((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white via-sky-50 to-cyan-100 overflow-hidden" id="community" dir="rtl">
      <div className="container mx-auto px-6 max-w-6xl">

        {/* Wave Decorations */}
        <div className="absolute left-0 right-0 pointer-events-none opacity-20">
          <svg width="100%" height="120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0,80 C100,30 200,120 300,50 C400,10 500,90 600,40 C700,0 800,60 900,30 C1000,10 1100,50 1200,20 C1300,0 1400,30 1500,50 C1600,70 1700,30 1800,60 C1900,90 2000,70 2100,40 L2100,120 L0,120 Z" 
              fill="url(#wave-gradient)" />
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title with Animation */}
        <div className="text-center mb-16 relative">
          <div className="inline-block">
            <h2 className="text-4xl md:text-5xl font-bold text-sky-800 mb-4 relative">
              קהילה זורמת של יוצרים ומשפיעים 
            </h2>
          </div>
          <p className="text-lg text-sky-600 max-w-2xl mx-auto">
            יחד אנחנו יוצרים גלים של שינוי בכל הארץ – בני נוער, משפחות, מנטורים ויוזמות שמפיחים חיים בקהילה.
          </p>
        </div>

        {/* Map & Description with Enhanced Animation */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-24 relative">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-cyan-300/30 animate-pulse"></div>
            <img src="./map.png" alt="מפת הפעילות" className="rounded-2xl w-full object-cover relative z-10" />
            
            {/* Map Pins Animation */}
            <div className="absolute top-1/4 left-1/4 z-20">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <div className="absolute top-1/2 right-1/3 z-20">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            </div>
            <div className="absolute bottom-1/4 right-1/4 z-20">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
            </div>
          </div>
          
          <div className="text-right">
            <h3 className="text-2xl font-semibold text-sky-700 mb-4 flex items-center gap-2">
              <MapPin className="text-sky-600" /> פריסה ארצית
            </h3>
            <p className="text-sky-700 text-lg mb-6">
              הפעילות נפרשת מהצפון ועד הדרום – ומחברת בין קהילות שונות ליצירה אחת עוצמתית.
            </p>
            
            {/* Added Statistics */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/70 rounded-lg p-4 text-center border-t-2 border-sky-400">
                <p className="text-3xl font-bold text-sky-700">25+</p>
                <p className="text-sky-600">יישובים</p>
              </div>
              <div className="bg-white/70 rounded-lg p-4 text-center border-t-2 border-sky-400">
                <p className="text-3xl font-bold text-sky-700">1000+</p>
                <p className="text-sky-600">משתתפים</p>
              </div>
              <div className="bg-white/70 rounded-lg p-4 text-center border-t-2 border-sky-400">
                <p className="text-3xl font-bold text-sky-700">40+</p>
                <p className="text-sky-600">מנטורים</p>
              </div>
              <div className="bg-white/70 rounded-lg p-4 text-center border-t-2 border-sky-400">
                <p className="text-3xl font-bold text-sky-700">12</p>
                <p className="text-sky-600">שנות פעילות</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stories Section with Carousel */}
        <div className="mb-24 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-cyan-800 mb-6">סיפורי הצלחה אישיים</h3>
          <p className="text-cyan-700 max-w-2xl mx-auto mb-8">בוגרי התכנית משתפים כיצד היא שינתה את חייהם – והובילה אותם לפרוץ דרך.</p>
          
          {/* Success Stories Carousel */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl shadow-lg">
              <div className="flex transition-transform duration-500" style={{ transform: `translateX(${activeStory * 100}%)` }}>
                {successStories.map((story, index) => (
                  <div key={index} className="w-full flex-shrink-0 bg-white">
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                      <div className="p-6 text-right">
                        <h4 className="text-2xl font-bold text-sky-700 mb-2">{story.name}, גיל {story.age}</h4>
                        <p className="text-sky-600 mb-4">{story.story}</p>
                      </div>
                      <div className="h-full flex items-center justify-center p-6">
                    <img
                        src={story.image}
                        alt={story.name}
                        className="w-56 h-56 object-cover rounded-2xl shadow-xl"
                    />
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <button 
              onClick={prevStory}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white/80 hover:bg-white shadow-md p-2 rounded-full z-10"
            >
              <ChevronLeft className="text-sky-700" />
            </button>
            <button 
              onClick={nextStory}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white/80 hover:bg-white shadow-md p-2 rounded-full z-10"
            >
              <ChevronRight className="text-sky-700" />
            </button>
            
            {/* Indicators */}
            <div className="flex justify-center mt-4 gap-2">
              {successStories.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveStory(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${activeStory === index ? 'bg-cyan-600' : 'bg-cyan-200'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Waves of Impact - Enhanced */}
        <div className="bg-white/60 backdrop-blur-sm border border-cyan-100 rounded-3xl shadow-lg p-8 text-center mb-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="wave-pattern" width="100" height="20" patternUnits="userSpaceOnUse">
                <path d="M0,10 C30,20 70,0 100,10 L100,0 L0,0 Z" fill="#0891b2" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#wave-pattern)" />
            </svg>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-semibold text-cyan-900 mb-6 flex items-center justify-center gap-2 relative z-10">
                 גלים של השפעה
          </h3>
          
          <p className="text-cyan-700 mb-8 max-w-3xl mx-auto relative z-10">
            כפר האמנים הצעירים – בית אמנות, יזמות והשפעה לחניכים ובוגרים. מקום של צמיחה ונתינה הדדית.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {impactAreas.map((area, index) => (
              <div key={index} className="bg-white/80 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-2">
                  {area.icon}
                </div>
                <p className="text-2xl font-bold text-cyan-700">{area.count}</p>
                <p className="text-cyan-600 text-sm">{area.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mentors and Family - Enhanced */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div className="bg-gradient-to-br from-sky-100 to-sky-50 rounded-2xl p-8 shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200 rounded-full -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-sky-200 rounded-full">
                  <Users className="text-sky-700" size={24} />
                </div>
                <h4 className="text-xl font-semibold text-sky-800">מנטורים מקצועיים</h4>
              </div>
              <p className="text-sky-700 mb-4">צוות מיומן מלווה את בני הנוער יד ביד – במסע של יצירה, חוסן והתפתחות.</p>
              <ul className="space-y-2 text-sky-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                  <span>ליווי אישי מותאם לכל משתתף</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                  <span>מומחים מעולם האמנות והיצירה</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                  <span>פיתוח מיומנויות רגשיות וחברתיות</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-sky-100 to-sky-50 rounded-2xl p-8 shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200 rounded-full -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-sky-200 rounded-full">
                  <Heart className="text-sky-700" size={24} />
                </div>
                <h4 className="text-xl font-semibold text-sky-800">תמיכה במשפחות</h4>
              </div>
              <p className="text-sky-700 mb-4">הורים הם חלק בלתי נפרד מהתהליך – הדרכה, ליווי וחיבורים אישיים לאורך כל הדרך.</p>
              <ul className="space-y-2 text-sky-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                  <span>סדנאות והרצאות להורים</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                  <span>קבוצות תמיכה וליווי משפחתי</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                  <span>אירועים משותפים למשפחות</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testimonials - Enhanced Carousel */}
        <div className="text-center mb-20">
          <h3 className="text-3xl md:text-4xl font-bold text-cyan-800 mb-6">קולות מהקהילה</h3>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden py-12">
              <div 
                className="flex transition-transform duration-500 ease-in-out" 
                style={{ transform: `translateX(${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((t, i) => (
                  <div key={i} className="w-full flex-shrink-0">
                    <div className="bg-white rounded-xl p-8 shadow-lg border-t-4 border-cyan-300 max-w-2xl mx-auto relative">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
                        <MessageCircle className="text-cyan-500" size={24} />
                      </div>
                      <div className="flex justify-center mb-6">
                        <img src={t.image} alt={t.author} className="w-16 h-16 rounded-full border-4 border-white shadow-md" />
                      </div>
                      <p className="text-cyan-800 text-xl mb-4 italic">"{t.quote}"</p>
                      <p className="text-cyan-600">{t.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <button 
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md p-2 rounded-full z-10"
            >
              <ChevronLeft className="text-cyan-700" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md p-2 rounded-full z-10"
            >
              <ChevronRight className="text-cyan-700" />
            </button>
            
            {/* Indicators */}
            <div className="flex justify-center mt-4 gap-2">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${activeTestimonial === index ? 'bg-cyan-600' : 'bg-cyan-200'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CommunitySection;