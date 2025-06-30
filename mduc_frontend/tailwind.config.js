/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ✅ All React source files
    "./public/index.html", // 🔄 Optional: include if using public HTML
  ],
  theme: {
    extend: {
      colors: {
        primary: "#003366", // 💙 Custom primary color if needed
      },
    },
  },
  plugins: [],
};
