'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  accentColor: '#3b82f6',
  setAccentColor: () => {},
  backgroundPreset: 'constellation',
  setBackgroundPreset: () => {},
  animationSpeed: 1.0,
  setAnimationSpeed: () => {},
  mounted: false
});

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  defaultAccent = '#3b82f6',
  defaultBgPreset = 'constellation',
  defaultSpeed = 1.0
}) {
  const [theme, setThemeState] = useState(defaultTheme);
  const [accentColor, setAccentState] = useState(defaultAccent);
  const [backgroundPreset, setBgPresetState] = useState(defaultBgPreset);
  const [animationSpeed, setAnimSpeedState] = useState(defaultSpeed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('portfolio-theme') || defaultTheme;
    const savedAccent = localStorage.getItem('portfolio-accent') || defaultAccent;
    const savedBg = localStorage.getItem('portfolio-bg-preset') || defaultBgPreset;
    const savedSpeed = parseFloat(localStorage.getItem('portfolio-anim-speed')) || defaultSpeed;
    setThemeState(savedTheme);
    setAccentState(savedAccent);
    setBgPresetState(savedBg);
    setAnimSpeedState(savedSpeed);
  }, [defaultTheme, defaultAccent, defaultBgPreset, defaultSpeed]);

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

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('portfolio-bg-preset', backgroundPreset);
  }, [backgroundPreset, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('portfolio-anim-speed', animationSpeed);
  }, [animationSpeed, mounted]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const setAccentColor = (newAccent) => {
    setAccentState(newAccent);
  };

  const setBackgroundPreset = (newPreset) => {
    setBgPresetState(newPreset);
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio-bg-preset', newPreset);
    }
  };

  const setAnimationSpeed = (newSpeed) => {
    setAnimSpeedState(newSpeed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio-anim-speed', newSpeed);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        accentColor,
        setAccentColor,
        backgroundPreset,
        setBackgroundPreset,
        animationSpeed,
        setAnimationSpeed,
        mounted
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
