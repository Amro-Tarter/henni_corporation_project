import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const ArtPanelCard = ({ 
  title, 
  icon, 
  children, 
  bgGradient, 
  blobColor, 
  iconSide = 'left', 
  doodles, 
  textColor 
}) => {
  return (
    <motion.div 
      className="relative h-full p-6 rounded-lg overflow-hidden"
      style={{ background: bgGradient }}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      {/* Blob background overlay */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-multiply"
        style={{ backgroundColor: blobColor }}
      />

      {/* Optional doodles decoration */}
      {doodles && <div className="absolute inset-0">{doodles}</div>}

      {/* Content container */}
      <div className={`flex ${iconSide === 'left' ? 'flex-row' : 'flex-row-reverse'} items-start gap-4 relative z-10`}>
        {/* Icon wrapper */}
        <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
          {icon}
        </div>

        {/* Text content */}
        <div className="flex-1">
          <h3 
            className="text-2xl font-bold mb-4 drop-shadow-md"
            style={{ color: textColor }}
          >
            {title}
          </h3>
          <div className="space-y-2">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

ArtPanelCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  children: PropTypes.node.isRequired,
  bgGradient: PropTypes.string.isRequired,
  blobColor: PropTypes.string.isRequired,
  iconSide: PropTypes.oneOf(['left', 'right']),
  doodles: PropTypes.element,
  textColor: PropTypes.string
};

export default ArtPanelCard;