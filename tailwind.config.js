/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
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
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-scale': 'bounce-scale 2s ease-in-out infinite',
      },
      keyframes: {
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'bounce-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' }
        }
      }
    },
  },
  plugins: [],
};