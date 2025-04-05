/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFD700', // Gold
        secondary: '#1a1a1a', // Black
        accent: '#FFC000', // Darker gold for hover states
      },
    },
  },
  plugins: [],
};