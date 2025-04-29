import React from 'react';
import { motion } from 'framer-motion';
import { Feather, Droplet, Leaf, Flame } from 'lucide-react';

// Components
import Hero from '../components/Hero';
import Navigation from '../components/Navigation';
import ElementSection from '../components/ElementSection';
import JoinUs from '../components/JoinUs';
import Footer from '../components/Footer';
import OurStory from '../components/OurStory';
import Gallery from '@/components/Gallery';

// Animation configurations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerChildren = {
  initial: { opacity: 0 },
  whileInView: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  },
  viewport: { once: true, margin: "-100px" }
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100" dir="rtl">
      <Navigation />
      <Hero />

      <main>
        <Gallery />
        <OurStory />

        {/* Elements Section */}
        <motion.section 
          id="what-we-do" 
          className="py-12 bg-orange-50/80"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <motion.div 
            className="container mx-auto px-4 text-center"
            variants={fadeInUp}
          >
            <h2 className="font-gveret-levin text-3xl md:text-5xl text-fire-dark/90 mb-12">
              מיזמים חינוכיים
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 text-fire-dark/80">
              ארבעת היסודות - אש, אוויר, מים ואדמה - מהווים את הבסיס לעבודתנו החינוכית. 
              כל יסוד מייצג היבט שונה של התפתחות אישית שאנחנו מטפחים אצל בני הנוער.
            </p>
          </motion.div>
        </motion.section>

        {/* Fire Element */}
        <ElementSection 
          id="fire-element" 
          element="fire" 
          title="אש - יצירה ותשוקה"
          illustration={
            <motion.div 
              className="aspect-video bg-fire/10 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative p-8 md:p-12">
                <div className="absolute inset-0 bg-fire/5 blur-xl rounded-full" />
                <Flame size={120} className="text-fire mx-auto animate-flicker" />
              </div>
            </motion.div>
          }
        >
          <p className="text-lg mb-4">
            האש מייצגת את התשוקה והיצירתיות הבוערת בכל אחד ואחת מאיתנו. בסדנאות היצירה שלנו, 
            בני הנוער מגלים את האור הפנימי שלהם ולומדים לבטא אותו דרך אמנות, מוזיקה, כתיבה ומגוון צורות ביטוי.
          </p>
          <p className="text-lg mb-4">
            אנחנו מאמינים שכאשר בני נוער מתחברים לאש הפנימית שלהם, הם מוצאים כוח עצום שיכול להאיר 
            את דרכם ולהשפיע על העולם סביבם.
          </p>
        </ElementSection>

        {/* Air Element */}
        <ElementSection 
          id="air-element" 
          element="air" 
          title="אוויר - חלומות ורעיונות"
          reversed
          illustration={
            <motion.div 
              className="aspect-video bg-air-light/50 rounded-lg flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Feather size={120} className="text-air-dark mx-auto animate-float" />
            </motion.div>
          }
        >
          <p className="text-lg mb-4">
            האוויר מסמל את החופש לחלום, לחשוב ולדמיין. בסדנאות החשיבה היצירתית שלנו, 
            אנחנו מעודדים בני נוער להרחיב את האופקים שלהם ולפתח רעיונות חדשים.
          </p>
          <p className="text-lg mb-4">
            אנחנו מלמדים טכניקות לחשיבה מחוץ לקופסה, פתרון בעיות בצורה יצירתית, 
            ובניית חזון אישי וקבוצתי כדי להפוך רעיונות למציאות.
          </p>
        </ElementSection>

        {/* Water Element */}
        <ElementSection 
          id="water-element" 
          element="water" 
          title="מים - רגשות וזרימה"
          illustration={
            <motion.div 
              className="aspect-video bg-water/10 rounded-lg flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Droplet size={120} className="text-water mx-auto animate-ripple" />
            </motion.div>
          }
        >
          <p className="text-lg mb-4">
            המים מייצגים את הרגשות שלנו ואת היכולת שלנו לזרום עם החיים. בסדנאות ההתפתחות הרגשית, 
            אנחנו מלמדים בני נוער להכיר, להבין ולנהל את הרגשות שלהם בצורה בריאה.
          </p>
          <p className="text-lg mb-4">
            אנחנו מפתחים מיומנויות של אמפתיה, תקשורת בינאישית, ויכולת להתמודד עם אתגרים
            רגשיים מתוך גמישות וחוסן נפשי.
          </p>
        </ElementSection>

        {/* Earth Element */}
        <ElementSection 
          id="earth-element" 
          element="earth" 
          title="אדמה - יציבות וצמיחה"
          reversed
          illustration={
            <motion.div 
              className="aspect-video bg-earth-light rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Leaf size={120} className="text-earth mx-auto" />
            </motion.div>
          }
        >
          <p className="text-lg mb-4">
            האדמה מסמלת את היציבות והצמיחה. בתוכניות המנהיגות שלנו, אנחנו בונים בסיס איתן
            של ערכים, אחריות חברתית ומיומנויות מעשיות שיסייעו לבני הנוער בהווה ובעתיד.
          </p>
          <p className="text-lg mb-4">
            אנחנו מעודדים יוזמות קהילתיות שיוצרות שינוי חיובי ומלמדים כיצד לטפח את הסביבה הפיזית
            והחברתית סביבנו כדי לאפשר צמיחה משותפת.
          </p>
        </ElementSection>

        <JoinUs />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;