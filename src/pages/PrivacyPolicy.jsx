import React from 'react';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Privacy policy sections data
  const sections = [
    {
      title: "איסוף מידע",
      content: "אנו אוספים מידע אישי כגון שם, כתובת דואר אלקטרוני ומספר טלפון כאשר אתם נרשמים לאתר או יוצרים קשר איתנו.",
      list: [
        "מידע אישי שתספקו בעת ההרשמה",
        "מידע על פעילותכם באתר",
        "מידע טכני על המכשיר והדפדפן שלכם"
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "שימוש במידע",
      content: "המידע שנאסף משמש אותנו למטרות הבאות:",
      list: [
        "שיפור השירותים שלנו",
        "שליחת עדכונים ומידע רלוונטי",
        "מענה לפניות ותמיכה",
        "אבטחת האתר והמשתמשים"
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      )
    },
    {
      title: "אבטחת מידע",
      content: "אנו נוקטים באמצעי אבטחה מתקדמים כדי להגן על המידע האישי שלכם. המידע מאוחסן באופן מאובטח ומוצפן, ומוגבל רק לאנשים הזקוקים לו לצורך ביצוע תפקידם.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: "זכויותיכם",
      content: "יש לכם את הזכות:",
      list: [
        "לבקש גישה למידע האישי שלכם",
        "לתקן מידע לא מדויק",
        "למחוק את המידע שלכם",
        "להתנגד לעיבוד המידע שלכם"
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
      )
    },
    {
      title: "עדכוני מדיניות",
      content: "אנו עשויים לעדכן את מדיניות הפרטיות מעת לעת. כל שינוי משמעותי יפורסם באתר, ואנו ממליצים לבדוק את המדיניות באופן קבוע.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <Layout>
      <main className="flex-grow pt-24 bg-gradient-to-b from-amber-50 to-white">
        <div className="container mx-auto px-6 py-16 relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-orange-100 opacity-30 translate-x-1/3 -translate-y-1/3 blur-xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-red-100 opacity-30 -translate-x-1/3 translate-y-1/3 blur-xl" />
          
          <motion.div 
            className="max-w-4xl mx-auto relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h1 className="font-gveret-levin text-4xl md:text-5xl text-[#D73502] mb-4">הצהרת פרטיות</h1>
              <div className="h-1 w-32 bg-gradient-to-r from-amber-300 to-[#D73502] mx-auto rounded-full" />
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden p-2"
            >
              {sections.map((section, index) => (
                <motion.section 
                  key={index}
                  variants={itemVariants}
                  className={`p-6 ${index !== sections.length - 1 ? 'border-b border-amber-100' : ''}`}
                >
                  <div className="flex items-start">
                    <div className="text-[#D73502] mr-4 pt-1">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold mb-4 text-[#D73502]">{section.title}</h2>
                      <p className="text-[#801100] mb-4">{section.content}</p>
                      
                      {section.list && (
                        <ul className="grid grid-cols-1 gap-2 text-[#801100]">
                          {section.list.map((item, i) => (
                            <li key={i} className="flex items-center bg-amber-50 p-3 rounded-lg">
                              <div className="w-2 h-2 bg-[#D73502] rounded-full mr-3"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </motion.section>
              ))}
        
            </motion.div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
};

export default PrivacyPolicy;