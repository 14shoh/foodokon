/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#ff6b35',
          light: '#ff8c5a',
          dark: '#e55a24',
        },
        violet: {
          DEFAULT: '#6c63ff',
          light: '#8b85ff',
        },
        glass: {
          bg: 'rgba(255,255,255,0.08)',
          border: 'rgba(255,255,255,0.15)',
          hover: 'rgba(255,255,255,0.12)',
        },
      },
      backgroundImage: {
        'main-gradient': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(108,99,255,0.15) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #ff6b35, #6c63ff)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
