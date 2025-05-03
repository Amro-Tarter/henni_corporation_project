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
      <section id="gallery" className="py-24 bg-gradient-to-b from-white to-slate-100" >

      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20 mt-10"
        >
          <h2 className="font-title text-4xl md:text-5xl text-[#801100] mb-6 drop-shadow-lg">
            מנהיגות צומחת יצירה - מעצימים את דור העתיד!
          </h2>
          <p className="text-xl text-[#B62203]/80 leading-relaxed max-w-3xl mx-auto">
            הצצה לעבודות ולפרויקטים שלנו
          </p>
        </motion.div>

        {/* Gallery Image */}
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.image}
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className="w-full aspect-[4/3] relative overflow-hidden rounded-2xl shadow-xl"
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
            <h3 className="font-title text-2xl md:text-3xl text-[#801100] mb-2">
              {currentItem.caption}
            </h3>
            <p className="text-base text-[#B62203]/80">{currentItem.credit}</p>
          </motion.div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {galleryItems.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300',
                  currentIndex === i
                    ? 'bg-[#801100]'
                    : 'bg-[#801100]/30'
                )}
              />
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8">
            <a
              href="#projects"
              className="text-[#801100] font-semibold underline hover:text-[#B62203] transition"
            >
              ראו עוד פרויקטים שלנו
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
