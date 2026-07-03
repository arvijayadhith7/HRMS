/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F3F4F6",
        surface: "#FFFFFF",
        primary: "#111827",
        "primary-dark": "#030712",
        secondary: "#6B7280",
        success: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        border: "#E5E7EB",
        "border-dark": "#9CA3AF",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
