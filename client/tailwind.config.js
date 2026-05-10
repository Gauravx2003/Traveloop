/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Odoo-inspired blue for the Traveloop brand
        primary: {
          DEFAULT: "#00A09D",
          dark: "#008784",
        },
      },
    },
  },
  plugins: [],
};
