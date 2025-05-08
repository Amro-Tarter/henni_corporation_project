import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CTAButton = ({ 
  children, 
  className, 
  variant = 'default', 
  size = 'default',
  onClick,
  href,
  animated = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    updateMousePosition(e);
  };

  const handleMouseMove = (e) => {
    if (isHovered) {
      updateMousePosition(e);
    }
  };

  const updateMousePosition = (e) => {
    const rect = e.target.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Ember positions for fire variants
  const [emberPositions, setEmberPositions] = useState([]);
  useEffect(() => {
    if (variant === 'fire' || variant === 'inverse-fire') {
      const emberCount = Math.floor(Math.random() * 4) + 5;
      const newPositions = [];
      for (let i = 0; i < emberCount; i++) {
        newPositions.push({
          left: `${Math.random() * 100}%`,
          delay: `${Math.random() * 2}s`,
          size: `${Math.random() * 1.5 + 0.5}px`,
          duration: `${Math.random() * 2 + 1}s`
        });
      }
      setEmberPositions(newPositions);
    }
  }, [variant]);

  // Button classes with accent hovers
  const buttonClasses = cn(
    'relative overflow-hidden group transition-all duration-300',
    {
      // 🔥 Fire
      'bg-fire text-white hover:bg-fire-accent hover:scale-105 shadow-lg hover:shadow-fire-accent/50':
        variant === 'fire',
      'bg-white text-fire border border-fire hover:bg-fire/10 hover:scale-105 shadow-lg hover:shadow-fire/30':
        variant === 'inverse-fire',

      // 💨 Air
      'bg-air-soft text-air border border-air hover:bg-air hover:scale-105 shadow-lg hover:shadow-air/50':
        variant === 'air',
      'bg-white text-air border border-air hover:bg-air/10 hover:scale-105 shadow-lg hover:shadow-air/30':
        variant === 'inverse-air',

      // 🌊 Water
      'bg-water text-white border border-water hover:bg-water-accent hover:scale-105 shadow-lg hover:shadow-water/50':
        variant === 'water',
      'bg-white text-water border border-water hover:bg-water-accent/10 hover:scale-105 shadow-lg hover:shadow-water/30':
        variant === 'inverse-water',

      // 🌱 Earth
      'bg-earth text-white border border-earth hover:bg-earth-accent hover:scale-105 shadow-lg hover:shadow-earth-accent/50':
        variant === 'earth',
      'bg-white text-earth border border-earth hover:bg-earth-accent/10 hover:scale-105 shadow-lg hover:shadow-earth/30':
        variant === 'inverse-earth',

      // Size variants
      'text-lg px-8 py-3 rounded-xl': size === 'lg',
      'text-sm px-4 py-2 rounded-lg': size === 'sm',
      'text-xs px-3 py-1 rounded-md': size === 'xs',
      'w-full justify-center': size === 'full',
      'rounded-lg': size !== 'lg' && size !== 'sm' && size !== 'xs',
    },
    className
  );

  // Ember render
  const renderEmbers = (variant === 'fire' || variant === 'inverse-fire') && emberPositions.map((pos, index) => (
    <span
      key={index}
      className={`absolute bottom-0 rounded-full ${variant === 'fire' ? 'bg-yellow-200' : 'bg-orange-300'} opacity-0 animate-float`}
      style={{
        left: pos.left,
        width: pos.size,
        height: pos.size,
        animationDelay: pos.delay,
        animationDuration: pos.duration
      }}
    />
  ));

  // Gradient for hover overlay
  const getGradientColors = () => {
    switch (variant) {
      case 'fire':
        return 'from-fire to-fire-accent';
      case 'inverse-fire':
        return 'from-fire/20 to-fire-accent/20';
      case 'water':
        return 'from-water to-water-accent';
      case 'inverse-water':
        return 'from-water/20 to-water-accent/20';
      case 'earth':
        return 'from-earth to-earth-accent';
      case 'inverse-earth':
        return 'from-earth/20 to-earth-accent/20';
      case 'air':
        return 'from-air-light to-air';
      case 'inverse-air':
        return 'from-air-light/20 to-air/20';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  // Ripple color per variant
  const getRippleColor = () => {
    switch (variant) {
      case 'fire': return 'bg-fire-soft';
      case 'inverse-fire': return 'bg-fire';
      case 'water': return 'bg-water-soft';
      case 'inverse-water': return 'bg-water-accent';
      case 'earth': return 'bg-earth-soft';
      case 'inverse-earth': return 'bg-earth-accent';
      case 'air': return 'bg-air-soft';
      case 'inverse-air': return 'bg-air';
      default: return 'bg-white';
    }
  };

  // Content
  const content = (
    <>
      {animated && renderEmbers}
      {animated && isHovered && (
        <span
          className={`absolute w-32 h-32 rounded-full ${getRippleColor()} opacity-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ripple`}
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
          }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {animated && (
        <div className={`absolute inset-0 bg-gradient-to-r ${getGradientColors()} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      )}
    </>
  );

  // Render link or button
  if (href) {
    return (
      <Button asChild className={buttonClasses}>
        <a
          href={href}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          {content}
        </a>
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      className={buttonClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {content}
    </Button>
  );
};

// Global keyframes injection
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes float {
      0% { transform: translateY(0); opacity: 0; }
      10% { opacity: 0.8; }
      100% { transform: translateY(-100px); opacity: 0; }
    }
    @keyframes ripple {
      to { transform: translate(-50%, -50%) scale(3); opacity: 0; }
    }
    .animate-float { animation: float 2s ease-out forwards; }
    .animate-ripple { animation: ripple 1s ease-out forwards; }
  `;
  if (!document.querySelector('style[data-cta-button-animations]')) {
    styleEl.setAttribute('data-cta-button-animations', 'true');
    document.head.appendChild(styleEl);
  }
}

export default CTAButton;
