import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage or default to preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-xl bg-gray-100 dark:bg-[#16171d] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2e303a] border border-gray-200 dark:border-gray-700 transition-all active:scale-95 shadow-sm flex items-center justify-center"
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme mode"
    >
      {darkMode ? (
        <Sun size={18} className="text-yellow-500 fill-yellow-500 animate-pulse" />
      ) : (
        <Moon size={18} className="text-indigo-600 fill-indigo-100" />
      )}
    </button>
  );
};

export default ThemeToggle;
