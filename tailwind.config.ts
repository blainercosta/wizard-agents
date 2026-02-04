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
          primary: '#0D0A1A',
          secondary: '#1A1625',
          tertiary: '#252033',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B8B5C4',
          muted: '#6B6880',
        },
        accent: {
          lilac: '#A78BFA',
          neon: '#39FF14',
        },
        border: {
          DEFAULT: '#3D3654',
          hover: '#A78BFA',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'pixel': '4px 4px 0 0 #3D3654',
        'pixel-hover': '4px 4px 0 0 #A78BFA',
        'pixel-neon': '4px 4px 0 0 #39FF14',
      },
    },
  },
  plugins: [],
};
export default config;
