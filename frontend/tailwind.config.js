/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf9',
          100: '#d1faef',
          400: '#2bb5a0',
          500: '#168a7a',
          600: '#0f6c61',
          700: '#0b524b'
        }
      },
      boxShadow: {
        soft: '0 14px 36px rgba(15, 35, 45, 0.09)',
        lift: '0 20px 45px rgba(15, 108, 97, 0.16)'
      }
    }
  },
  plugins: []
}
