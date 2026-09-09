'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  accentColor: '#3b82f6',
  setAccentColor: () => {}
});

export function ThemeProvider({ children, defaultTheme = 'dark', defaultAccent = '#3b82f6' }) {
  const [theme, setThemeState] = useState(defaultTheme);
  const [accentColor, setAccentState] = useState(defaultAccent);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('portfolio-theme') || defaultTheme;
    const savedAccent = localStorage.getItem('portfolio-accent') || defaultAccent;
    setThemeState(savedTheme);
    setAccentState(savedAccent);
  }, [defaultTheme, defaultAccent]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('portfolio-theme', theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('portfolio-accent', accentColor);
    document.documentElement.style.setProperty('--user-accent', accentColor);
  }, [accentColor, mounted]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const setAccentColor = (newAccent) => {
    setAccentState(newAccent);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
