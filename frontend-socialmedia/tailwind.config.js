/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'twitter-blue': '#1d9bf0',
        'twitter-blue-hover': '#1a8cd8',
        'twitter-bg': '#000000',
        'twitter-search-bg': '#202327',
        'twitter-border': '#2f3336',
        'twitter-card': '#16181c',
        'twitter-text': '#e7e9ea',
        'twitter-text-secondary': '#71767b',
        'twitter-red': '#f4212e',
        'twitter-green': '#00ba7c'
      }
    },
  },
  plugins: [],
};
