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
        // 4 Studio Pigments from User Palette (Image 3)
        nectarine: {
          50: '#FDF6F5',
          100: '#F9EBE9',
          200: '#F4D4D0',
          300: '#EEB5AE',
          400: '#E49C93',
          500: '#D7897F', // Primary Nectarine (Warm Terracotta / Rose)
          600: '#BE6F65',
          700: '#9F574E',
          800: '#80423B',
          900: '#64312B',
        },
        peche: {
          50: '#FEF9F0',
          100: '#FDF1DC',
          200: '#FBE3B8',
          300: '#FBD590',
          400: '#FAC76E',
          500: '#F9B95C', // Primary Pêche (Golden Peach / Amber)
          600: '#E29A3A',
          700: '#BF7A21',
          800: '#9C5F16',
          900: '#7E4B0E',
        },
        menthe: {
          50: '#F2F9F6',
          100: '#E2F2EB',
          200: '#C7E4D6',
          300: '#BCDFC9',
          400: '#A8D3BC',
          500: '#96C7B3', // Primary Menthe (Fresh Sage / Mint Green)
          600: '#74AD98',
          700: '#568F7B',
          800: '#3D7160',
          900: '#2A5547',
        },
        lagune: {
          50: '#F1F7F9',
          100: '#DEEDF2',
          200: '#BDDBE5',
          300: '#9CC4D3',
          400: '#7EAEC0',
          500: '#6398A9', // Primary Lagune (Deep Lagoon / Teal Blue)
          600: '#4C7F90',
          700: '#396675',
          800: '#284F5C',
          900: '#1B3B46',
        },
        // Webbble Reference Dark Theme (Sharon Ahmed Shot)
        webbble: {
          dark: '#181B20',
          darker: '#131519',
          card: '#22262E',
          border: '#2C323D',
          hover: '#282E38',
        },
        // Studio Canvas Backgrounds
        canvas: {
          cream: '#FAF7F5',
          warm: '#F7F4F0',
          border: '#ECE7E3',
        },
        // Keep brand blue compatible
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c90eb',
          600: '#0272c9',
          700: '#025ba3',
          800: '#064d86',
          900: '#0b416f',
          950: '#072a4a',
        },
        slate: {
          850: '#172033',
          950: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'typing-hands': 'typingHands 0.8s ease-in-out infinite alternate',
        'screen-glow': 'screenGlow 2.5s ease-in-out infinite',
        'particle-float': 'particleFloat 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'gentle-breathe': 'gentleBreathe 4s ease-in-out infinite',
        'contour-wave': 'contourWave 12s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        typingHands: {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-2px) rotate(1deg)' },
          '100%': { transform: 'translateY(1.5px) rotate(-1deg)' },
        },
        screenGlow: {
          '0%, 100%': { opacity: 0.45, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.05)' },
        },
        particleFloat: {
          '0%': { opacity: 0, transform: 'translateY(8px) scale(0.8)' },
          '20%': { opacity: 1, transform: 'translateY(0px) scale(1)' },
          '80%': { opacity: 0.9, transform: 'translateY(-16px) scale(0.95)' },
          '100%': { opacity: 0, transform: 'translateY(-24px) scale(0.9)' },
        },
        gentleBreathe: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        contourWave: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.08) translate(-2%, -2%)' },
        }
      }
    },
  },
  plugins: [],
}
