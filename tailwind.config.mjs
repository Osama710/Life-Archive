/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        "primary-dark": "#6D28D9",
        accent: "#FF6B6B",
        mint: "#34D399",
        cream: "#FDF8F3",
        ink: "#1A1625",
        warm: "#F97316",
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ['var(--font-sans)', "Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ['var(--font-display)', "Outfit", "system-ui", "sans-serif"],
        serif: ['var(--font-display)', "Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(26, 22, 37, 0.06)",
        lift: "0 12px 40px rgba(124, 58, 237, 0.15)",
        glow: "0 0 40px rgba(124, 58, 237, 0.2)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-12px) scale(1.04)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
