import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CTAButton = ({ 
  children, 
  className, 
  variant = 'default', 
  size = 'default',
  onClick,
  href
}) => {
  const buttonClasses = cn(
    'relative overflow-hidden group transition-all duration-300',
    {
      'bg-theme-heading-accent text-white hover:bg-theme-heading-primary hover:scale-105 shadow-lg hover:shadow-theme-heading-accent/50': variant === 'fire',
      'bg-air-light text-black border-air-dark hover:bg-air hover:scale-105 shadow-lg hover:shadow-air/50': variant === 'air',
      'bg-water text-white border-water hover:bg-water-dark hover:scale-105 shadow-lg hover:shadow-water/50': variant === 'water',
      'bg-earth text-white border-earth hover:bg-earth-dark hover:scale-105 shadow-lg hover:shadow-earth/50': variant === 'earth',
      'text-lg px-8 py-3': size === 'lg'
    },
    className
  );
  
  const renderEmbers = variant === 'fire' && (
    <>
      <span className="absolute top-0 left-1/4 w-1 h-1 rounded-full bg-theme-bg-secondary opacity-75 ember delay-100"></span>
      <span className="absolute top-0 left-2/4 w-2 h-2 rounded-full bg-theme-bg-secondary opacity-75 ember delay-300"></span>
      <span className="absolute top-0 left-3/4 w-1.5 h-1.5 rounded-full bg-theme-bg-secondary opacity-75 ember delay-500"></span>
    </>
  );

  const content = (
    <>
      {renderEmbers}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {variant === 'fire' && (
        <div className="absolute inset-0 bg-gradient-to-r from-theme-heading-accent to-theme-heading-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      {variant === 'water' && (
        <div className="absolute inset-0 bg-gradient-to-r from-water to-water-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      {variant === 'earth' && (
        <div className="absolute inset-0 bg-gradient-to-r from-earth to-earth-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      {variant === 'air' && (
        <div className="absolute inset-0 bg-gradient-to-r from-air-light to-air opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
    </>
  );

  if (href) {
    return (
      <Button asChild className={buttonClasses}>
        <a href={href}>
          {content}
        </a>
      </Button>
    );
  }

  return (
    <Button onClick={onClick} className={buttonClasses}>
      {content}
    </Button>
  );
};

export default CTAButton;
