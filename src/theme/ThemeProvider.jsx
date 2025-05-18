// src/theme/ThemeProvider.jsx
import { useEffect, createContext, useContext } from 'react';
import { themeVars } from './themeVars';

const ThemeContext = createContext('fire');

const useElement = () => useContext(ThemeContext);

const ThemeProvider = ({ element, children }) => {
  useEffect(() => {
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
};

export { ThemeProvider, useElement };
