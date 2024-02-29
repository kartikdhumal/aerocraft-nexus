/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '300px',  
        'vsm': {'min': '345px', 'max': '440px'}
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio')
  ],
}
