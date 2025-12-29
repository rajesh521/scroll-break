/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream: '#F9F6F3',
        lavender: '#F5F3FF',
        offWhite: '#FEFDFB',
        coral: '#FF6B6B',
        sunnyYellow: '#FFD93D',
        softBlue: '#6BCFFF',
        mintGreen: '#7FE5A8',
        brightPurple: '#A78BFA',
        brightPink: '#FF8DC7',
        brightOrange: '#FFA94D',
        charcoal: '#3A3A3A',
        deepPurple: '#5B4B8A',
      },
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        spaceMono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
