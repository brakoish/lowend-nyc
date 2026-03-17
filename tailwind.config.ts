import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'page-bg': '#000000',
        'card-bg': '#0A0A0A',
        'border': '#2A2A2A',
        'text-primary': '#FFFFFF',
        'text-secondary': '#999999',
        'accent-red': '#E30614',
      },
      fontFamily: {
        'display': ['var(--font-jost)', 'sans-serif'],
        'body': ['var(--font-inter)', 'sans-serif'],
        'mono': ['var(--font-jetbrains)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
