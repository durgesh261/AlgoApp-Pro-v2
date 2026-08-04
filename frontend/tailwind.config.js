/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0B0E14',
          root: '#0E121A',
          app: '#121722',
          surface1: '#161D2A',
          surface2: '#1E2638',
          surface3: '#28334A',
        },
        trade: {
          buy: '#00C896',
          sell: '#F6465D',
          accent: '#3B82F6',
          warning: '#F59E0B',
        },
        border: {
          subtle: '#1E293B',
          strong: '#334155',
          focus: '#3B82F6',
          accent: '#60A5FA',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
