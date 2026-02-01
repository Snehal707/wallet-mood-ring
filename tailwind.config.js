/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'builder': '#2b6cff',
        'degen': '#ff2e88',
        'collector': '#8a5cff',
        'bridge': '#00c2b8',
        'quiet': '#c7cbd1',
      },
    },
  },
  plugins: [],
}
