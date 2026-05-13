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
