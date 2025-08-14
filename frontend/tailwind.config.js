/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Orange Brand Integration
        'gems-orange': '#f29213',
        'gems-orange-hover': '#ff7b2d',
        'gems-orange-pressed': '#d97706',
        
        // Dark Theme Colors
        'dark-bg': '#0d1117',
        'dark-surface': '#161b22',
        'dark-card': '#21262d',
        'dark-border': '#30363d',
        'dark-text': '#ffffff',
        'dark-text-secondary': '#8b949e',
        
        // Light Theme Colors
        'light-bg': '#ffffff',
        'light-surface': '#f6f8fa',
        'light-border': '#d0d7de',
        'light-text': '#24292f',
        'light-text-secondary': '#656d76',
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #f29213 0%, #ff6b35 100%)',
        'orange-gradient-alt': 'linear-gradient(45deg, #f29213, #ffa726)',
        'orange-gradient-subtle': 'linear-gradient(90deg, rgba(242, 146, 19, 0.1), rgba(242, 146, 19, 0.3))',
      },
      boxShadow: {
        'neumorph-light': '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
        'neumorph-dark': '5px 5px 10px rgba(0, 0, 0, 0.3), -5px -5px 10px rgba(255, 255, 255, 0.05)',
        'neumorph-inset-light': 'inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #ffffff',
        'neumorph-inset-dark': 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.05)',
        'card-light': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-orange': 'pulse-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'bounce-small': 'bounce-small 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-orange': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(242, 146, 19, 0.3)' },
          '50%': { boxShadow: '0 0 0 12px rgba(242, 146, 19, 0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' }
        },
        'bounce-small': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter',
      },
      transitionDuration: {
        'theme': '300ms',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}