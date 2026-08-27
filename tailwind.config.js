/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        uswds: {
          primary: '#005EA2',
          secondary: '#1A4480',
          success: '#2E8540',
          warning: '#FFBE2E',
          danger: '#D83933',
          background: '#F9FAFB',
          card: '#FFFFFF',
          border: '#D9E2EC',
          text: '#1B1B1B',
          textMuted: '#5C5C5C',
        }
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '4px',
      },
      fontFamily: {
        sans: ['Inter', 'Public Sans', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'Public Sans', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
