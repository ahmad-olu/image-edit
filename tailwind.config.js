/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        dots: 'dots 1s steps(3, end) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        dots: {
          '0%, 20%': { content: '"   "' },
          '50%': { content: '".  "' },
          '100%': { content: '"..."' },
        },
      },
    },
  },
  plugins: [],
};
