/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          black: '#02040a',
          slate: '#0a0f1d',
          accent: '#ffffff',
        }
      },
    },
  },
  plugins: [],
}
