import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';

const AccessibilityStatement = () => {
  return (
    <main>
      <Navigation />

      <div className="min-h-screen bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="font-gveret-levin text-4xl md:text-5xl text-[#D73502] text-center mb-8">
              הצהרת נגישות
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-[#801100]">
                עמותת "לגלות את האור – הנני" מחויבת לספק שירות נגיש לכלל הציבור, לרבות אנשים עם מוגבלויות.
              </p>

              <h2 className="font-gveret-levin text-2xl text-[#D73502] mt-8">הנגשת האתר</h2>
              <p className="text-[#801100]">
                האתר עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013.
                התאמות הנגישות בוצעו לפי המלצות התקן הישראלי (ת"י 5568) לנגישות תכנים באינטרנט ברמת AA
                ומסמך WCAG2.1 הבינלאומי.
              </p>

              <h2 className="font-gveret-levin text-2xl text-[#D73502] mt-8">דרכי נגישות</h2>
              <ul className="list-disc pl-6 text-[#801100]">
                <li>ניווט באמצעות מקלדת</li>
                <li>תמיכה בתוכנת קורא מסך</li>
                <li>מבנה אתר ברור ועקבי</li>
                <li>תמונות עם טקסט חלופי</li>
                <li>ניגודיות צבעים מותאמת</li>
                <li>גודל טקסט ניתן לשינוי</li>
              </ul>

              <h2 className="font-gveret-levin text-2xl text-[#D73502] mt-8">דרכי פנייה בנושא נגישות</h2>
              <p className="text-[#801100]">
                במידה ונתקלת בבעיית נגישות כלשהי באתר, אנא פנה אלינו באמצעות:
              </p>
              <ul className="list-disc pl-6 text-[#801100]">
                <li>דואר אלקטרוני: info@giluy-haor.org</li>
                <li>טלפון: 03-1234567</li>
              </ul>

              <p className="text-[#801100] mt-8">
                נשמח לקבל את פנייתך ולטפל בה בהקדם האפשרי.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default AccessibilityStatement;
