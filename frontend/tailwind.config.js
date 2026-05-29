export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      colors: { night: '#080b12', panel: '#0d1320', gold: '#f8c46b', cyan: '#33d6ff' },
      boxShadow: { premium: '0 24px 80px rgba(0,0,0,.45)' }
    }
  },
  plugins: []
};
