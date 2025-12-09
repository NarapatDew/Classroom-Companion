/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',     // White
        surface: '#ffffff',        // White for cards
        primary: '#1967d2',        // Google Blue
        secondary: '#e8f0fe',      // Light Blue (Selections)
        accent: '#188038',         // Google Green
        warning: '#f29900',        // Google Yellow
        error: '#d93025',          // Google Red
        text: '#3c4043',           // Google Dark Gray
        muted: '#5f6368',          // Google Gray
        border: '#dadce0',         // Light Border
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'Arial', 'sans-serif'],
        display: ['"Google Sans"', 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        'card-hover': '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
      },
    },
  },
  plugins: [],
}
