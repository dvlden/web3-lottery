const colors = require('tailwindcss/colors')

delete colors.lightBlue

module.exports = {
  purge: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
