import React from 'react';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

const TermsOfUse = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Terms sections data
  const terms = [
    {
      id: "general-agreement",
      title: "הסכם כללי",
      content: "על ידי שימוש באתר זה, הנכם מסכימים לתנאי השימוש המפורטים כאן. אנא קראו את התנאים בעיון לפני השימוש באתר.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: "site-usage",
      title: "שימוש באתר",
      listItems: [
        "השימוש באתר מיועד למטרות חוקיות בלבד",
        "אין להשתמש באתר באופן שעלול לפגוע במשתמשים אחרים",
        "יש לשמור על סודיות פרטי ההתחברות"
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      )
    },
    {
      id: "copyright",
      title: "זכויות יוצרים",
      content: "כל התוכן באתר, כולל טקסטים, תמונות, לוגואים ועיצוב, מוגן בזכויות יוצרים. אין להעתיק או להשתמש בתוכן ללא אישור מפורש.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
      )
    },
    {
      id: "responsibility",
      title: "אחריות",
      content: "האתר מסופק \"כפי שהוא\" ללא כל אחריות מכל סוג שהוא. אנו לא נושאים באחריות לכל נזק שייגרם כתוצאה משימוש באתר.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  ];

  return (
    <Layout>
      <main className="flex-grow pt-24 bg-gradient-to-b from-amber-50 to-white">
        <div className="container mx-auto px-6 py-16 relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-20 w-64 h-64 rounded-full bg-orange-100 opacity-30 blur-xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-red-100 opacity-30 blur-xl" />
          
          <motion.div 
            className="max-w-4xl mx-auto relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h1 className="font-gveret-levin text-4xl md:text-5xl text-[#D73502] mb-4">תנאי שימוש</h1>
              <div className="h-1 w-32 bg-gradient-to-r from-amber-300 to-[#D73502] mx-auto rounded-full" />
            </motion.div>

            <motion.div variants={itemVariants} className="mb-8 text-[#801100] text-center bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
              <p className="font-medium text-lg">אנו מבקשים שתקראו בעיון את תנאי השימוש הבאים לפני השימוש באתר. המשך השימוש באתר מהווה הסכמה לתנאים אלו.</p>
            </motion.div>

            {/* Card layout for terms sections */}
            <div className="space-y-6">
              {terms.map((term, index) => (
                <motion.div 
                  key={term.id}
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden transform transition-all hover:shadow-lg"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-gradient-to-b from-amber-50 to-orange-50 p-6 flex items-center justify-center md:w-1/6">
                      <div className="text-[#D73502]">
                        {term.icon}
                      </div>
                    </div>
                    <div className="p-6 md:w-5/6">
                      <h2 className="text-2xl font-semibold mb-4 text-[#D73502] border-b border-amber-200 pb-2">
                        {term.title}
                      </h2>
                      
                      {term.content && (
                        <p className="text-[#801100]">{term.content}</p>
                      )}
                      
                      {term.listItems && (
                        <ul className="mt-4 space-y-2">
                          {term.listItems.map((item, i) => (
                            <li key={i} className="flex items-start text-[#801100]">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mt-1 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              variants={itemVariants}
              className="mt-12 text-center"
            >
              <div className="inline-block bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-md">
                <p className="text-[#801100] font-medium">
                  לשאלות נוספות בנוגע לתנאי השימוש, אנא צרו קשר עם צוות התמיכה שלנו
                </p>
                <p className="text-[#D73502] mt-2">
                  info@giluy-haor.org
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
};

export default TermsOfUse;