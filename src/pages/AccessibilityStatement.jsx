import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';

const AccessibilityStatement = () => {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <main className="bg-gradient-to-b from-amber-50 to-white min-h-screen">
      <Navigation />

      <div className="relative py-16 px-4 pt-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-orange-100 opacity-50 -translate-x-1/2 -translate-y-1/2 blur-xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-red-100 opacity-50 translate-x-1/2 translate-y-1/2 blur-xl" />
        
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <h1 className="font-gveret-levin text-5xl md:text-6xl text-[#D73502] text-center mb-2">
                הצהרת נגישות
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-amber-300 to-[#D73502] mx-auto rounded-full" />
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="prose prose-lg max-w-none bg-white rounded-2xl p-8 shadow-lg border border-amber-100"
            >
              <p className="text-[#801100] font-medium text-lg leading-relaxed">
                עמותת "לגלות את האור – הנני" מחויבת לספק שירות נגיש לכלל הציבור, לרבות אנשים עם מוגבלויות.
              </p>

              <div className="my-8 border-r-4 border-[#D73502] pr-6">
                <h2 className="font-gveret-levin text-3xl text-[#D73502]">הנגשת האתר</h2>
                <p className="text-[#801100]">
                  האתר עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013.
                  התאמות הנגישות בוצעו לפי המלצות התקן הישראלי (ת"י 5568) לנגישות תכנים באינטרנט ברמת AA
                  ומסמך WCAG2.1 הבינלאומי.
                </p>
              </div>

              <div className="my-8 border-r-4 border-[#D73502] pr-6">
                <h2 className="font-gveret-levin text-3xl text-[#D73502]">דרכי נגישות</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-[#801100]">
                  {[
                    'ניווט באמצעות מקלדת',
                    'תמיכה בתוכנת קורא מסך',
                    'מבנה אתר ברור ועקבי',
                    'תמונות עם טקסט חלופי',
                    'ניגודיות צבעים מותאמת',
                    'גודל טקסט ניתן לשינוי'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-3 h-3 bg-amber-400 rounded-full mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="my-8 border-r-4 border-[#D73502] pr-6">
                <h2 className="font-gveret-levin text-3xl text-[#D73502]">דרכי פנייה בנושא נגישות</h2>
                <p className="text-[#801100]">
                  במידה ונתקלת בבעיית נגישות כלשהי באתר, אנא פנה אלינו באמצעות:
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D73502] ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[#801100]">info@giluy-haor.org</span>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D73502] ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-[#801100]">03-1234567</span>
                  </div>
                </div>
              </div>

              <p className="text-[#801100] mt-8 text-center font-medium bg-amber-50 p-4 rounded-lg border border-amber-100">
                נשמח לקבל את פנייתך ולטפל בה בהקדם האפשרי.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default AccessibilityStatement;