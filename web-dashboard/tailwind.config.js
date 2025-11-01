/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        critical: '#D32F2F',
        high: '#F57C00',
        medium: '#FBC02D',
        low: '#388E3C',
        safe: '#4CAF50',
        warning: '#FF9800',
        danger: '#F44336',
        primary: '#1976D2',
        secondary: '#DC004E',
        card: '#ffffff',
        border: '#cccccc',
      },
      fontSize: {
        'xs': '0.8em',
        'sm': '0.9em',
        'base': '1em',
        'lg': '1.2em',
        'xl': '1.5em',
      },
      spacing: {
        'xs': '8px',
        'sm': '15px',
        'md': '20px',
      },
      borderRadius: {
        'md': '8px',
      },
      boxShadow: {
        'md': '0 2px 4px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}
