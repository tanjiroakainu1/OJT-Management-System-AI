/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'shadow-candy',
    'shadow-galaxy',
    'shadow-card',
    'font-candy',
    'font-display',
    'animate-shimmer',
    'animate-float',
    'animate-pulseGlow',
    'bg-galaxy-gradient',
    'bg-candy-gradient',
    'candy-title',
  ],
  theme: {
    extend: {
      screens: {
        xs: '475px',
      },
      colors: {
        galaxy: {
          deep: '#0b0a1a',
          mid: '#12102a',
          card: '#1a1535',
          panel: '#221b4a',
        },
        candy: {
          pink: '#f472b6',
          magenta: '#e879f9',
          purple: '#a855f7',
          violet: '#8b5cf6',
          grape: '#7c3aed',
          mint: '#67e8f9',
          cream: '#f5f3ff',
        },
      },
      fontFamily: {
        candy: ['Fredoka', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        candy: '0 0 24px rgba(168, 85, 247, 0.35)',
        galaxy: '0 0 32px rgba(103, 232, 249, 0.2)',
        card: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 1px rgba(168, 85, 247, 0.4)',
      },
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' },
          '50%': { boxShadow: '0 0 32px rgba(232, 121, 249, 0.5)' },
        },
      },
      backgroundImage: {
        'galaxy-gradient':
          'radial-gradient(ellipse at 20% 0%, rgba(168, 85, 247, 0.35) 0%, transparent 45%), radial-gradient(ellipse at 80% 100%, rgba(244, 114, 182, 0.2) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(103, 232, 249, 0.08) 0%, transparent 60%), linear-gradient(180deg, #0b0a1a 0%, #12102a 50%, #0b0a1a 100%)',
        'candy-gradient': 'linear-gradient(135deg, #a855f7 0%, #e879f9 50%, #f472b6 100%)',
      },
    },
  },
  plugins: [],
};
