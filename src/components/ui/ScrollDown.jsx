import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const ScrollDown = ({
  targetId = null,
  offset = 80,
  hideOnScroll = true,
  position = "bottom-center", // "bottom-center", "bottom-right", "bottom-left", "center-right"
  className = "",
  style = "default"          // "default", "minimal", "floating", "pulsing"
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Hide on scroll if requested
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      setIsVisible(
        scrolled < windowHeight * 0.3 &&
        scrolled < docHeight - windowHeight - 100
      );
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll]);

  // Scroll logic that takes a fixed header into account
  const scrollToTarget = () => {
    if (targetId) {
      const element = document.getElementById(targetId);
      if (!element) return;

      const header = document.querySelector('.navbar');
      const isMobile = window.innerWidth < 768;
      const headerOffset = header instanceof HTMLElement
        ? header.offsetHeight
        : (isMobile ? 60 : 70);

      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight - offset, behavior: 'smooth' });
    }
  };

  // Position classes helper
  const getPositionClasses = () => {
    switch (position) {
      case "bottom-right": return "fixed bottom-4 right-4 md:bottom-8 md:right-8";
      case "bottom-left":  return "fixed bottom-4 left-4 md:bottom-8 md:left-8";
      case "center-right": return "fixed top-1/2 right-4 md:right-8 -translate-y-1/2";
      default:              return "fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2";
    }
  };

  // Style variants
  const getStyleVariant = () => {
    switch (style) {
      case "minimal":
        return {
          container: "bg-transparent",
          button: "p-1.5 md:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors",
          icon: "w-6 h-6 md:w-8 md:h-8"
        };
      case "floating":
        return {
          container: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50",
          button: "p-2.5 md:p-4 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all hover:scale-110",
          icon: "w-5 h-5 md:w-6 md:h-6"
        };
      case "pulsing":
        return {
          container: "bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm",
          button: "p-2 md:p-3 rounded-full bg-red-900 text-white shadow-lg transition-all",
          icon: "w-5 h-5 md:w-7 md:h-7"
        };
      default:
        return {
          container: "bg-gray-900/80 dark:bg-gray-800/80 backdrop-blur-sm",
          button: "p-2 md:p-3 text-white hover:text-gray-200 transition-all hover:scale-105",
          icon: "w-5 h-5 md:w-6 md:h-6"
        };
    }
  };
  const styleVariant = getStyleVariant();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`${getPositionClasses()} z-50 ${className}`}
        >
          <div className={`rounded-full ${styleVariant.container}`}>
            <motion.button
              onClick={scrollToTarget}
              className={`rounded-full flex items-center space-x-1 rtl:space-x-reverse ${styleVariant.button}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={style === "pulsing" ? {
                scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7]
              } : {}}
              transition={style === "pulsing" ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
              aria-label="Scroll down"
            >
              <span className="font-medium">גלול למטה</span>
              <ChevronDown className={styleVariant.icon} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollDown;
