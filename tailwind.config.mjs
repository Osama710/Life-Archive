/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B6FD4',
        'primary-dark': '#2F5BB8',
        warm: '#F97316',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        cream: '#FAF8F5',
        ink: '#1C1917',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Source Sans 3', 'sans-serif'],
        serif: ['var(--font-display)', 'Fraunces', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(28,25,23,0.08)',
        lift: '0 10px 24px rgba(28,25,23,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
