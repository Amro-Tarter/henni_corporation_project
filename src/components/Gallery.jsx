import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const currentItem = galleryItems[currentIndex];

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-[#FAC000]/10 to-[#801100]/5">
      <div className="container mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-title text-4xl md:text-5xl text-[#801100] mb-6 drop-shadow-lg">
            מנהיגות צומחת יצירה - מעצימים את דור העתיד!
          </h2>
          <p className="text-xl text-[#B62203]/80 leading-relaxed max-w-3xl mx-auto">
            הצצה לעבודות ולפרויקטים שלנו
          </p>
        </motion.div>

        {/* Single Image Gallery */}
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full aspect-[4/3] relative overflow-hidden rounded-xl shadow-xl"
            >
              <img
                src={currentItem.image}
                alt={currentItem.caption}
                className={cn(
                  'object-cover w-full h-full transition-all duration-500',
                  'hover:scale-105'
                )}
              />
            </motion.div>
          </AnimatePresence>

          <div className="text-center">
            <h3 className="font-title text-2xl md:text-3xl text-[#801100] mb-3">
              {currentItem.caption}
            </h3>
            <p className="text-base text-[#B62203]/80">{currentItem.credit}</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Gallery;
