/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:     '#050505',
        surface:  '#0D0D0D',
        elevated: '#141414',
        overlay:  '#1A1A1A',
        green:    '#00FF41',
        'green-dim': '#00CC33',
        blue:     '#007AFF',
        'blue-dim': '#0062CC',
      },
      fontFamily: {
        sans: ["'Inter'", "'SF Pro Display'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card:      '0 1px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.7)',
        'green-glow': '0 0 0 2px rgba(0,255,65,0.15)',
        'blue-glow':  '0 0 0 2px rgba(0,122,255,0.15)',
        modal:     '0 24px 64px rgba(0,0,0,0.9)',
      },
    },
  },
  plugins: [],
}
