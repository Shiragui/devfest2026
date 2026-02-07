/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mint': '#98FF98',
        'mint-dark': '#7AE87A',
        'mint-light': '#B5FFB5',
      },
    },
  },
  plugins: [],
}
