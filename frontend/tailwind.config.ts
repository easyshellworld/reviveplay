import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dot-pink': '#E6007A',
        'dot-purple': '#6D3AEE',
        'neon-green': '#00FFA3',
        'bg-void': '#070A10',
        'bg-card': '#111823',
      },
      fontFamily: {
        'syne': ['Syne', 'sans-serif'],
        'mono': ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
