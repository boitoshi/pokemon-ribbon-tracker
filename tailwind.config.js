/** @type {import('tailwindcss').Config} */
module.exports = {
  // contentセクション - Vueファイルなどを指定
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
    "./plugins/**/*.{js,ts}",
    "./assets/**/*.{css,js}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

