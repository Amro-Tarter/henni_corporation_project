import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const ElementSection = ({
  id,
  element,
  title,
  children,
  className,
  reversed = false,
  illustration
}) => {
  const [airParticles, setAirParticles] = useState([]);

  useEffect(() => {
    if (element === 'air') {
      const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 7 + 3,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 3000,
      }));
      setAirParticles(particles);
    }
  }, [element]);

  const elementStyles = {
    fire: {
      bg: "bg-gradient-to-br from-theme-bg-secondary/10 to-theme-bg-primary/10",
      text: "text-theme-text-primary",
      heading: "from-theme-text-primary to-theme-heading-accent",
    },
    air: {
      bg: "bg-air-light/30",
      text: "text-blue-800",
      heading: "from-blue-700 to-air-dark",
    },
    water: {
      bg: "bg-white",
      text: "text-water-dark",
      heading: "from-water-dark to-water",
    },
    earth: {
      bg: "bg-earth-light/20 earth-texture",
      text: "text-earth-dark",
      heading: "from-earth-dark to-earth",
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const renderElementEffect = () => {
    switch (element) {
      case 'air':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {airParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-white/10"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: particle.left,
                  top: particle.top,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: particle.delay, duration: 0.5 }}
              />
            ))}
          </div>
        );
      case 'water':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        );
      case 'fire':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.section
      id={id}
      className={cn(
        'relative py-16 md:py-24',
        elementStyles[element].bg,
        className
      )}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      {renderElementEffect()}

      <div className="container mx-auto px-4">
        <div
          className={cn(
            'flex flex-col md:flex-row items-center gap-8',
            reversed && 'md:flex-row-reverse'
          )}
        >
          <motion.div className="md:w-1/2" variants={contentVariants}>
            <motion.h2
              className={cn(
                'text-3xl md:text-4xl lg:text-5xl font-gveret-levin mb-6 bg-gradient-to-r bg-clip-text text-transparent',
                elementStyles[element].heading
              )}
              variants={contentVariants}
            >
              {title}
            </motion.h2>
            <motion.div
              className={elementStyles[element].text}
              variants={contentVariants}
            >
              {children}
            </motion.div>
          </motion.div>

          <motion.div
            className="md:w-1/2"
            variants={contentVariants}
            custom={1}
          >
            {illustration}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default ElementSection;
