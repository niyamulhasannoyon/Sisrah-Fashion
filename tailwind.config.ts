import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#A31F24',
          dark: '#8B1A1E',
          light: '#C42B30',
          subtle: 'rgba(163, 31, 36, 0.08)',
        },
        editorial: {
          dark: '#111113',
          card: '#18181B',
          muted: '#27272A',
          border: '#3F3F46',
        },
        surface: {
          DEFAULT: '#FAFAFA',
          paper: '#FFFFFF',
          dark: '#121214',
          subtle: '#F4F4F5',
        },
        loomra: {
          red: '#A31F24',
          black: '#1A1A1A',
          white: '#FFFFFF',
          surface: '#F9F9F9',
          muted: '#777777'
        }
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        bengali: ['var(--font-hind-siliguri)', 'sans-serif']
      },
      fontSize: {
        heading: ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'product-title': ['1.75rem', { lineHeight: '2rem', fontWeight: '500' }],
        price: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        body: ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        small: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }]
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 25px rgba(163, 31, 36, 0.25)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          md: '2rem',
          lg: '4rem'
        }
      }
    }
  },
  plugins: []
};

export default config;

