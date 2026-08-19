/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: '#0f0c29',
          deep: '#1b1446',
          surface: '#24195a',
          accent: '#a855f7',
          pink: '#ec4899',
          cyan: '#38bdf8',
          text: '#f3e8ff',
          muted: '#94a3b8',
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(to bottom right, #0f0c29, #1a0b2e, #240046)',
        'cosmic-card': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'purple-glow': 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'cosmic-glow': '0 0 25px -5px rgba(168, 85, 247, 0.3)',
        'pink-glow': '0 0 25px -5px rgba(236, 72, 153, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
