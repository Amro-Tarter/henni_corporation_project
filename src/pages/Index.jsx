import React from 'react';
import { motion } from 'framer-motion';
import { Feather, Droplet, Leaf, Flame } from 'lucide-react';

import Hero from '../components/Hero';
import Navigation from '../components/Navigation';
import ElementSection from '../components/ElementSection';
import JoinUs from '../components/JoinUs';
import Footer from '../components/Footer';
import OurStory from '../components/OurStory';
import Gallery from '@/components/Gallery';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: 'easeOut' },
};

const staggerChildren = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.2 },
  },
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-rose-50 to-yellow-100" dir="rtl">
      <Navigation />
      <Hero />

      <main className="relative overflow-hidden">
        <FloatingElements />
        <Gallery />
        <OurStory />

        {/* Educational Initiatives Section */}
        <motion.section
          id="what-we-do"
          className="py-24 bg-white/80 backdrop-blur-md relative"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
        >
          <motion.div className="container mx-auto px-4 text-center" variants={fadeInUp}>
            <h2 className="font-gveret-levin text-4xl md:text-5xl text-fire-dark mb-6">מיזמים חינוכיים</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600">
              ארבעת היסודות - אש, אוויר, מים ואדמה - מהווים את הבסיס לעשייה החינוכית שלנו.
              כל יסוד מדגיש פן אחר בהתפתחות האישית שאנו מטפחים בבני הנוער.
            </p>
          </motion.div>
        </motion.section>

        {/* Elements - Fire, Air, Water, Earth */}
        <div className="space-y-24">
          <ElementSection
            id="fire-element"
            element="fire"
            title="אש - יצירה ותשוקה"
            illustration={<AnimatedIcon icon={<Flame size={120} className="text-fire" />} bgColor="bg-fire/10" />}
          >
            <FireText />
          </ElementSection>

          <ElementSection
            id="air-element"
            element="air"
            title="אוויר - חלומות ורעיונות"
            reversed
            illustration={<AnimatedIcon icon={<Feather size={120} className="text-air-dark" />} bgColor="bg-air-light/50" />}
          >
            <AirText />
          </ElementSection>

          <ElementSection
            id="water-element"
            element="water"
            title="מים - רגשות וזרימה"
            illustration={<AnimatedIcon icon={<Droplet size={120} className="text-water" />} bgColor="bg-water/10" />}
          >
            <WaterText />
          </ElementSection>

          <ElementSection
            id="earth-element"
            element="earth"
            title="אדמה - יציבות וצמיחה"
            reversed
            illustration={<AnimatedIcon icon={<Leaf size={120} className="text-earth" />} bgColor="bg-earth-light" />}
          >
            <EarthText />
          </ElementSection>
        </div>

        <JoinUs />
      </main>

      <Footer />
    </div>
  );
};

const AnimatedIcon = ({ icon, bgColor }) => (
  <motion.div
    className={`aspect-video ${bgColor} rounded-2xl flex items-center justify-center relative shadow-md`}
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="relative p-8 md:p-12">
      {icon}
    </div>
  </motion.div>
);

const FloatingElements = () => (
  <>
    <div className="absolute top-32 left-12 w-24 h-24 bg-fire/20 rounded-full blur-2xl animate-pulse" />
    <div className="absolute bottom-20 right-16 w-20 h-20 bg-air-dark/20 rounded-full blur-2xl animate-ping" />
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-water/10 rounded-full blur-3xl opacity-30 animate-float" />
  </>
);

const FireText = () => (
  <>
    <p className="text-lg mb-4">האש מייצגת את התשוקה והיצירתיות הבוערת בכל אחד ואחת מאיתנו. בסדנאות היצירה שלנו, בני הנוער מגלים את האור הפנימי שלהם.</p>
    <p className="text-lg">כשבני נוער מחוברים לאש הפנימית, הם מגלים כוח עצום לשנות את עולמם.</p>
  </>
);

const AirText = () => (
  <>
    <p className="text-lg mb-4">האוויר מסמל את החופש לדמיין וליצור. אנו מעודדים מחשבה מקורית וחדשנית דרך סדנאות חשיבה פורצת גבולות.</p>
    <p className="text-lg">כל רעיון קטן יכול להפוך לחזון גדול המניע קהילות שלמות.</p>
  </>
);

const WaterText = () => (
  <>
    <p className="text-lg mb-4">המים מייצגים רגש וזרימה. אנו מלמדים להבין רגשות ולהתמודד עם אתגרים בלב פתוח ובאומץ.</p>
    <p className="text-lg">החוסן הרגשי הוא מפתח לצמיחה בריאה ומשמעותית בעולם משתנה.</p>
  </>
);

const EarthText = () => (
  <>
    <p className="text-lg mb-4">האדמה מסמלת שורשיות ובנייה יציבה. בסדנאות המנהיגות שלנו אנו מניחים את אבני הדרך להצלחה אמיתית.</p>
    <p className="text-lg">אנו מאמינים בשיתוף פעולה, אחריות אישית וחזון קהילתי לעתיד טוב יותר.</p>
  </>
);

export default HomePage;