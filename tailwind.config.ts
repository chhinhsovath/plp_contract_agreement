import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'khmer': ['Noto Sans Khmer', 'Khmer OS', 'sans-serif'],
      },
      colors: {
        primary: '#1890ff',
        secondary: '#52c41a',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}
export default config