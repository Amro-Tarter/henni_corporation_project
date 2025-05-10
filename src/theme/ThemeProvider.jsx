// src/theme/ThemeProvider.jsx
import { useEffect, createContext, useContext } from 'react';
import { themeVars } from './themeVars';

// context only for prop‐drilling if you want, but the important bit is the useEffect
const ThemeContext = createContext('fire');
export const useElement = () => useContext(ThemeContext);

export function ThemeProvider({ element, children }) {
  useEffect(() => {
    // pick the right HSL map and apply each CSS var to :root
    const vars = themeVars[element] || themeVars.fire;
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
  }, [element]);

  return (
    <ThemeContext.Provider value={element}>
      {children}
    </ThemeContext.Provider>
  );
}
