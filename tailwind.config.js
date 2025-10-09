/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/pages/**/*.{ts,tsx}', // om du har pages-folder
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        baloo: ['"Baloo 2"', 'cursive'],
      },

      colors: {
        champagne: '#fdf3e7',
      },
    },
  },
  plugins: [],
}
