import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="fixed top-4 right-4 z-50 p-2 rounded-full transition-all duration-300
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gems-orange
        theme-transition group"
    >
      <div className="relative w-12 h-6 bg-gray-200 rounded-full 
        dark:bg-dark-card flex items-center p-1 theme-transition">
        <div 
          className={`absolute w-5 h-5 rounded-full transition-transform duration-400 
            transform ${theme === 'dark' ? 'translate-x-6 bg-dark-surface' : 'translate-x-0 bg-white'}`}
        />
        <Sun 
          className={`h-4 w-4 text-gems-orange transition-all duration-300
            ${theme === 'light' ? 'opacity-100' : 'opacity-30'}`}
        />
        <Moon 
          className={`ml-auto h-4 w-4 text-gems-orange transition-all duration-300
            ${theme === 'dark' ? 'opacity-100' : 'opacity-30'}`}
        />
      </div>
      <span className="absolute -bottom-8 right-0 opacity-0 bg-dark-card dark:bg-light-card
        text-dark-text dark:text-light-text rounded px-2 py-1 text-xs transform transition-all
        group-hover:opacity-100 pointer-events-none whitespace-nowrap">
        {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
