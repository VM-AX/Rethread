/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f4',
          100: '#e0efe4',
          200: '#c2dfc9',
          300: '#93c6a2',
          400: '#5fa675',
          500: '#3d8757',
          600: '#2c6c43',
          700: '#245737',
          800: '#20452e',
          900: '#1b3a27',
        },
        clay: {
          50: '#fbf6f1',
          100: '#f4e8dc',
          500: '#c07a4c',
          600: '#a5613a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
      },
    },
  },
  plugins: [],
};
