import type { Config } from 'tailwindcss'
// Fix: Replaced CommonJS 'require' with ES module 'import'.
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'background': '#101010',
        'surface': '#1C1C1E',
        'primary': '#0A84FF',
        'secondary': '#3A3A3C',
        'text-primary': '#FFFFFF',
        'text-secondary': '#8E8E93',
        'border': '#38383A',
      },
    },
  },
  plugins: [
    typography,
  ],
}
export default config
