import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#08090a',
          secondary: '#0f1011',
          tertiary: '#191a1b',
          elevated: '#28282c',
        },
        text: {
          primary: '#f7f8f8',
          secondary: '#d0d6e0',
          muted: '#8a8f98',
          subtle: '#62666d',
        },
        accent: {
          brand: '#5e6ad2',
          lilac: '#7170ff',
          hover: '#828fff',
          neon: '#10b981',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          subtle: 'rgba(255,255,255,0.05)',
          solid: '#23252a',
          hover: '#7170ff',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        pixel: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '510',
        semibold: '590',
      },
      letterSpacing: {
        display: '-0.022em',
        tight: '-0.011em',
      },
      borderRadius: {
        none: '0',
        micro: '2px',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '22px',
        full: '9999px',
      },
      boxShadow: {
        ring: 'rgba(0,0,0,0.2) 0px 0px 0px 1px',
        elevated: 'rgba(0,0,0,0.4) 0px 2px 4px',
        focus: 'rgba(0,0,0,0.1) 0px 4px 12px',
      },
    },
  },
  plugins: [],
};
export default config;
