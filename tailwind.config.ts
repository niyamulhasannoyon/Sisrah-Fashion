import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        loomra: {
          red: '#A31F24',
          black: '#1A1A1A',
          white: '#FFFFFF',
          surface: '#F9F9F9',
          muted: '#777777'
        }
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'sans-serif'],
        bengali: ['var(--font-hind-siliguri)', 'sans-serif']
      },
      fontSize: {
        heading: ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'product-title': ['1.75rem', { lineHeight: '2rem', fontWeight: '500' }],
        price: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        body: ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        small: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }]
      },
      spacing: {
        '8px': '0.5rem',
        '16px': '1rem',
        '24px': '1.5rem',
        '32px': '2rem',
        '40px': '2.5rem',
        '48px': '3rem',
        '64px': '4rem'
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
