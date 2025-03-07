/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5F3E8',
          dark: '#EAE7D6'
        },
        olive: {
          light: '#A4A68C',
          DEFAULT: '#6B705C',
          dark: '#565A47'
        },
        sage: {
          DEFAULT: '#8B956D',
          dark: '#6F784F'
        }
      }
    },
  },
  plugins: [],
};