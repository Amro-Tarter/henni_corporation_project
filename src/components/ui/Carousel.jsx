import React, { useRef } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { cn } from '@/lib/utils'; // your utils.js

export const Carousel = ({ children, opts = {}, className }) => {
  const [sliderRef] = useKeenSlider({
    loop: opts.loop ?? true,
    drag: opts.watchDrag ?? true,
    duration: opts.duration ?? 10,
    ...opts,
  });

  return (
    <div ref={sliderRef} className={cn('keen-slider', className)}>
      {children}
    </div>
  );
};

export const CarouselContent = ({ children }) => {
  return (
    <div className="keen-slider__slide flex">
      {children}
    </div>
  );
};

export const CarouselItem = ({ children }) => {
  return (
    <div className="keen-slider__slide flex justify-center items-center p-4">
      {children}
    </div>
  );
};

export const CarouselPrevious = ({ className, ...props }) => (
  <button
    className={cn(
      'absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all z-10',
      className
    )}
    {...props}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </button>
);

export const CarouselNext = ({ className, ...props }) => (
  <button
    className={cn(
      'absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all z-10',
      className
    )}
    {...props}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </button>
);
