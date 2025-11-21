/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#020826',
        indigo: {
          light: '#818cf8',
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        lavender: {
          light: '#e9d5ff',
          DEFAULT: '#a78bfa',
          dark: '#8b5cf6',
        },
        mint: {
          light: '#a7f3d0',
          DEFAULT: '#6ee7b7',
        },
        blush: {
          light: '#fce7f3',
          DEFAULT: '#f9a8d4',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px)', 
            opacity: '0.5' 
          },
          '50%': { 
            transform: 'translateY(-25px) translateX(5px)', 
            opacity: '0.9' 
          },
        },
        floatSlow: {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px)', 
            opacity: '0.4' 
          },
          '33%': { 
            transform: 'translateY(-35px) translateX(15px)', 
            opacity: '0.7' 
          },
          '66%': { 
            transform: 'translateY(-20px) translateX(-8px)', 
            opacity: '0.6' 
          },
        },
        twinkle: {
          '0%, 100%': { 
            opacity: '0.5', 
            transform: 'scale(1)' 
          },
          '50%': { 
            opacity: '1', 
            transform: 'scale(1.5)' 
          },
        },
        bubble: {
          '0%': { 
            transform: 'translateY(0) scale(0.4)', 
            opacity: '0' 
          },
          '3%': { 
            opacity: '0.6' 
          },
          '50%': { 
            opacity: '0.9' 
          },
          '97%': { 
            opacity: '0.6' 
          },
          '100%': { 
            transform: 'translateY(-110vh) scale(1.3)', 
            opacity: '0' 
          },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        floatSlow: 'floatSlow 8s ease-in-out infinite',
        twinkle: 'twinkle 2s ease-in-out infinite',
        bubble: 'bubble 15s linear infinite',
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.6s ease-out',
      },
    },
  },
  plugins: [],
}

