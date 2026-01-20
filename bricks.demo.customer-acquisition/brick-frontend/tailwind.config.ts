import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // Habilita el modo oscuro basado en clase CSS
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brick: {
          offwhite: '#F4F5F7',
          dark: '#2C2C2E',
          orange: {
            DEFAULT: '#FF762F',
            light: '#ff9b66'
          },
          red: {
            DEFAULT: '#FF7A70',
            400: '#FF958D',
            300: '#FFAFA9',
            200: '#FFCAC6',
            100: '#FFE4E2'
          },
          yellow: {
            DEFAULT: '#FEE433',
            400: '#FEE95C',
            300: '#FEEF85',
            200: '#FFF4AD',
            100: '#FFFAD6'
          },
            turquoise: {
              DEFAULT: '#64FFFF',
              400: '#83FFFF',
              300: '#A2FFFF',
              200: '#C1FFFF',
              100: '#E0FFFF'
            },
            green: {
              DEFAULT: '#71E673',
              400: '#8DEB8F',
              300: '#AAF0AB',
              200: '#C6F5C7',
              100: '#E3FAE3'
            }
        }
      },
      fontFamily: {
        display: ['Rubik', 'ui-sans-serif', 'system-ui'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular']
      },
      fontSize: {
        h1: ['40px', { lineHeight: '1.1', fontWeight: '900' }],
        h2: ['30px', { lineHeight: '1.15', fontWeight: '700' }],
        subtitle: ['21px', { lineHeight: '1.2', fontWeight: '700' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.3', fontWeight: '200' }]
      }
    }
  },
  plugins: []
}

export default config
