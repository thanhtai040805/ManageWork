import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext({
  primaryColor: "#f87171",
  setPrimaryColor: () => {},
});

export const ThemeProvider = ({ children }) => {
  // Helper function to darken/lighten color
  const shadeColor = (color, percent) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
  };

  // Initialize with color from localStorage or default
  const getInitialColor = () => {
    if (typeof window !== 'undefined') {
      const savedColor = localStorage.getItem("theme_color");
      return savedColor || "#f87171";
    }
    return "#f87171";
  };

  const [primaryColor, setPrimaryColorState] = useState(getInitialColor);

  // Update CSS variable when color changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty("--color-primary", primaryColor);
      
      // Calculate darker shade for primary-dark
      const darkerShade = shadeColor(primaryColor, -20);
      root.style.setProperty("--color-primary-dark", darkerShade);
    }
  }, [primaryColor]);

  const setPrimaryColor = (color) => {
    setPrimaryColorState(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem("theme_color", color);
    }
  };

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

