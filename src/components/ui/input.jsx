import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "w-full h-11 px-4 py-2 rounded-lg border border-gray-300 bg-white text-base text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-fire focus:border-fire disabled:opacity-50 disabled:cursor-not-allowed file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
