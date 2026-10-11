/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
    // HeroUI component + theme sources (nested under @heroui/react in this install).
    // Without these, Tailwind never generates HeroUI utilities (bg-content1,
    // bg-primary, border-default-*, ...) and every HeroUI component looks unstyled.
    './node_modules/@heroui/**/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
    },
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              50: '#eef2ff',
              100: '#e0e7ff',
              200: '#c7d2fe',
              300: '#a5b4fc',
              400: '#818cf8',
              500: '#6366f1',
              600: '#4f46e5',
              700: '#4338ca',
              800: '#3730a3',
              900: '#312e81',
              DEFAULT: '#4f46e5',
              foreground: '#ffffff',
            },
          },
        },
      },
    }),
  ],
};
