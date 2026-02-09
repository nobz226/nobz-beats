/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#1c1c1c',
        white: '#c8c8c8',
        grey: 'rgba(255, 255, 255, 0.03)',
      },
      fontFamily: {
        'cutive': ['"Cutive Mono"', 'monospace'],
        'cal-sans': ['"Cal Sans"', 'system-ui'],
        'doto': ['"Doto"', 'sans-serif'],
        'rubik': ['"Rubik 80s Fade"', 'system-ui'],
      },
      keyframes: {
        'nav-slide': {
          from: { opacity: '0', transform: 'translateX(-0.75rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'logo-fade': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'title-drop': {
          from: { opacity: '0', transform: 'translateY(calc(-50% - 1.125rem)) rotate(90deg)' },
          to: { opacity: '1', transform: 'translateY(-50%) rotate(90deg)' },
        },
        'section-fade': {
          from: { opacity: '0', transform: 'translateY(0.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'player-drop': {
          from: { opacity: '0', transform: 'translateY(0.75rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'playlist-slide': {
          from: { opacity: '0', transform: 'translateX(1.25rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'cover-rotate': {
          from: { transform: 'rotate(0)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'nav-slide': 'nav-slide 0.6s cubic-bezier(0.22, 0.8, 0.25, 1) forwards',
        'logo-fade': 'logo-fade 0.6s cubic-bezier(0.22, 0.8, 0.25, 1) forwards',
        'title-drop': 'title-drop 0.6s cubic-bezier(0.22, 0.8, 0.25, 1) forwards',
        'section-fade': 'section-fade 0.6s cubic-bezier(0.22, 0.8, 0.25, 1) forwards',
        'player-drop': 'player-drop 0.5s cubic-bezier(0.22, 0.8, 0.25, 1) forwards',
        'playlist-slide': 'playlist-slide 0.5s cubic-bezier(0.22, 0.8, 0.25, 1) forwards',
        'cover-rotate': 'cover-rotate 1s linear infinite',
      },
    },
  },
  plugins: [],
}

