/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'Georgia', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'vintage': {
          'cream': '#FDF8F1',
          'paper': '#F7F1E8',
          'beige': '#F0E6D2',
          'tan': '#E6D7C3',
          'brown': {
            50: '#FAF7F0',
            100: '#F5EFE0',
            200: '#E8D5B7',
            300: '#DDBF94',
            400: '#C8A882',
            500: '#B8956A',
            600: '#9D7F56',
            700: '#7D6444',
            800: '#5D4A33',
            900: '#3C2A1E',
          },
          'amber': {
            50: '#FFFDF7',
            100: '#FEF9E7',
            200: '#FDF2D1',
            300: '#FCE7A6',
            400: '#F9D773',
            500: '#F4C430',
            600: '#D2A441',
            700: '#B8956A',
            800: '#8B7355',
            900: '#6B5B47',
          }
        }
      },
      boxShadow: {
        'vintage': '0 4px 20px rgba(139, 115, 85, 0.15)',
        'vintage-lg': '0 8px 30px rgba(139, 115, 85, 0.2)',
        'book': '0 2px 10px rgba(60, 42, 30, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}