import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import CommunityPage from '../../pages/CommunityPage';
import CTAButton from "@/components/CTAButton";


const galleryItems = [
  {
    image: '/sculpture.jpg',
    caption: 'יצירת אמנות מקורית',
    credit: 'צילום: צוות העמותה',
  },
  {
    image: '/wall.jpg',
    caption: 'פרויקט קהילתי',
    credit: 'צילום: צוות העמותה',
  },
];

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % galleryItems.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentItem = galleryItems[currentIndex];

  return (
    <section
      id="gallery"
      className="py-24 bg-gradient-to-b from-white via-blue-50 to-purple-50"
      dir="rtl"
    >
      <div className="container mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20 mt-10"
        >
          <h2 className="font-title text-4xl md:text-5xl text-blue-700 mb-4 drop-shadow-sm">
            יצירה שמרחפת מעבר לגבולות
          </h2>
          <p className="text-xl text-blue-600/80 leading-relaxed max-w-3xl mx-auto">
            מבט אל תוך עולמות היצירה והעשייה הקהילתית של משתתפי התכנית
          </p>
        </motion.div>

        {/* Gallery Image */}
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.image}
              initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.98 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.98 }}
              transition={{ duration: 1 }}
              className="w-full aspect-[4/3] relative overflow-hidden rounded-3xl shadow-lg"
            >
              <img
                src={currentItem.image}
                alt={currentItem.caption}
                className={cn(
                  'object-cover w-full h-full transition-transform duration-700 ease-in-out',
                  'hover:scale-105 hover:brightness-105'
                )}
              />
            </motion.div>
          </AnimatePresence>

          {/* Caption & Credit */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-center"
          >
            <h3 className="font-title text-2xl md:text-3xl text-purple-700 mb-1">
              {currentItem.caption}
            </h3>
            <p className="text-sm text-gray-500">{currentItem.credit}</p>
          </motion.div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {galleryItems.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300',
                  currentIndex === i ? 'bg-blue-700' : 'bg-blue-300'
                )}
              />
            ))}
          </div>
        </div>
        {/* Video Section - left aligned */}
        <div className="mt-24 grid grid-cols-2 lg:grid-cols-2 gap-6 items-center max-w-7xl mx-auto px-6" dir="rtl">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-right"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-purple-700 mb-4">
              לגלות את הקול האישי
            </h3>
            <p className="text-lg text-blue-600/80">
              עדויות מהשטח – על העצמה, יצירה והתחברות לעוצמה הפנימית של כל משתתף
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="col-span-1 w-[700px] max-w-6xl h-[400px] md:h-[400px] rounded-3xl overflow-hidden shadow-2xl mx-auto"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              title="לגלות את הקול האישי"
            >
              <source src="/video/vid2.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </div>


        <div className="mt-40 max-w-6xl mx-auto px-4 md:px-0" dir="rtl">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-blue-700 mb-10 text-right"
          >
            ההשפעה שלנו – במספרים
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-100 to-white rounded-3xl shadow-lg p-6 hover:scale-105 transition"
            >
              <p className="text-5xl font-bold text-blue-800 mb-2">+1,200</p>
              <p className="text-lg text-gray-600">בני נוער שגילו את האור שבתוכם</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-100 to-white rounded-3xl shadow-lg p-6 hover:scale-105 transition"
            >
              <p className="text-5xl font-bold text-purple-800 mb-2">+85</p>
              <p className="text-lg text-gray-600">פרויקטים קהילתיים יזמיים</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-indigo-100 to-white rounded-3xl shadow-lg p-6 hover:scale-105 transition"
            >
              <p className="text-5xl font-bold text-indigo-800 mb-2">+30</p>
              <p className="text-lg text-gray-600">יישובים בהם פועלת העמותה</p>
            </motion.div>
          </div>
        </div>

      {/* button to move to community page */}
        <div className="mt-24 text-center">
         <CTAButton
            href="/community"
            variant="water"
            size="lg"
            className="bg-water text-white border border-water hover:bg-water-accent hover:scale-105 shadow-lg hover:shadow-water/50"
            target="_blank"
            rel="noopener noreferrer"
          >
          קראו עוד
          </CTAButton>
        </div>

      </div>
    </section>
  );
};
export default Gallery;
