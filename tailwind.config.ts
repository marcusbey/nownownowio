import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        spin: {
          from: {
            transform: 'translate(-50%, -50%) rotate(0deg)',
          },
          to: {
            transform: 'translate(-50%, -50%) rotate(360deg)',
          },
        },
      },
      animation: {
        'slowly-spin': 'spin 20s linear infinite',
        'slowly-spin-reverse': 'spin 25s linear infinite reverse',
      },
    },
  },
  plugins: [],
}
export default config
