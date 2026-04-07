/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#e8eaf0',
        'surface-hover': '#e1e3e9',
        main: '#37392d',
        muted: '#646657',
        primary: '#707d40',
        'primary-dark': '#5a6533',
        secondary: '#8b753b',
      }
    },
  },
  plugins: [],
}


