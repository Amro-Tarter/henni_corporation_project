import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';
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
    <section id="our-story"       className="relative py-20 md:py-28 bg-gradient-to-br from-orange-100 via-orange-200 to-yellow-100 overflow-hidden"
>
      <div className="container mx-auto px-6 space-y-32">
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

      </div>
    </section>
  );
};

export default OurStory;
