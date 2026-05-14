import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#FFFFFF',
          secondary: '#F5F5F7',
          tertiary: '#FAFAFA',
          card: '#FFFFFF',
          'card-hover': '#FAFAFA',
        },
        text: {
          primary: '#1D1D1F',
          secondary: '#6E6E73',
          muted: '#86868B',
        },
        accent: {
          DEFAULT: '#0071E3',
          hover: '#0077ED',
        },
        border: {
          DEFAULT: 'rgba(0,0,0,0.08)',
          hover: 'rgba(0,0,0,0.12)',
        },
        notion: {
          primary: '#5645d4',
          'primary-pressed': '#4534b3',
          ink: '#1a1a1a',
          charcoal: '#37352f',
          slate: '#5d5b54',
          steel: '#787671',
          stone: '#a4a097',
          muted: '#bbb8b1',
          hairline: '#e5e3df',
          'hairline-soft': '#ede9e4',
          'hairline-strong': '#c8c4be',
          surface: '#f6f5f4',
          canvas: '#ffffff',
          'tint-lavender': '#e6e0f5',
          'tint-peach': '#ffe8d4',
          'tint-mint': '#d9f3e1',
          'tint-rose': '#fde0ec',
          'tint-sky': '#dcecfa',
          'tint-yellow': '#fef7d6',
          'brand-purple-800': '#391c57',
          'brand-orange-deep': '#793400',
          'brand-green': '#1aae39',
          'link-blue': '#0075de',
        },
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'PingFang SC',
          'system-ui',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '1024px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
