import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, Users, HandHeart, Lightbulb, Sparkles } from 'lucide-react';
import ArtPanelCard from '@/components/ui/ArtPanelCard';

const BACKGROUNDS = [
  "linear-gradient(135deg, #FF4500 10%, #FF6347 90%)",
  "linear-gradient(135deg, #FF6347 10%, #FF8C00 90%)",
  "linear-gradient(135deg, #FF8C00 10%, #FF4500 90%)",
];

const TEXT_COLORS = ["#ccf3ff", "#E0fbff", "#ffffff", "#f9ffe8"];
const BLOB_COLORS = ["#FF4500", "#FF6347", "#FF8C00"];

const OurStory = () => {
  return (
    <section id="our-story" className="relative py-24 overflow-hidden bg-gradient-to-b from-fire/5 to-orange-100/20">
      <FloatingDoodles />
      <div className="container mx-auto px-6 space-y-32">

        {/* Vision + Purpose (floating cards) */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="-rotate-2"
          >
            <ArtPanelCard 
              title="החזון שלנו"
              icon={<Sparkles size={36} className="text-white" />}
              bgGradient={BACKGROUNDS[0]}
              blobColor={BLOB_COLORS[0]}
              iconSide="right"
              textColor={TEXT_COLORS[2]}
            >
              <p style={{ color: TEXT_COLORS[0] }}>אנחנו מאמינים בכוחה של היצירה להעצים בני נוער ולפתח מנהיגות צעירה...</p>
            </ArtPanelCard>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rotate-2"
          >
            <ArtPanelCard 
              title="חזון דור צעיר"
              icon={<Sparkles size={36} className="text-white" />}
              bgGradient={BACKGROUNDS[1]}
              blobColor={BLOB_COLORS[1]}
              iconSide="left"
              textColor={TEXT_COLORS[2]}
            >
              <p style={{ color: TEXT_COLORS[1] }}>יצירת דור של מנהיגים צעירים המחוברים לעצמם ולקהילה...</p>
            </ArtPanelCard>
          </motion.div>
        </div>

        {/* The Purpose */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <ArtPanelCard
            title="המטרה שלנו"
            icon={<Lightbulb size={36} className="text-yellow-400" />}
            bgGradient={BACKGROUNDS[2]}
            blobColor={BLOB_COLORS[2]}
            iconSide="right"
            textColor={TEXT_COLORS[2]}
          >
            <p style={{ color: TEXT_COLORS[1] }}>להעניק לכל נער ונערה בישראל כלים לגלות ולהוביל מתוך תשוקה פנימית.</p>
          </ArtPanelCard>
        </motion.div>

        {/* Creative Leadership List */}
        <div className="relative bg-white/80 backdrop-blur-md rounded-xl p-10 shadow-2xl">
          <h2 className="text-3xl font-bold text-orange-600 mb-8 text-center">הכוח המשנה של יצירה ומנהיגות</h2>
          <motion.ul 
            initial="hidden" 
            whileInView="visible" 
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.2 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {["אמנות פלסטית – פתרון אתגרים", "מוזיקה – הקשבה והרמוניה", "תיאטרון – ביטחון ותקשורת", "מחול – משמעת אישית", "כתיבה יוצרת – קול אישי"].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-orange-100 p-6 rounded-lg shadow-md"
              >
                <p className="text-lg font-medium text-orange-700">✦ {item}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Timeline 4 years program */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-orange-400 to-orange-200 h-full"></div>
          <div className="grid gap-16 ml-8">
            {["גילוי עצמי", "פיתוח יצירתי", "הובלת יוזמות", "בניית עתיד"].map((stage, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: idx * 0.2 }}
                className="relative pl-6"
              >
                <div className="absolute -left-5 top-1 w-4 h-4 bg-orange-500 rounded-full shadow-lg"></div>
                <h4 className="text-2xl font-semibold text-orange-800">שנה {idx + 1} – {stage}</h4>
                <p className="text-gray-700 mt-2">שלב {idx + 1} – משימות ופעילויות לפיתוח אישי והעצמה קהילתית.</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

function FloatingDoodles() {
  return (
    <>
      <div className="absolute top-10 left-10 animate-pulse-slow">
        <span className="text-5xl opacity-30">✨</span>
      </div>
      <div className="absolute bottom-10 right-16 animate-bounce-slow">
        <span className="text-6xl opacity-20">🎶</span>
      </div>
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 animate-wiggle">
        <svg width="100" height="40">
          <path d="M0 20 Q50 0 100 20" stroke="#FF8C00" strokeWidth="3" fill="none" />
        </svg>
      </div>
    </>
  );
}

export default OurStory;
