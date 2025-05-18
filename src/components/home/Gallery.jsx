import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const mediaItems = [
  {
    type: 'image',
    src: '/sculpture.jpg',
    thumbnail: '/pexels-steve-1269968.jpg',
    caption: 'יצירת אמנות מקורית',
    credit: 'צילום: צוות העמותה',
  },
  {
    type: 'video',
    src: '/video/vid2.mp4',
    thumbnail: '/pexels-steve-1269968.jpg',
    caption: 'לגלות את הקול האישי',
    credit: 'עדויות מהשטח',
  },
  {
    type: 'image',
    src: '/wall.jpg',
    thumbnail: '/pexels-steve-1269968.jpg',
    caption: 'פרויקט קהילתי', 
    credit: 'צילום: צוות העמותה',
  },

];

const stats = [
  { value: 1200, label: 'בני נוער שגילו את האור שבתוכם', color: 'blue' },
  { value: 85, label: 'פרויקטים קהילתיים יזמיים', color: 'purple' },
  { value: 30, label: 'יישובים בהם פועלת העמותה', color: 'indigo' },
];

const AnimatedCounter = ({ endValue, isVisible, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isVisible) return;
    
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * endValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, endValue, duration]);
  
  return <span>{count.toLocaleString()}+</span>;
};

const Gallery = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, threshold: 0.3 });

  const activeItem = mediaItems[activeIndex];

  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
    setIsVideoPlaying(false);
  };

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  return (
    <section
      id="gallery"
      className="py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50"
      dir="rtl"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">
            יצירה שמרחפת מעבר לגבולות
          </h2>
          <p className="text-lg text-blue-600/80 max-w-2xl mx-auto">
            מבט אל תוך עולמות היצירה והעשייה הקהילתית
          </p>
        </motion.div>

        {/* Interactive Media Viewer */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
          <div className="grid md:grid-cols-5 gap-0">
            
            {/* Main Content Area */}
            <div className="md:col-span-4 relative">
              <div className="aspect-video relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                  >
                    {activeItem.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          src={activeItem.src}
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleVideoToggle}
                            className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg"
                          >
                            {isVideoPlaying ? (
                              <Pause className="w-8 h-8 text-blue-700" />
                            ) : (
                              <Play className="w-8 h-8 text-blue-700 ml-1" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={activeItem.src}
                        alt={activeItem.caption}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              
              {/* Caption Area */}
              <div className="p-6 border-t">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-semibold text-purple-700 mb-1">
                    {activeItem.caption}
                  </h3>
                  <p className="text-sm text-gray-500">{activeItem.credit}</p>
                </motion.div>
              </div>
            </div>

            {/* Thumbnail Sidebar */}
            <div className="md:col-span-1 bg-gray-50 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">
                תוכן נוסף
              </h4>
              <div className="space-y-3">
                {mediaItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative w-full aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      activeIndex === index
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.caption}
                      className="w-full h-full object-cover"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-xs text-white font-medium truncate">
                        {item.caption}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Animated Statistics */}
        <div ref={statsRef} className="mb-12">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-3xl font-bold text-blue-700 mb-8 text-center"
          >
            ההשפעה שלנו – במספרים
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`bg-gradient-to-br from-${stat.color}-100 to-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1`}
              >
                <div className={`text-4xl md:text-5xl font-bold text-${stat.color}-800 mb-2`}>
                  <AnimatedCounter
                    endValue={stat.value}
                    isVisible={isStatsInView}
                    duration={2000 + index * 500}
                  />
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Gallery;