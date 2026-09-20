/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#FF9933',
          dark: '#E67E00',
          light: '#FFF0DE'
        },
        govgreen: {
          DEFAULT: '#138808',
          dark: '#0D6005',
          light: '#E6F4EA'
        },
        navy: {
          DEFAULT: '#000080',
          dark: '#00004D',
          light: '#E6E6FF'
        },
        ashoka: '#06038D',
        govtbg: '#F8F9FA'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif']
      }
    },
  },
  plugins: [],
}
